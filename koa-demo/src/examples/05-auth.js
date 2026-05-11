/**
 * ============================================================
 * Koa.js 教程 - 第5课：认证授权（JWT）
 * ============================================================
 *
 * 本文件涵盖以下内容：
 * 1. JWT 认证原理 —— 什么是 JWT，为什么使用 JWT
 * 2. 登录接口 —— 用户名密码登录，返回 Access Token 和 Refresh Token
 * 3. Token 验证中间件 —— 验证请求中的 JWT 是否有效
 * 4. 权限控制 —— 基于角色的访问控制（RBAC）
 * 5. 刷新 Token —— 使用 Refresh Token 获取新的 Access Token
 *
 * 安装依赖：
 *   npm install koa koa-router koa-bodyparser jsonwebtoken
 *
 * 运行方式：node src/examples/05-auth.js
 *
 * 测试方式（使用 curl）：
 *   # 1. 注册用户
 *   curl -X POST http://localhost:3000/api/v1/auth/register \
 *     -H "Content-Type: application/json" \
 *     -d '{"username":"admin","password":"123456","role":"admin"}'
 *
 *   # 2. 登录获取 Token
 *   curl -X POST http://localhost:3000/api/v1/auth/login \
 *     -H "Content-Type: application/json" \
 *     -d '{"username":"admin","password":"123456"}'
 *
 *   # 3. 访问受保护的接口（需要 Token）
 *   curl http://localhost:3000/api/v1/users/profile \
 *     -H "Authorization: Bearer <your-access-token>"
 *
 *   # 4. 刷新 Token
 *   curl -X POST http://localhost:3000/api/v1/auth/refresh \
 *     -H "Content-Type: application/json" \
 *     -d '{"refreshToken":"<your-refresh-token>"}'
 *
 *   # 5. 访问管理员接口（需要 admin 角色）
 *   curl http://localhost:3000/api/v1/admin/dashboard \
 *     -H "Authorization: Bearer <your-access-token>"
 * ============================================================
 */

const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const jwt = require('jsonwebtoken')

const app = new Koa()
const router = new Router()
const PORT = 3000


// ============================================================
// 1. JWT 认证原理
// ============================================================
//
// JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间
// 安全地传输信息。JWT 常用于身份认证和信息交换。
//
// 【JWT 的结构】
// JWT 由三部分组成，用点号（.）分隔：
//
//   Header.Payload.Signature
//
// 例如：
//   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  ← Header（Base64 编码）
//   eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik.  ← Payload（Base64 编码）
//   SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQs  ← Signature（签名）
//
// 【Header（头部）】
// 指定签名算法和 Token 类型：
// {
//   "alg": "HS256",    // 签名算法（HMAC SHA-256）
//   "typ": "JWT"       // Token 类型
// }
//
// 【Payload（载荷）】
// 存放有效信息，分为三类：
// - 标准声明（Registered Claims）：iss（签发者）、exp（过期时间）、
//   sub（主题）、aud（受众）等
// - 公共声明（Public Claims）：自定义字段
// - 私有声明（Private Claims）：用于各方共享信息
//
// 示例：
// {
//   "sub": "1234567890",        // 用户 ID
//   "username": "admin",        // 用户名
//   "role": "admin",            // 角色
//   "iat": 1516239022,          // 签发时间（issued at）
//   "exp": 1516242622           // 过期时间（expiration）
// }
//
// 【Signature（签名）】
// 使用密钥对 Header 和 Payload 进行签名，确保数据不被篡改：
//   HMACSHA256(
//     base64UrlEncode(header) + "." + base64UrlEncode(payload),
//     secret
//   )
//
// 【JWT 认证流程】
// 1. 用户提交用户名和密码
// 2. 服务器验证通过后，生成 JWT（Access Token + Refresh Token）
// 3. 客户端将 Token 保存在本地（localStorage 或 Cookie）
// 4. 客户端在后续请求的 Header 中携带 Token：Authorization: Bearer <token>
// 5. 服务器验证 Token 的有效性和签名
// 6. 验证通过后，返回请求的资源
//
// 【Access Token vs Refresh Token】
// - Access Token：短效 Token（如 15 分钟），用于 API 访问
// - Refresh Token：长效 Token（如 7 天），用于获取新的 Access Token
// - 双 Token 机制的好处：
//   1. Access Token 短效，即使泄露影响也有限
//   2. Refresh Token 长效，用户不需要频繁登录
//   3. Refresh Token 可以被服务器主动撤销（用于强制下线）


