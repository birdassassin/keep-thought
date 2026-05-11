/**
 * ============================================================
 * Koa.js 教程 - 第6课：进阶主题
 * ============================================================
 *
 * 本文件涵盖以下内容：
 * 1. 日志中间件 —— 自定义请求日志记录
 * 2. 限流（Rate Limiting）—— 使用 koa-ratelimit 限制请求频率
 * 3. Session 管理 —— 使用 koa-session 管理用户会话
 * 4. WebSocket 集成 —— 在 Koa 中集成 WebSocket 通信
 * 5. 部署指南 —— PM2 进程管理 + Nginx 反向代理配置
 *
 * 安装依赖：
 *   npm install koa koa-router koa-bodyparser koa-session
 *   npm install koa-ratelimit   # 限流（需要 Redis）
 *   npm install koa-redis       # Redis 存储（koa-session 和 koa-ratelimit 需要）
 *   npm install ws              # WebSocket 库
 *
 * 注意：限流功能需要 Redis 服务，如果没有 Redis，可以使用内存存储（仅限单进程）
 *
 * 运行方式：node src/examples/06-advanced.js
 * 测试方式：浏览器访问 http://localhost:3000
 * ============================================================
 */

const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
const router = new Router()
const PORT = 3000


// ============================================================
// 1. 日志中间件
// ============================================================
// 日志是生产环境中必不可少的功能，用于：
// - 记录请求信息（方法、路径、状态码、耗时）
// - 错误追踪和调试
// - 性能监控和分析
// - 安全审计
//
// 在实际项目中，推荐使用成熟的日志库：
// - Winston（功能丰富，支持多种传输方式）
// - Pino（高性能，JSON 格式输出）
// - Bunyan（结构化 JSON 日志）
//
// 这里我们实现一个简单的日志中间件来理解其原理。

/**
 * 自定义日志中间件
 *
 * 记录每个请求的详细信息：
 * - 请求时间
 * - 请求方法和路径
 * - 响应状态码
 * - 响应耗时
 * - 客户端 IP
 */
async function loggerMiddleware(ctx, next) {
  // 记录请求开始时间
  const start = Date.now()

  // 获取当前时间字符串
  const now = new Date()
  const timeStr = now.toISOString()

  // 执行后续中间件
  await next()

  // 计算请求耗时
  const duration = Date.now() - start

  // 获取响应状态码
  const status = ctx.status

  // 根据状态码选择日志级别
  let level = 'INFO'
  if (status >= 500) level = 'ERROR'
  else if (status >= 400) level = 'WARN'

  // 获取客户端 IP
  const ip = ctx.ip

  // 获取响应内容长度
  const contentLength = ctx.response.length || '-'

  // 输出日志（实际项目中应该写入文件或发送到日志系统）
  const logMessage = [
    `[${level}]`,
    timeStr,
    `${ctx.method} ${ctx.url}`,
    `→ ${status}`,
    `${duration}ms`,
    `${contentLength}B`,
    `- ${ip}`
  ].join(' ')

  console.log(logMessage)

  // 将日志信息添加到响应头（方便调试，生产环境可以移除）
  ctx.set('X-Response-Time', `${duration}ms`)
  ctx.set('X-Request-Id', generateRequestId())
}

/**
 * 生成简单的请求 ID
 * 用于追踪一个请求在整个系统中的流转
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 错误日志中间件
 * 专门用于记录错误信息
 */
async function errorLoggerMiddleware(ctx, next) {
  try {
    await next()
  } catch (err) {
    // 记录错误日志
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      method: ctx.method,
      url: ctx.url,
      status: err.status || 500,
      error: err.message,
      stack: err.stack,
      ip: ctx.ip,
      requestId: ctx.get('X-Request-Id'),
    }

    console.error('[ERROR]', JSON.stringify(errorLog, null, 2))

    // 重新抛出错误，让后续的错误处理中间件处理
    throw err
  }
}

