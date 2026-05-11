/**
 * ============================================================
 * Koa.js 教程 - 第2课：中间件详解
 * ============================================================
 *
 * 本文件涵盖以下内容：
 * 1. 洋葱模型详解 —— 深入理解 Koa 中间件的执行机制
 * 2. koa-router 路由 —— RESTful 路由管理
 * 3. koa-static 静态文件 —— 托管静态资源
 * 4. koa-bodyparser 请求体解析 —— 解析 JSON 和表单数据
 * 5. @koa/cors 跨域处理 —— 解决跨域资源共享问题
 * 6. 中间件组合 —— 将多个中间件组合使用
 * 7. 中间件顺序 —— 中间件注册顺序的重要性
 *
 * 安装依赖：
 *   npm install koa koa-router koa-static koa-bodyparser @koa/cors
 *
 * 运行方式：node src/examples/02-middleware.js
 * 测试方式：浏览器访问 http://localhost:3000
 * ============================================================
 */

const Koa = require('koa')
const app = new Koa()
const PORT = 3000


// ============================================================
// 1. 洋葱模型详解
// ============================================================
// Koa 的中间件执行机制被称为"洋葱模型"（Onion Model）。
// 每个中间件像洋葱的一层，请求从外到内穿过，响应从内到外返回。
//
// 执行流程图：
//
//   请求 ──────────────────────────────────────────────→
//          ┌─────────────────────────────────────┐
//          │  中间件1 (await next() 之前)          │
//          │  ┌───────────────────────────────┐   │
//          │  │  中间件2 (await next() 之前)   │   │
//          │  │  ┌─────────────────────────┐   │   │
//          │  │  │  中间件3 (业务逻辑)      │   │   │
//          │  │  └─────────────────────────┘   │   │
//          │  │  中间件2 (await next() 之后)   │   │
//          │  └───────────────────────────────┘   │
//          │  中间件1 (await next() 之后)          │
//          └─────────────────────────────────────┘
//   响应 ←──────────────────────────────────────────────
//
// 关键要点：
// - await next() 之前的代码在"请求阶段"执行（从外到内）
// - await next() 之后的代码在"响应阶段"执行（从内到外）
// - 必须使用 await next()，否则后续中间件不会执行
// - 如果中间件不调用 next()，请求链在此中断

// 中间件1：最外层 —— 请求计时
app.use(async (ctx, next) => {
  // 【请求阶段】记录开始时间
  const startTime = Date.now()
  console.log(`[中间件1-前] 请求进入: ${ctx.method} ${ctx.url}`)

  // 将控制权传递给下一个中间件
  await next()

  // 【响应阶段】计算并输出总耗时
  const endTime = Date.now()
  const duration = endTime - startTime
  console.log(`[中间件1-后] 请求完成: ${ctx.status} - 耗时 ${duration}ms`)
})

// 中间件2：中间层 —— 请求日志
app.use(async (ctx, next) => {
  // 【请求阶段】
  console.log(`[中间件2-前] 处理中: ${ctx.path}`)

  // 传递给下一个中间件
  await next()

  // 【响应阶段】
  console.log(`[中间件2-后] 响应状态: ${ctx.status}`)
})

// 中间件3：最内层 —— 业务逻辑
app.use(async (ctx, next) => {
  console.log(`[中间件3] 执行业务逻辑`)

  // 这里不再调用 next()，因为这是最内层的中间件
  // 如果调用 next()，控制权会传递给下一个已注册的中间件（如果有的话）
  ctx.body = '洋葱模型演示完成！查看控制台输出了解执行顺序。'
})


// ============================================================
// 以下为独立示例，需要单独运行
// （上面的中间件会拦截所有请求，所以下面的代码被注释掉）
// ============================================================