// ============================================================
// 2. 配置
// ============================================================

// JWT 密钥（生产环境中应该使用环境变量，不要硬编码在代码中！）
const JWT_SECRET = 'my-super-secret-key-change-in-production'
const JWT_REFRESH_SECRET = 'my-refresh-secret-key-change-in-production'

// Token 有效期
const ACCESS_TOKEN_EXPIRES_IN = '15m'   // Access Token 15 分钟过期
const REFRESH_TOKEN_EXPIRES_IN = '7d'   // Refresh Token 7 天过期


// ============================================================
// 3. 模拟用户数据库
// ============================================================

// 用户数据存储
const users = [
  {
    id: 1,
    username: 'admin',
    // 实际项目中密码应该使用 bcrypt 等库进行哈希加密存储
    // 这里为了演示简单，直接存储明文（生产环境严禁这样做！）
    password: 'admin123',
    role: 'admin',       // 角色：admin（管理员）、user（普通用户）
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'user1',
    password: 'user123',
    role: 'user',
    createdAt: '2024-02-15T00:00:00.000Z'
  }
]

// Refresh Token 存储（实际项目中应该使用 Redis 等存储）
// 用于验证 Refresh Token 的有效性，以及支持 Token 撤销
const refreshTokens = new Map()  // key: refreshToken, value: userId

// 自增 ID
let nextUserId = 3


// ============================================================
// 4. JWT 工具函数
// ============================================================

/**
 * 生成 Access Token
 *
 * @param {object} user - 用户信息
 * @returns {string} JWT Token
 *
 * Token 的 Payload 中包含：
 * - sub: 用户 ID（标准声明，JWT 的主题）
 * - username: 用户名
 * - role: 用户角色
 * - iat: 签发时间（自动添加）
 * - exp: 过期时间（自动添加）
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,           // subject：Token 的主题（通常是用户 ID）
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,  // 过期时间
      issuer: 'koa-demo',                  // 签发者
    }
  )
}

/**
 * 生成 Refresh Token
 *
 * Refresh Token 的 Payload 中只包含必要信息（用户 ID），
 * 不包含角色等频繁变化的信息，因为 Refresh Token 有效期较长。
 *
 * @param {object} user - 用户信息
 * @returns {string} Refresh Token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      type: 'refresh',  // 标记这是一个 Refresh Token
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'koa-demo',
    }
  )
}

/**
 * 验证 Access Token
 *
 * @param {string} token - JWT Token
 * @returns {object|null} 解码后的 Payload，验证失败返回 null
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    // Token 无效或已过期
    return null
  }
}

/**
 * 验证 Refresh Token
 *
 * @param {string} token - Refresh Token
 * @returns {object|null} 解码后的 Payload，验证失败返回 null
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch (err) {
    return null
  }
}


// ============================================================
// 5. 认证中间件
// ============================================================

/**
 * JWT 认证中间件
 *
 * 该中间件从请求头中提取 Bearer Token，验证其有效性，
 * 并将解码后的用户信息挂载到 ctx.state 上。
 *
 * ctx.state 是 Koa 推荐的用于在中间件之间传递数据的对象。
 * 它会在请求结束时自动销毁，不会影响其他请求。
 *
 * 使用方式：
 *   router.get('/protected', authMiddleware, async (ctx) => {
 *     const user = ctx.state.user  // 获取当前登录用户
 *     ctx.body = `你好，${user.username}`
 *   })
 */