// 使用 koa-logger（第三方日志中间件）
// 安装：npm install koa-logger
// const logger = require('koa-logger')
// app.use(logger())


// ============================================================
// 2. 限流（Rate Limiting）
// ============================================================
// 限流用于防止恶意请求（如 DDoS 攻击、暴力破解等），
// 限制单个客户端在指定时间内的请求次数。
//
// koa-ratelimit 是常用的限流中间件，支持多种存储后端：
// - Redis（推荐，支持分布式）
// - 内存（仅限单进程）
// - 数据库

/*
// --- 2.1 使用 koa-ratelimit（需要 Redis）---
// 安装：npm install koa-ratelimit koa-redis
//
const ratelimit = require('koa-ratelimit')
const Redis = require('ioredis')

// 创建 Redis 客户端
const redisClient = new Redis({
  host: '127.0.0.1',
  port: 6379,
  // password: 'your-password',  // 如果 Redis 有密码
})

// 全局限流：每个 IP 每分钟最多 100 次请求
app.use(ratelimit({
  db: redisClient,           // Redis 客户端实例
  duration: 60 * 1000,       // 时间窗口：60 秒
  max: 100,                  // 最大请求数
  id: (ctx) => ctx.ip,       // 限流的标识（通常使用 IP）
  errorMessage: '请求过于频繁，请稍后再试',
  disableHeader: false,      // 是否禁用限流相关的响应头
  headers: {
    remaining: 'X-RateLimit-Remaining',   // 剩余请求数
    reset: 'X-RateLimit-Reset',           // 限流重置时间
    total: 'X-RateLimit-Total',           // 总请求数限制
  },
}))

// --- 2.2 路由级别限流 ---
// 对特定路由设置更严格的限流规则

// 登录接口：每个 IP 每分钟最多 5 次尝试（防止暴力破解）
router.post('/api/v1/auth/login', ratelimit({
  db: redisClient,
  duration: 60 * 1000,
  max: 5,
  id: (ctx) => ctx.ip,
  errorMessage: '登录尝试过于频繁，请 1 分钟后再试',
}), async (ctx) => {
  ctx.body = { message: '登录成功' }
})

// --- 2.3 基于用户的限流 ---
// 对已认证的用户进行限流（每个用户独立的限流配额）
router.get('/api/v1/premium', authMiddleware, ratelimit({
  db: redisClient,
  duration: 60 * 1000,
  max: 1000,  // 付费用户更高的限流配额
  id: (ctx) => `user_${ctx.state.user.id}`,  // 使用用户 ID 作为限流标识
}), async (ctx) => {
  ctx.body = { message: '高级功能' }
})
*/

// --- 2.4 简单的内存限流实现（不需要 Redis）---
// 适用于单进程场景，生产环境建议使用 Redis 版本

/**
 * 简单的内存限流器
 *
 * @param {object} options - 配置选项
 * @param {number} options.windowMs - 时间窗口（毫秒）
 * @param {number} options.max - 时间窗口内最大请求数
 * @param {Function} options.idFn - 获取限流标识的函数
 * @returns {Function} Koa 中间件
 */
function simpleRateLimit(options = {}) {
  const {
    windowMs = 60 * 1000,   // 默认 1 分钟
    max = 100,              // 默认 100 次
    idFn = (ctx) => ctx.ip, // 默认按 IP 限流
    message = '请求过于频繁，请稍后再试',
  } = options

  // 存储每个 ID 的请求记录
  // 结构：{ id: { count: number, resetTime: number } }
  const store = new Map()

  // 定期清理过期的记录（防止内存泄漏）
  setInterval(() => {
    const now = Date.now()
    for (const [id, record] of store) {
      if (now > record.resetTime) {
        store.delete(id)
      }
    }
  }, windowMs)

  return async (ctx, next) => {
    const id = idFn(ctx)
    const now = Date.now()

    // 获取或创建记录
    let record = store.get(id)

    // 如果记录不存在或已过期，创建新记录
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      }
      store.set(id, record)
    }

    // 增加请求计数
    record.count++

    // 设置限流相关的响应头
    ctx.set('X-RateLimit-Limit', max)
    ctx.set('X-RateLimit-Remaining', Math.max(0, max - record.count))
    ctx.set('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000))

    // 检查是否超过限制
    if (record.count > max) {
      ctx.status = 429
      ctx.set('Retry-After', Math.ceil((record.resetTime - now) / 1000))
      ctx.body = {
        code: 429,
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
        timestamp: Date.now()
      }
      return
    }

    await next()
  }
}