/*
// ============================================================
// 2. koa-router 路由
// ============================================================
// koa-router 是 Koa 最常用的路由中间件，支持 RESTful 风格的路由定义。
// 安装：npm install koa-router

const Router = require('koa-router')
const router = new Router()  // 创建路由实例

// --- 2.1 基本路由 ---

// GET 请求
router.get('/', async (ctx) => {
  ctx.body = '首页'
})

// 带参数的路由
router.get('/users/:id', async (ctx) => {
  // ctx.params 获取路径参数
  const id = ctx.params.id
  ctx.body = `获取用户 ${id} 的信息`
})

// --- 2.2 路由前缀 ---
// 使用 prefix 可以为一组路由添加统一前缀，避免重复书写

const apiRouter = new Router({
  prefix: '/api/v1'  // 所有路由都会加上 /api/v1 前缀
})

apiRouter.get('/users', async (ctx) => {
  // 实际路径：/api/v1/users
  ctx.body = { users: [{ id: 1, name: '张三' }] }
})

apiRouter.get('/users/:id', async (ctx) => {
  // 实际路径：/api/v1/users/:id
  const id = ctx.params.id
  ctx.body = { id, name: '张三', age: 25 }
})

// --- 2.3 多种 HTTP 方法 ---

router.post('/users', async (ctx) => {
  // 创建用户
  ctx.body = { message: '用户创建成功' }
})

router.put('/users/:id', async (ctx) => {
  // 更新用户
  const id = ctx.params.id
  ctx.body = { message: `用户 ${id} 更新成功` }
})

router.delete('/users/:id', async (ctx) => {
  // 删除用户
  const id = ctx.params.id
  ctx.body = { message: `用户 ${id} 删除成功` }
})

router.patch('/users/:id', async (ctx) => {
  // 部分更新用户
  const id = ctx.params.id
  ctx.body = { message: `用户 ${id} 部分更新成功` }
})

// --- 2.4 路由参数 ---

// 多个参数
router.get('/users/:userId/posts/:postId', async (ctx) => {
  const { userId, postId } = ctx.params
  ctx.body = { userId, postId }
})

// 正则参数（不常用，了解即可）
// router.get(/^\/files\/(.+)$/, async (ctx) => {
//   const filePath = ctx.captures[0]  // 通过 captures 获取正则捕获组
//   ctx.body = `文件路径: ${filePath}`
// })

// --- 2.5 查询参数 ---
// 查询参数不需要在路由中定义，直接通过 ctx.query 获取

router.get('/search', async (ctx) => {
  // URL: /search?keyword=koa&page=1&limit=10
  const { keyword, page = 1, limit = 10 } = ctx.query
  ctx.body = {
    keyword,
    page: Number(page),
    limit: Number(limit),
    message: '搜索结果'
  }
})

// --- 2.6 路由中间件 ---
// 可以为特定路由添加中间件

// 路由级别的中间件（只对该路由生效）
const authMiddleware = async (ctx, next) => {
  console.log('认证中间件执行')
  await next()
}

router.get('/admin', authMiddleware, async (ctx) => {
  ctx.body = '管理员页面'
})

// 多个中间件
router.get(
  '/admin/dashboard',
  authMiddleware,
  async (ctx, next) => {
    console.log('权限检查中间件')
    await next()
  },
  async (ctx) => {
    ctx.body = '管理面板'
  }
)

// --- 2.7 路由分组 ---
// 将不同模块的路由分组管理

const userRouter = new Router({ prefix: '/users' })
userRouter.get('/', async (ctx) => { ctx.body = '用户列表' })
userRouter.get('/:id', async (ctx) => { ctx.body = '用户详情' })

const orderRouter = new Router({ prefix: '/orders' })
orderRouter.get('/', async (ctx) => { ctx.body = '订单列表' })
orderRouter.get('/:id', async (ctx) => { ctx.body = '订单详情' })

// 将路由注册到 app
app.use(userRouter.routes())
app.use(orderRouter.routes())

// --- 2.8 允许的方法 ---
// 当请求方法不被允许时，自动返回 405 Method Not Allowed
// 当请求路径不存在时，自动返回 404 Not Found（需要配合 allowedMethods）

app.use(router.routes())
app.use(router.allowedMethods())  // 自动响应 OPTIONS 请求，并在方法不允许时返回 405
*/


/*
// ============================================================
// 3. koa-static 静态文件服务
// ============================================================
// koa-static 用于托管静态文件（HTML、CSS、JS、图片等）
// 安装：npm install koa-static

const serve = require('koa-static')
const path = require('path')

// --- 3.1 基本用法 ---
// 将 public 目录作为静态文件根目录
// app.use(serve(path.join(__dirname, '../public')))
// 访问 http://localhost:3000/index.html → 返回 public/index.html
// 访问 http://localhost:3000/css/style.css → 返回 public/css/style.css

// --- 3.2 配置选项 ---
// app.use(serve(path.join(__dirname, '../public'), {
//   // 静态文件缓存的过期时间（毫秒），默认为 0（不缓存）
//   maxage: 7 * 24 * 60 * 60 * 1000,  // 7 天
//
//   // 是否允许隐藏文件（以 . 开头的文件），默认为 false
//   hidden: false,
//
//   // 当文件不存在时，是否将请求传递给下一个中间件，默认为 true
//   // 如果设为 false，文件不存在时返回 404
//   defer: false,
//
//   // 设置静态文件的 gzip 压缩，默认为 true
//   gzip: true,
//
//   // 设置静态文件的 brotli 压缩，默认为 false
//   brotli: false,
//
//   // 索引文件，默认为 'index.html'
//   index: 'index.html',
//
//   // 扩展名优先级（当请求路径不包含扩展名时，按此顺序查找文件）
//   extensions: ['html', 'htm'],
// }))

// --- 3.3 多个静态目录 ---
// 可以注册多个静态文件中间件，Koa 会按顺序查找
// app.use(serve(path.join(__dirname, '../public')))     // 优先查找 public
// app.use(serve(path.join(__dirname, '../assets')))     // 然后查找 assets

// --- 3.4 虚拟路径前缀 ---
// 如果需要为静态文件添加 URL 前缀，可以结合 koa-mount 使用
// npm install koa-mount
// const mount = require('koa-mount')
// app.use(mount('/static', serve(path.join(__dirname, '../public'))))
// 访问 http://localhost:3000/static/index.html → 返回 public/index.html
*/