async function authMiddleware(ctx, next) {
  // 1. 从请求头获取 Authorization
  const authHeader = ctx.get('Authorization')

  if (!authHeader) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: '未提供认证令牌，请在请求头中添加 Authorization: Bearer <token>',
      timestamp: Date.now()
    }
    return
  }

  // 2. 解析 Bearer Token
  // Authorization 头的格式为：Bearer <token>
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: 'Authorization 格式错误，正确格式：Bearer <token>',
      timestamp: Date.now()
    }
    return
  }

  const token = parts[1]

  // 3. 验证 Token
  const decoded = verifyAccessToken(token)
  if (!decoded) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: 'Token 无效或已过期，请重新登录',
      timestamp: Date.now()
    }
    return
  }

  // 4. 将用户信息挂载到 ctx.state
  // ctx.state.user 可以在后续中间件和路由中访问
  ctx.state.user = {
    id: decoded.sub,
    username: decoded.username,
    role: decoded.role,
  }

  // 5. 继续执行后续中间件
  await next()
}

/**
 * 可选认证中间件
 *
 * 与 authMiddleware 不同，该中间件在 Token 缺失或无效时不会拒绝请求，
 * 而是继续执行后续中间件（ctx.state.user 为 undefined）。
 *
 * 适用于：某些接口既支持登录用户也支持匿名用户访问。
 */
async function optionalAuthMiddleware(ctx, next) {
  const authHeader = ctx.get('Authorization')

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)
    if (decoded) {
      ctx.state.user = {
        id: decoded.sub,
        username: decoded.username,
        role: decoded.role,
      }
    }
  }

  await next()
}

/**
 * 角色权限中间件（工厂函数）
 *
 * 返回一个中间件，用于检查当前用户是否拥有指定角色。
 *
 * 使用方式：
 *   router.get('/admin', requireRole('admin'), handler)
 *   router.get('/admin', requireRole('admin', 'superadmin'), handler)
 *
 * @param {...string} roles - 允许的角色列表
 * @returns {Function} Koa 中间件
 */
function requireRole(...roles) {
  return async (ctx, next) => {
    // 确保用户已认证（authMiddleware 应该在此中间件之前执行）
    if (!ctx.state.user) {
      ctx.status = 401
      ctx.body = {
        code: 401,
        message: '请先登录',
        timestamp: Date.now()
      }
      return
    }

    // 检查用户角色是否在允许的角色列表中
    if (!roles.includes(ctx.state.user.role)) {
      ctx.status = 403
      ctx.body = {
        code: 403,
        message: `权限不足，需要以下角色之一：${roles.join('、')}`,
        currentRole: ctx.state.user.role,
        requiredRoles: roles,
        timestamp: Date.now()
      }
      return
    }

    // 权限验证通过，继续执行
    await next()
  }
}


// ============================================================
// 6. 认证路由
// ============================================================

// --- 6.1 用户注册 ---
router.post('/api/v1/auth/register', async (ctx) => {
  const { username, password, role = 'user' } = ctx.request.body

  // 参数验证
  if (!username || !password) {
    ctx.status = 422
    ctx.body = {
      code: 422,
      message: '用户名和密码不能为空',
      timestamp: Date.now()
    }
    return
  }

  if (username.length < 3) {
    ctx.status = 422
    ctx.body = {
      code: 422,
      message: '用户名长度不能少于3个字符',
      timestamp: Date.now()
    }
    return
  }

  if (password.length < 6) {
    ctx.status = 422
    ctx.body = {
      code: 422,
      message: '密码长度不能少于6个字符',
      timestamp: Date.now()
    }
    return
  }

  // 检查用户名是否已存在
  const existingUser = users.find(u => u.username === username)
  if (existingUser) {
    ctx.status = 409
    ctx.body = {
      code: 409,
      message: `用户名 ${username} 已被注册`,
      timestamp: Date.now()
    }
    return
  }

  // 创建用户
  const newUser = {
    id: nextUserId++,
    username,
    password,  // 实际项目中应该使用 bcrypt 加密！
    role,      // 注册时默认角色为 user，不能自己指定 admin
    createdAt: new Date().toISOString()
  }

  users.push(newUser)

  // 返回用户信息（不包含密码）
  ctx.status = 201
  ctx.body = {
    code: 201,
    message: '注册成功',
    data: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.createdAt
    },
    timestamp: Date.now()
  }
})