// 应用全局限流（演示用，限制较宽松）
app.use(simpleRateLimit({
  windowMs: 60 * 1000,
  max: 100,
}))


// ============================================================
// 3. Session 管理
// ============================================================
// Session 用于在服务端存储用户的会话状态。
// 与 JWT（无状态）不同，Session 是有状态的，需要服务端存储会话数据。
//
// Session vs JWT：
// - Session：状态存储在服务端，客户端只保存 Session ID（Cookie）
//   优点：可以主动撤销会话，存储更多数据
//   缺点：需要共享存储（如 Redis）支持多实例部署
//
// - JWT：状态存储在 Token 中，服务端无需存储
//   优点：无状态，天然支持分布式
//   缺点：无法主动撤销（除非使用黑名单），Token 体积较大
//
// 选择建议：
// - 传统 Web 应用（服务端渲染）→ Session
// - 前后端分离应用 / 移动端 API → JWT
// - 需要实时控制用户会话（如强制下线）→ Session

/*
// --- 3.1 使用 koa-session ---
// 安装：npm install koa-session

const session = require('koa-session')

// Session 配置
app.keys = ['some-secret-key-1', 'some-secret-key-2']  // Cookie 签名密钥

app.use(session({
  key: 'koa.sess',              // Cookie 中 Session ID 的键名
  maxAge: 24 * 60 * 60 * 1000,  // Session 有效期：24 小时（毫秒）
  httpOnly: true,                // 禁止客户端 JS 访问 Cookie（安全）
  signed: true,                  // 签名 Cookie（防止篡改）
  rolling: true,                 // 每次请求都刷新 Session 过期时间
  renew: true,                   // 当 Session 快过期时自动续期
  sameSite: 'lax',               // SameSite 策略（防止 CSRF）
  secure: false,                 // 仅 HTTPS 传输（生产环境设为 true）
  // store: new RedisStore(),    // 自定义存储（默认使用内存）
}, app))

// --- 3.2 使用 Session ---

// 设置 Session
router.post('/api/v1/login', async (ctx) => {
  ctx.session.userId = 1
  ctx.session.username = 'admin'
  ctx.session.role = 'admin'
  ctx.session.loginAt = new Date().toISOString()
  ctx.body = { message: '登录成功' }
})

// 读取 Session
router.get('/api/v1/profile', async (ctx) => {
  if (!ctx.session.userId) {
    ctx.status = 401
    ctx.body = { message: '请先登录' }
    return
  }
  ctx.body = {
    userId: ctx.session.userId,
    username: ctx.session.username,
    role: ctx.session.role,
    loginAt: ctx.session.loginAt,
  }
})

// 销毁 Session（退出登录）
router.post('/api/v1/logout', async (ctx) => {
  ctx.session = null  // 销毁 Session
  // 或者使用 ctx.session.destroy()
  ctx.body = { message: '退出登录成功' }
})

// --- 3.3 Session 认证中间件 ---
async function sessionAuthMiddleware(ctx, next) {
  if (!ctx.session || !ctx.session.userId) {
    ctx.status = 401
    ctx.body = { message: '请先登录' }
    return
  }
  ctx.state.user = {
    id: ctx.session.userId,
    username: ctx.session.username,
    role: ctx.session.role,
  }
  await next()
}

// --- 3.4 使用 Redis 存储 Session ---
// 安装：npm install koa-redis ioredis
//
// const RedisStore = require('koa-redis')
// const store = new RedisStore({
//   client: new Redis({
//     host: '127.0.0.1',
//     port: 6379,
//   })
// })
//
// app.use(session({
//   store: store,  // 使用 Redis 存储 Session
//   // ...其他配置
// }, app))
*/