/*
// ============================================================
// 4. koa-bodyparser 请求体解析
// ============================================================
// koa-bodyparser 用于解析请求体中的数据，支持 JSON 和 URL-encoded 格式
// 安装：npm install koa-bodyparser

const bodyParser = require('koa-bodyparser')

// --- 4.1 基本用法 ---
// 注册 bodyparser 中间件（通常放在路由中间件之前）
// app.use(bodyParser())

// --- 4.2 配置选项 ---
// app.use(bodyParser({
//   // 启用 JSON 解析，默认为 true
//   enableTypes: ['json', 'form'],
//
//   // JSON 解析配置
//   jsonLimit: '1mb',          // JSON 请求体最大大小，默认 1mb
//   formLimit: '1mb',          // 表单请求体最大大小，默认 1mb
//   textLimit: '1mb',          // 文本请求体最大大小
//
//   // 是否严格解析 JSON（只接受数组和对象），默认为 true
//   strict: true,
//
//   // 是否自动检测请求体类型，默认为 true
//   detectJSON: true,
//
//   // 解析时是否扩展参数（如 a[b]=c → { a: { b: 'c' } }），默认为 true
//   extendTypes: {
//     json: ['application/json'],       // 额外的 JSON Content-Type
//     form: ['application/x-www-form-urlencoded'],  // 额外的表单 Content-Type
//     text: ['text/plain'],             // 额外的文本 Content-Type
//   },
//
//   // 当请求体超过限制时的错误处理
//   onerror: (err, ctx) => {
//     ctx.throw(413, '请求体过大')
//   },
// }))

// --- 4.3 使用示例 ---

// 解析 JSON 请求体
// POST /api/users
// Content-Type: application/json
// Body: { "name": "张三", "age": 25 }
//
// router.post('/api/users', async (ctx) => {
//   // ctx.request.body 就是解析后的请求体对象
//   const { name, age } = ctx.request.body
//   // 注意：使用 ctx.request.body，不是 ctx.body！
//   // ctx.body 是响应体，ctx.request.body 是请求体
//   ctx.body = { name, age, message: '用户创建成功' }
// })

// 解析表单请求体
// POST /api/login
// Content-Type: application/x-www-form-urlencoded
// Body: username=admin&password=123456
//
// router.post('/api/login', async (ctx) => {
//   const { username, password } = ctx.request.body
//   ctx.body = { username, message: '登录成功' }
// })

// 注意：koa-bodyparser 不支持 multipart/form-data（文件上传）
// 如需处理文件上传，请使用 @koa/multer 或 koa-body
*/


/*
// ============================================================
// 5. @koa/cors 跨域处理
// ============================================================
// @koa/cors 是 Koa 官方的 CORS（跨域资源共享）中间件
// 安装：npm install @koa/cors

const cors = require('@koa/cors')

// --- 5.1 基本用法 ---
// 使用默认配置（允许所有来源）
// app.use(cors())

// --- 5.2 自定义配置 ---
// app.use(cors({
//   // 允许的来源（Origin）
//   // 生产环境中应该指定具体域名，不要使用 '*'
//   origin: '*',  // 允许所有来源
//   // origin: ['http://localhost:3000', 'https://example.com'],  // 指定多个来源
//   // origin: (ctx) => ctx.get('Origin'),  // 动态设置来源
//
//   // 允许的请求方法
//   allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
//
//   // 允许的请求头
//   allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
//
//   // 暴露给客户端的响应头
//   exposeHeaders: ['Content-Length', 'X-Request-Id'],
//
//   // 是否允许携带凭证（Cookie、Authorization 头等）
//   // 设为 true 时，origin 不能为 '*'
//   credentials: true,
//
//   // 预检请求（OPTIONS）的缓存时间（秒）
//   maxAge: 86400,  // 24 小时
// }))

// --- 5.3 CORS 工作原理 ---
// 当浏览器发送跨域请求时：
// 1. 对于简单请求（GET、POST），浏览器直接发送请求，但会检查响应头中的 Access-Control-Allow-Origin
// 2. 对于非简单请求（PUT、DELETE、自定义头等），浏览器先发送 OPTIONS 预检请求
// 3. 服务器在预检请求的响应中告知浏览器允许的方法、头部等信息
// 4. 浏览器根据预检结果决定是否发送实际请求
*/