// --- 6.2 用户登录 ---
router.post('/api/v1/auth/login', async (ctx) => {
  const { username, password } = ctx.request.body

  // 参数验证
  if (!username || !password) {
    ctx.status = 422
    ctx.body = {
      code: 422,
      message: '用户名和密码不能为空',
      timestamp: Date.now()
    }
    return
  }

  // 查找用户
  const user = users.find(u => u.username === username)
  if (!user) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: '用户名或密码错误',
      timestamp: Date.now()
    }
    return
  }

  // 验证密码
  // 实际项目中应该使用 bcrypt.compare(password, user.passwordHash)
  if (user.password !== password) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: '用户名或密码错误',
      timestamp: Date.now()
    }
    return
  }

  // 生成 Token
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  // 存储 Refresh Token（用于后续验证和撤销）
  refreshTokens.set(refreshToken, user.id)

  // 返回 Token
  ctx.body = {
    code: 200,
    message: '登录成功',
    data: {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,  // Access Token 过期时间（秒）
      tokenType: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    },
    timestamp: Date.now()
  }
})


// --- 6.3 刷新 Token ---
router.post('/api/v1/auth/refresh', async (ctx) => {
  const { refreshToken } = ctx.request.body

  // 参数验证
  if (!refreshToken) {
    ctx.status = 422
    ctx.body = {
      code: 422,
      message: '请提供 Refresh Token',
      timestamp: Date.now()
    }
    return
  }

  // 验证 Refresh Token
  const decoded = verifyRefreshToken(refreshToken)
  if (!decoded) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: 'Refresh Token 无效或已过期，请重新登录',
      timestamp: Date.now()
    }
    return
  }

  // 检查 Refresh Token 是否在存储中（防止已撤销的 Token 被使用）
  if (!refreshTokens.has(refreshToken)) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: 'Refresh Token 已被撤销，请重新登录',
      timestamp: Date.now()
    }
    return
  }

  // 查找用户
  const userId = refreshTokens.get(refreshToken)
  const user = users.find(u => u.id === userId)
  if (!user) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: '用户不存在',
      timestamp: Date.now()
    }
    return
  }

  // 生成新的 Access Token
  const newAccessToken = generateAccessToken(user)

  // 可选：同时生成新的 Refresh Token（Refresh Token Rotation）
  // 每次使用 Refresh Token 后就作废旧的，生成新的
  refreshTokens.delete(refreshToken)
  const newRefreshToken = generateRefreshToken(user)
  refreshTokens.set(newRefreshToken, user.id)

  ctx.body = {
    code: 200,
    message: 'Token 刷新成功',
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60,
      tokenType: 'Bearer',
    },
    timestamp: Date.now()
  }
})


// --- 6.4 退出登录 ---
router.post('/api/v1/auth/logout', authMiddleware, async (ctx) => {
  // 退出登录时，可以撤销该用户的所有 Refresh Token
  // 这里简单处理：客户端自行删除本地存储的 Token
  // 服务端可以选择将 Token 加入黑名单（需要 Redis 等存储）

  ctx.body = {
    code: 200,
    message: '退出登录成功',
    timestamp: Date.now()
  }
})


// ============================================================
// 7. 受保护的路由（需要认证）
// ============================================================