// ============================================================
// 4. WebSocket 集成
// ============================================================
// WebSocket 提供了全双工通信能力，适用于：
// - 实时聊天
// - 实时通知
// - 在线状态
// - 协同编辑
// - 实时数据推送
//
// Koa 本身不内置 WebSocket 支持，但可以与 ws 库配合使用。

/*
// --- 4.1 基本集成方式 ---
// 安装：npm install ws
//
const http = require('http')
const WebSocket = require('ws')

// 方式1：创建独立的 HTTP 服务器
const server = http.createServer(app.callback())
const wss = new WebSocket.Server({ server })

// WebSocket 连接处理
wss.on('connection', (ws, req) => {
  // 获取客户端 IP
  const ip = req.socket.remoteAddress
  console.log(`[WebSocket] 新连接: ${ip}`)

  // 向客户端发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    message: '已连接到 WebSocket 服务器',
    timestamp: Date.now()
  }))

  // 接收客户端消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log(`[WebSocket] 收到消息:`, message)

      // 根据消息类型处理
      switch (message.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
          break

        case 'chat':
          // 广播消息给所有连接的客户端
          broadcast(wss, {
            type: 'chat',
            from: message.from,
            content: message.content,
            timestamp: Date.now()
          })
          break

        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: `未知消息类型: ${message.type}`
          }))
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: '消息格式错误' }))
    }
  })

  // 连接关闭
  ws.on('close', () => {
    console.log(`[WebSocket] 连接断开: ${ip}`)
  })

  // 错误处理
  ws.on('error', (err) => {
    console.error(`[WebSocket] 错误:`, err.message)
  })
})

// 广播消息给所有客户端
function broadcast(wss, message) {
  const data = JSON.stringify(message)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

// 使用 server.listen 代替 app.listen
server.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`)
  console.log(`WebSocket 服务已启动: ws://localhost:${PORT}`)
})

// --- 4.2 路径区分 ---
// 如果需要让 WebSocket 和 HTTP 共用同一个端口，但使用不同路径：

const wssChat = new WebSocket.Server({ noServer: true })
const wssNotify = new WebSocket.Server({ noServer: true })

server.on('upgrade', (req, socket, head) => {
  const { pathname } = new URL(req.url, 'ws://localhost')

  if (pathname === '/ws/chat') {
    wssChat.handleUpgrade(req, socket, head, (ws) => {
      wssChat.emit('connection', ws, req)
    })
  } else if (pathname === '/ws/notify') {
    wssNotify.handleUpgrade(req, socket, head, (ws) => {
      wssNotify.emit('connection', ws, req)
    })
  } else {
    socket.destroy()  // 未知路径，销毁连接
  }
})

// --- 4.3 心跳检测 ---
// WebSocket 连接可能因为网络问题变成"僵尸连接"，
// 需要定期发送心跳来检测连接是否仍然有效。

function setupHeartbeat(wss) {
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        // 上次心跳未响应，关闭连接
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping()  // 发送 ping 帧
    })
  }, 30000)  // 每 30 秒检测一次

  wss.on('connection', (ws) => {
    ws.isAlive = true
    ws.on('pong', () => {
      ws.isAlive = true  // 收到 pong，连接正常
    })
  })

  wss.on('close', () => {
    clearInterval(heartbeatInterval)
  })
}

// --- 4.4 客户端示例（HTML）---
// 前端连接 WebSocket 的代码：
//
// const ws = new WebSocket('ws://localhost:3000/ws/chat')
//
// ws.onopen = () => {
//   console.log('WebSocket 已连接')
//   ws.send(JSON.stringify({ type: 'chat', from: 'user1', content: '你好' }))
// }
//
// ws.onmessage = (event) => {
//   const data = JSON.parse(event.data)
//   console.log('收到消息:', data)
// }
//
// ws.onclose = () => {
//   console.log('WebSocket 已断开')
// }
//
// ws.onerror = (error) => {
//   console.error('WebSocket 错误:', error)
// }
*/