/*
// ============================================================
// 6. 中间件组合
// ============================================================
// Koa 提供了 compose 工具函数，可以将多个中间件组合成一个中间件
// 这在需要将一组中间件作为整体使用时非常有用

const compose = require('koa-compose')

// 定义一组中间件
async function middleware1(ctx, next) {
  console.log('中间件1 - 前')
  await next()
  console.log('中间件1 - 后')
}

async function middleware2(ctx, next) {
  console.log('中间件2 - 前')
  await next()
  console.log('中间件2 - 后')
}

async function middleware3(ctx, next) {
  console.log('中间件3')
  ctx.body = '组合中间件示例'
}

// 将多个中间件组合成一个
const combinedMiddleware = compose([middleware1, middleware2, middleware3])

// 像普通中间件一样使用
app.use(combinedMiddleware)

// --- 6.1 中间件组合的实际应用场景 ---

// 场景1：将认证相关的中间件组合在一起
const authMiddlewares = compose([
  async (ctx, next) => {
    // 检查 Token 是否存在
    const token = ctx.get('Authorization')
    if (!token) ctx.throw(401, '未提供认证令牌')
    await next()
  },
  async (ctx, next) => {
    // 验证 Token 有效性
    console.log('验证 Token...')
    await next()
  },
  async (ctx, next) => {
    // 检查用户权限
    console.log('检查权限...')
    await next()
  },
])

// 场景2：将日志相关的中间件组合在一起
const loggingMiddlewares = compose([
  async (ctx, next) => {
    console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.url}`)
    await next()
  },
  async (ctx, next) => {
    const start = Date.now()
    await next()
    console.log(`耗时: ${Date.now() - start}ms`)
  },
])
*/


/*
// ============================================================
// 7. 中间件顺序
// ============================================================
// 中间件的注册顺序非常重要！错误的顺序可能导致功能异常。
//
// 推荐的中间件注册顺序：
//
// 1. 错误处理（最外层）          ← 捕获所有错误
// 2. 压缩（gzip）               ← 减少传输数据量
// 3. CORS                       ← 处理跨域
// 4. Session                    ← 初始化会话
// 5. Body 解析                  ← 解析请求体
// 6. 日志                       ← 记录请求日志
// 7. 认证                       ← 验证用户身份
// 8. 路由                       ← 处理业务逻辑
// 9. 静态文件                   ← 托管静态资源
// 10. 404 处理（最内层）         ← 处理未匹配的路由

const Koa = require('koa')
const app = new Koa()

// 1. 全局错误处理（必须放在最前面）
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = { error: err.message }
    console.error('全局错误:', err)
  }
})

// 2. CORS 跨域处理
app.use(cors())

// 3. 请求体解析
app.use(bodyParser())

// 4. 请求日志
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${ms}ms`)
})

// 5. 路由
app.use(router.routes())
app.use(router.allowedMethods())

// 6. 静态文件
app.use(serve(path.join(__dirname, '../public')))

// 7. 404 处理（放在最后）
app.use(async (ctx) => {
  ctx.status = 404
  ctx.body = { error: 'Not Found' }
})

// --- 为什么顺序很重要？ ---
//
// 错误处理放在最前面：确保能捕获所有后续中间件的错误
// CORS 放在路由前面：确保 OPTIONS 预检请求能被正确处理
// Body 解析放在路由前面：确保路由处理时 ctx.request.body 已经可用
// 日志放在路由前面：确保能记录所有请求（包括 404）
// 404 处理放在最后：确保只有未匹配的路由才会返回 404
//
// 如果顺序错误，例如：
// - bodyparser 放在路由后面 → 路由中无法获取 ctx.request.body
// - CORS 放在路由后面 → OPTIONS 预检请求可能被路由拦截
// - 错误处理放在最后 → 无法捕获前面中间件的错误
*/


// ============================================================
// 启动服务器
// ============================================================
app.listen(PORT, () => {
  console.log(`========================================`)
  console.log(`  Koa 中间件教程`)
  console.log(`  访问地址: http://localhost:${PORT}`)
  console.log(`========================================`)
  console.log(`  提示：查看控制台输出了解洋葱模型的执行顺序`)
  console.log(`  提示：取消注释各段代码来学习不同的中间件`)
  console.log(`========================================`)
})