// --- 7.1 获取当前用户信息 ---
// 使用 authMiddleware 保护该路由
router.get('/api/v1/users/profile', authMiddleware, async (ctx) => {
  // ctx.state.user 是 authMiddleware 中设置的
  const userId = ctx.state.user.id

  // 从数据库中获取完整的用户信息
  const user = users.find(u => u.id === userId)
  if (!user) {
    ctx.status = 404
    ctx.body = {
      code: 404,
      message: '用户不存在',
      timestamp: Date.now()
    }
    return
  }

  // 返回用户信息（不包含密码）
  ctx.body = {
    code: 200,
    message: 'success',
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    },
    timestamp: Date.now()
  }
})


// --- 7.2 公开接口（可选认证）---
// 既支持登录用户（显示个性化内容），也支持匿名用户
router.get('/api/v1/articles', optionalAuthMiddleware, async (ctx) => {
  const isLogin = !!ctx.state.user

  ctx.body = {
    code: 200,
    message: 'success',
    data: {
      articles: [
        { id: 1, title: 'Koa.js 入门教程', author: 'admin' },
        { id: 2, title: 'JWT 认证详解', author: 'admin' },
        { id: 3, title: 'REST API 设计指南', author: 'user1' },
      ],
      isLogin,
      user: isLogin ? ctx.state.user.username : null,
    },
    timestamp: Date.now()
  }
})


// ============================================================
// 8. 管理员路由（需要认证 + 角色权限）
// ============================================================

// 创建管理员路由组
const adminRouter = new Router({ prefix: '/api/v1/admin' })

// 管理员仪表盘 —— 需要 admin 角色
adminRouter.get('/dashboard', authMiddleware, requireRole('admin'), async (ctx) => {
  ctx.body = {
    code: 200,
    message: '欢迎来到管理面板',
    data: {
      user: ctx.state.user,
      stats: {
        totalUsers: users.length,
        totalArticles: 42,
        todayVisits: 1024,
      }
    },
    timestamp: Date.now()
  }
})

// 获取所有用户列表 —— 需要 admin 角色
adminRouter.get('/users', authMiddleware, requireRole('admin'), async (ctx) => {
  // 返回用户列表（不包含密码）
  const userList = users.map(({ password, ...rest }) => rest)

  ctx.body = {
    code: 200,
    message: 'success',
    data: userList,
    timestamp: Date.now()
  }
})

// 将管理员路由注册到 app
app.use(adminRouter.routes())
app.use(adminRouter.allowedMethods())


// ============================================================
// 9. 全局错误处理
// ============================================================
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      code: ctx.status,
      message: err.message || '服务器内部错误',
      timestamp: Date.now()
    }
    console.error('[Error]', err.message)
  }
})


// ============================================================
// 10. 注册中间件和启动服务器
// ============================================================

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
  console.log(`  Koa JWT 认证教程`)
  console.log(`  访问地址: http://localhost:${PORT}`)
  console.log(`========================================`)
  console.log(`  认证接口：`)
  console.log(`  POST /api/v1/auth/register  → 注册用户`)
  console.log(`  POST /api/v1/auth/login     → 用户登录`)
  console.log(`  POST /api/v1/auth/refresh   → 刷新 Token`)
  console.log(`  POST /api/v1/auth/logout    → 退出登录`)
  console.log(`========================================`)
  console.log(`  受保护接口（需要 Token）：`)
  console.log(`  GET  /api/v1/users/profile  → 获取当前用户信息`)
  console.log(`  GET  /api/v1/articles       → 文章列表（可选认证）`)
  console.log(`========================================`)
  console.log(`  管理员接口（需要 admin 角色）：`)
  console.log(`  GET  /api/v1/admin/dashboard → 管理面板`)
  console.log(`  GET  /api/v1/admin/users     → 用户管理`)
  console.log(`========================================`)
  console.log(`  测试账号：`)
  console.log(`  管理员 - username: admin, password: admin123`)
  console.log(`  普通用户 - username: user1, password: user123`)
  console.log(`========================================`)
})