// ============================================================
// 5. 部署指南
// ============================================================

/*
// ============================================================
// 5.1 PM2 进程管理
// ============================================================
// PM2 是 Node.js 最常用的进程管理工具，提供：
// - 进程守护（崩溃自动重启）
// - 负载均衡（集群模式）
// - 日志管理
// - 性能监控
// - 零停机重载
//
// 安装 PM2：
//   npm install -g pm2
//
// 基本命令：
//   pm2 start app.js              # 启动应用
//   pm2 start app.js -i max       # 集群模式（使用所有 CPU 核心）
//   pm2 start app.js -i 4         # 集群模式（4 个进程）
//   pm2 start app.js --name "myapp"  # 指定应用名称
//   pm2 list                      # 查看所有进程
//   pm2 logs                      # 查看日志
//   pm2 logs myapp                # 查看指定应用日志
//   pm2 restart myapp             # 重启应用
//   pm2 reload myapp              # 零停机重载
//   pm2 stop myapp                # 停止应用
//   pm2 delete myapp              # 删除应用
//   pm2 monit                     # 性能监控面板
//
// PM2 配置文件（ecosystem.config.js）：
//
// module.exports = {
//   apps: [{
//     name: 'koa-demo',           // 应用名称
//     script: './src/app.js',     // 入口文件
//     instances: 'max',           // 进程数量（max = CPU 核心数）
//     exec_mode: 'cluster',       // 集群模式
//     watch: false,               // 是否监听文件变化自动重启
//     max_memory_restart: '1G',   // 内存超过 1G 时自动重启
//     env: {
//       NODE_ENV: 'production',   // 环境变量
//       PORT: 3000,
//     },
//     env_production: {
//       NODE_ENV: 'production',
//       PORT: 3000,
//     },
//     env_development: {
//       NODE_ENV: 'development',
//       PORT: 3000,
//     },
//     error_file: './logs/pm2-error.log',    // 错误日志文件
//     out_file: './logs/pm2-out.log',        // 输出日志文件
//     log_date_format: 'YYYY-MM-DD HH:mm:ss', // 日志时间格式
//     merge_logs: true,                       // 合并日志
//     autorestart: true,                      // 自动重启
//     max_restarts: 10,                       // 最大重启次数
//     min_uptime: '10s',                      // 最小运行时间（低于此时间重启不计入次数）
//     listen_timeout: 3000,                   // 监听超时时间
//     kill_timeout: 5000,                     // 杀死超时时间
//   }]
// }
//
// 使用配置文件启动：
//   pm2 start ecosystem.config.js
//   pm2 start ecosystem.config.js --env production
//
// 开机自启：
//   pm2 startup                  # 生成启动脚本
//   pm2 save                     # 保存当前进程列表
*/


/*
// ============================================================
// 5.2 Nginx 反向代理配置
// ============================================================
// Nginx 作为反向代理，提供：
// - SSL/TLS 终端（HTTPS）
// - 静态文件服务（Nginx 比 Node.js 更擅长）
// - 负载均衡
// - Gzip 压缩
// - 请求缓冲
// - 安全防护
//
// 基本配置（/etc/nginx/conf.d/koa-demo.conf）：
//
// # HTTP 重定向到 HTTPS
// server {
//     listen 80;
//     server_name example.com www.example.com;
//     return 301 https://$server_name$request_uri;
// }
//
// # HTTPS 配置
// server {
//     listen 443 ssl http2;
//     server_name example.com www.example.com;
//
//     # SSL 证书配置
//     ssl_certificate     /etc/nginx/ssl/cert.pem;
//     ssl_certificate_key /etc/nginx/ssl/key.pem;
//     ssl_protocols       TLSv1.2 TLSv1.3;
//     ssl_ciphers         HIGH:!aNULL:!MD5;
//
//     # Gzip 压缩
//     gzip on;
//     gzip_types text/plain text/css application/json application/javascript text/xml;
//     gzip_min_length 1000;
//
//     # 静态文件（由 Nginx 直接处理，不经过 Node.js）
//     location /static/ {
//         alias /var/www/koa-demo/public/;
//         expires 30d;
//         add_header Cache-Control "public, immutable";
//     }
//
//     # 代理到 Node.js 应用
//     location / {
//         proxy_pass http://127.0.0.1:3000;
//         proxy_http_version 1.1;
//
//         # 请求头透传
//         proxy_set_header Host $host;
//         proxy_set_header X-Real-IP $remote_addr;
//         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
//         proxy_set_header X-Forwarded-Proto $scheme;
//
//         # WebSocket 支持
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection "upgrade";
//
//         # 超时设置
//         proxy_connect_timeout 60s;
//         proxy_send_timeout 60s;
//         proxy_read_timeout 60s;
//
//         # 缓冲设置
//         proxy_buffering on;
//         proxy_buffer_size 4k;
//         proxy_buffers 8 4k;
//     }
//
//     # 请求体大小限制
//     client_max_body_size 10m;
//
//     # 安全头部
//     add_header X-Frame-Options "SAMEORIGIN" always;
//     add_header X-Content-Type-Options "nosniff" always;
//     add_header X-XSS-Protection "1; mode=block" always;
//     add_header Referrer-Policy "strict-origin-when-cross-origin" always;
// }
//
// # 负载均衡配置（多个 Node.js 实例）
// upstream koa_backend {
//     least_conn;  # 最少连接数算法
//     server 127.0.0.1:3000 weight=3;  # 权重 3
//     server 127.0.0.1:3001 weight=2;  # 权重 2
//     server 127.0.0.1:3002 backup;    # 备份服务器
//
//     keepalive 64;  # 保持连接数
// }
//
// server {
//     listen 443 ssl http2;
//     server_name example.com;
//
//     ssl_certificate     /etc/nginx/ssl/cert.pem;
//     ssl_certificate_key /etc/nginx/ssl/key.pem;
//
//     location / {
//         proxy_pass http://koa_backend;
//         proxy_http_version 1.1;
//         proxy_set_header Upgrade $http_upgrade;
//         proxy_set_header Connection "upgrade";
//         proxy_set_header Host $host;
//         proxy_set_header X-Real-IP $remote_addr;
//         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
//         proxy_set_header X-Forwarded-Proto $scheme;
//     }
// }
*/


/*
// ============================================================
// 5.3 生产环境最佳实践
// ============================================================
//
// 【安全】
// 1. 使用 koa-helmet 设置安全响应头
//    npm install koa-helmet
//    const helmet = require('koa-helmet')
//    app.use(helmet())
//
// 2. 使用 koa-csrf 防止 CSRF 攻击
//    npm install koa-csrf
//
// 3. 使用 koa-ratelimit 限制请求频率
//
// 4. 密码使用 bcrypt 加密存储
//    npm install bcrypt
//    const hash = await bcrypt.hash(password, 10)
//    const isMatch = await bcrypt.compare(password, hash)
//
// 5. 输入验证和清理（防止 SQL 注入、XSS 等）
//    npm install joi 或 zod
//
// 6. 使用 HTTPS（通过 Nginx 配置 SSL）
//
// 7. 环境变量使用 dotenv 管理，不要硬编码密钥
//    npm install dotenv
//
// 【性能】
// 1. 使用 koa-compress 启用 Gzip/Brotli 压缩
//    npm install koa-compress
//    const compress = require('koa-compress')
//    app.use(compress())
//
// 2. 静态文件由 Nginx 处理，不要让 Node.js 处理
//
// 3. 使用集群模式（PM2 cluster）充分利用多核 CPU
//
// 4. 数据库查询使用连接池
//
// 5. 使用缓存（Redis）减少数据库查询
//
// 6. 使用 CDN 加速静态资源
//
// 【监控】
// 1. 使用 PM2 监控进程状态
//
// 2. 接入 APM 工具（如 New Relic、Datadog）
//
// 3. 错误监控（如 Sentry）
//    npm install @sentry/node
//
// 4. 日志收集（如 ELK Stack、Loki）
//
// 【日志】
// 1. 使用结构化日志（JSON 格式）
// 2. 区分日志级别（DEBUG、INFO、WARN、ERROR）
// 3. 日志写入文件，不要只输出到控制台
// 4. 敏感信息不要记录到日志中
// 5. 使用日志轮转（logrotate）防止日志文件过大
*/


// ============================================================
// 6. 示例路由
// ============================================================

// 首页
router.get('/', async (ctx) => {
  ctx.body = {
    message: 'Koa.js 进阶教程',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/v1/health',
      info: 'GET /api/v1/info',
      delay: 'GET /api/v1/delay?ms=1000',
    },
    timestamp: Date.now()
  }
})

// 健康检查接口（用于负载均衡和监控）
router.get('/api/v1/health', async (ctx) => {
  ctx.body = {
    status: 'ok',
    uptime: process.uptime(),   // 进程运行时间（秒）
    memory: process.memoryUsage(),  // 内存使用情况
    timestamp: Date.now()
  }
})

// 服务器信息接口
router.get('/api/v1/info', async (ctx) => {
  ctx.body = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
    cwd: process.cwd(),
    env: process.env.NODE_ENV || 'development',
    cpuCount: require('os').cpus().length,
    totalMemory: `${(require('os').totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(require('os').freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    timestamp: Date.now()
  }
})

// 模拟慢接口（用于测试超时和日志）
router.get('/api/v1/delay', async (ctx) => {
  const ms = Number(ctx.query.ms) || 1000
  const maxMs = 10000  // 最大延迟 10 秒

  if (ms > maxMs) {
    ctx.status = 422
    ctx.body = {
      code: 422,
      message: `延迟时间不能超过 ${maxMs}ms`,
      timestamp: Date.now()
    }
    return
  }

  // 使用 Promise 延迟，不阻塞事件循环
  await new Promise(resolve => setTimeout(resolve, ms))

  ctx.body = {
    message: `延迟了 ${ms}ms`,
    actualDelay: ms,
    timestamp: Date.now()
  }
})


// ============================================================
// 7. 注册中间件和启动服务器
// ============================================================

// 错误日志（最外层）
app.use(errorLoggerMiddleware)

// 请求日志
app.use(loggerMiddleware)

// 请求体解析
app.use(bodyParser())

// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

// 404 处理
app.use(async (ctx) => {
  ctx.status = 404
  ctx.body = {
    code: 404,
    message: `路径 ${ctx.method} ${ctx.path} 不存在`,
    timestamp: Date.now()
  }
})

app.listen(PORT, () => {
  console.log(`========================================`)
  console.log(`  Koa 进阶教程`)
  console.log(`  访问地址: http://localhost:${PORT}`)
  console.log(`========================================`)
  console.log(`  API 接口：`)
  console.log(`  GET /                    → 首页`)
  console.log(`  GET /api/v1/health       → 健康检查`)
  console.log(`  GET /api/v1/info         → 服务器信息`)
  console.log(`  GET /api/v1/delay?ms=1000 → 模拟慢接口`)
  console.log(`========================================`)
  console.log(`  提示：查看控制台输出了解日志中间件的效果`)
  console.log(`  提示：快速刷新页面可以测试限流功能`)
  console.log(`========================================`)
})
