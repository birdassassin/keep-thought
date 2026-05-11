/**
 * ============================================================
 * Koa.js 教程 - 第3课：错误处理
 * ============================================================
 *
 * 本文件涵盖以下内容：
 * 1. 全局错误处理 —— 使用 try/catch 捕获所有中间件中的错误
 * 2. 自定义错误类 —— 创建业务错误基类和具体错误类型
 * 3. HTTP 状态码 —— 常用状态码的含义和使用场景
 * 4. 错误响应格式化 —— 统一的错误响应格式
 *
 * 运行方式：node src/examples/03-error-handling.js
 * 测试方式：
 *   curl http://localhost:3000/success          → 正常响应
 *   curl http://localhost:3000/not-found        → 404 错误
 *   curl http://localhost:3000/bad-request      → 400 错误
 *   curl http://localhost:3000/unauthorized     → 401 错误
 *   curl http://localhost:3000/forbidden        → 403 错误
 *   curl http://localhost:3000/server-error     → 500 错误
 *   curl http://localhost:3000/async-error      → 异步错误
 *   curl http://localhost:3000/validation-error → 参数验证错误
 * ============================================================
 */

const Koa = require('koa')
const app = new Koa()
const PORT = 3000


// ============================================================
// 1. 自定义错误类
// ============================================================

/**
 * 基础业务错误类
 *
 * 所有自定义错误都应该继承这个基类。
 * 它包含了错误码、HTTP 状态码和错误消息。
 *
 * 为什么需要自定义错误类？
 * - 可以携带更多错误信息（错误码、详情等）
 * - 可以区分不同类型的错误（业务错误 vs 系统错误）
 * - 可以统一处理错误响应格式
 */
class AppError extends Error {
  /**
   * @param {string} message  - 错误消息（用户可见的描述）
   * @param {number} statusCode - HTTP 状态码
   * @param {string} code     - 业务错误码（用于前端精确判断错误类型）
   * @param {object} details  - 错误详情（可选，用于调试或前端展示）
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    // 调用父类 Error 的构造函数
    super(message)

    // 设置错误名称为类名，方便通过 instanceof 判断错误类型
    this.name = 'AppError'

    // HTTP 状态码
    this.statusCode = statusCode

    // 业务错误码（与 HTTP 状态码不同，用于业务层面的错误分类）
    // 例如：USER_NOT_FOUND、INVALID_PARAMETER 等
    this.code = code

    // 错误详情（可选）
    this.details = details

    // 标记该错误是否为操作错误（非系统故障）
    this.isOperational = true
  }
}

/**
 * 400 Bad Request - 请求参数错误
 * 当客户端发送的请求参数不合法时使用
 */
class BadRequestError extends AppError {
  constructor(message = '请求参数错误', details = null) {
    super(message, 400, 'BAD_REQUEST', details)
    this.name = 'BadRequestError'
  }
}

/**
 * 401 Unauthorized - 未认证
 * 当用户未登录或 Token 无效时使用
 */
class UnauthorizedError extends AppError {
  constructor(message = '未认证，请先登录', details = null) {
    super(message, 401, 'UNAUTHORIZED', details)
    this.name = 'UnauthorizedError'
  }
}

/**
 * 403 Forbidden - 无权限
 * 当用户已认证但无权访问资源时使用
 */
class ForbiddenError extends AppError {
  constructor(message = '无权访问该资源', details = null) {
    super(message, 403, 'FORBIDDEN', details)
    this.name = 'ForbiddenError'
  }
}

/**
 * 404 Not Found - 资源不存在
 * 当请求的资源不存在时使用
 */
class NotFoundError extends AppError {
  constructor(message = '资源不存在', details = null) {
    super(message, 404, 'NOT_FOUND', details)
    this.name = 'NotFoundError'
  }
}

/**
 * 409 Conflict - 资源冲突
 * 当请求与服务器当前状态冲突时使用（如重复创建）
 */
class ConflictError extends AppError {
  constructor(message = '资源冲突', details = null) {
    super(message, 409, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

/**
 * 422 Unprocessable Entity - 参数验证失败
 * 当请求参数格式正确但语义错误时使用
 */
class ValidationError extends AppError {
  /**
   * @param {string} message  - 错误消息
   * @param {Array}  errors   - 验证错误列表，每项包含 field 和 message
   */
  constructor(message = '参数验证失败', errors = []) {
    super(message, 422, 'VALIDATION_ERROR', { errors })
    this.name = 'ValidationError'
    this.errors = errors
  }
}

/**
 * 429 Too Many Requests - 请求过于频繁
 * 当客户端请求频率超过限制时使用
 */
class RateLimitError extends AppError {
  constructor(message = '请求过于频繁，请稍后再试', details = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details)
    this.name = 'RateLimitError'
  }
}


// ============================================================
// 2. 错误响应格式化工具
// ============================================================

/**
 * 格式化错误响应
 *
 * 统一的错误响应格式，让前端可以按照固定结构处理错误。
 *
 * 响应格式：
 * {
 *   code: 'ERROR_CODE',        // 业务错误码
 *   message: '错误描述',        // 用户可读的错误消息
 *   details: { ... },          // 错误详情（可选，生产环境可能不返回）
 *   timestamp: 1234567890      // 错误发生时间
 * }
 *
 * @param {AppError} err - 错误对象
 * @param {boolean} isDev - 是否为开发环境（开发环境返回更多信息）
 * @returns {object} 格式化后的错误响应对象
 */
function formatErrorResponse(err, isDev = false) {
  const response = {
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || '服务器内部错误',
    timestamp: Date.now(),
  }

  // 如果是验证错误，将错误列表放到顶层
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors
  }

  // 开发环境下返回更多调试信息
  if (isDev) {
    response.details = err.details || null
    response.stack = err.stack
    response.name = err.name
  }

  return response
}


// ============================================================
// 3. 全局错误处理中间件
// ============================================================
// 这是 Koa 错误处理的核心！
//
// 原理：
// - 将错误处理中间件注册为第一个中间件（最外层）
// - 使用 try/catch 包裹 await next()
// - 所有后续中间件中抛出的错误都会被这个 try/catch 捕获
//
// 为什么必须放在第一个？
// - Koa 的中间件是洋葱模型，外层中间件可以捕获内层的错误
// - 如果放在后面，前面的中间件抛出的错误就无法被捕获

// 判断是否为开发环境
const isDev = app.env === 'development' || process.env.NODE_ENV !== 'production'

app.use(async (ctx, next) => {
  try {
    // 尝试执行后续所有中间件
    await next()

    // --- 处理 404 ---
    // 如果所有中间件执行完毕后 ctx.status 仍然是 404
    // 说明没有路由匹配该请求
    if (ctx.status === 404 && !ctx.body) {
      ctx.status = 404
      ctx.body = formatErrorResponse(
        new NotFoundError(`路径 ${ctx.path} 不存在`),
        isDev
      )
    }
  } catch (err) {
    // --- 捕获所有错误 ---

    // 记录错误日志（实际项目中应该使用日志库）
    console.error('========================================')
    console.error(`[错误] ${new Date().toISOString()}`)
    console.error(`[路径] ${ctx.method} ${ctx.url}`)
    console.error(`[状态] ${err.statusCode || err.status || 500}`)
    console.error(`[消息] ${err.message}`)
    if (isDev) {
      console.error(`[堆栈] ${err.stack}`)
    }
    console.error('========================================')

    // 判断是否为自定义的业务错误
    if (err instanceof AppError) {
      // 业务错误：使用错误对象中定义的状态码和消息
      ctx.status = err.statusCode
      ctx.body = formatErrorResponse(err, isDev)
    } else if (err.name === 'ValidationError') {
      // 参数验证错误（来自验证库，如 Joi）
      ctx.status = 422
      ctx.body = formatErrorResponse(
        new ValidationError(err.message),
        isDev
      )
    } else {
      // 未知错误：统一返回 500，避免泄露敏感信息
      // 生产环境中不应该将系统错误的详细信息返回给客户端
      ctx.status = err.status || 500
      ctx.body = formatErrorResponse(
        new AppError(
          isDev ? err.message : '服务器内部错误',
          ctx.status,
          'INTERNAL_ERROR'
        ),
        isDev
      )
    }

    // 设置响应头
    ctx.set('Content-Type', 'application/json; charset=utf-8')
  }
})


// ============================================================
// 4. HTTP 状态码速查
// ============================================================
//
// 【2xx 成功】
// 200 OK              - 请求成功
// 201 Created         - 资源创建成功
// 204 No Content      - 请求成功但无响应体（常用于 DELETE）
//
// 【3xx 重定向】
// 301 Moved Permanently  - 永久重定向
// 302 Found              - 临时重定向
// 304 Not Modified       - 资源未修改（使用缓存）
//
// 【4xx 客户端错误】
// 400 Bad Request        - 请求参数错误
// 401 Unauthorized       - 未认证（需要登录）
// 402 Payment Required   - 需要付款（预留）
// 403 Forbidden          - 已认证但无权限
// 404 Not Found          - 资源不存在
// 405 Method Not Allowed - 请求方法不被允许
// 409 Conflict           - 资源冲突（如重复创建）
// 422 Unprocessable Entity - 参数验证失败
// 429 Too Many Requests  - 请求过于频繁（限流）
//
// 【5xx 服务器错误】
// 500 Internal Server Error - 服务器内部错误
// 502 Bad Gateway           - 网关错误
// 503 Service Unavailable   - 服务不可用
// 504 Gateway Timeout       - 网关超时


// ============================================================
// 5. 示例路由 —— 演示各种错误场景
// ============================================================

// --- 5.1 正常响应 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/success') {
    ctx.body = {
      code: 'SUCCESS',
      message: '请求成功',
      data: { id: 1, name: '张三' },
      timestamp: Date.now()
    }
    return  // 直接返回，不调用 next()
  }
  await next()
})

// --- 5.2 404 - 资源不存在 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/not-found') {
    // 方式1：抛出自定义错误（推荐）
    throw new NotFoundError('用户不存在', { userId: 999 })

    // 方式2：使用 ctx.throw（Koa 内置方法）
    // ctx.throw(404, '用户不存在')

    // 方式3：手动设置状态码和响应体
    // ctx.status = 404
    // ctx.body = { code: 'NOT_FOUND', message: '用户不存在' }
  }
  await next()
})

// --- 5.3 400 - 请求参数错误 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/bad-request') {
    throw new BadRequestError('缺少必要参数', {
      required: ['name', 'email'],
      received: { name: '张三' }
    })
  }
  await next()
})

// --- 5.4 401 - 未认证 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/unauthorized') {
    throw new UnauthorizedError('Token 已过期，请重新登录', {
      reason: 'TOKEN_EXPIRED'
    })
  }
  await next()
})

// --- 5.5 403 - 无权限 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/forbidden') {
    throw new ForbiddenError('您没有权限访问管理员资源', {
      requiredRole: 'ADMIN',
      currentRole: 'USER'
    })
  }
  await next()
})

// --- 5.6 500 - 服务器内部错误 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/server-error') {
    // 模拟一个未预期的系统错误
    // 这个错误不是 AppError 的实例，会被全局错误处理中间件捕获
    // 并返回统一的 500 错误响应
    const data = JSON.parse('这不是合法的 JSON')  // 会抛出 SyntaxError
  }
  await next()
})

// --- 5.7 异步错误处理 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/async-error') {
    // Koa 的 async/await 机制可以正确捕获异步操作中的错误
    // 这也是 Koa 相比 Express（回调模式）的一大优势
    const fetchData = () => new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('数据库连接超时'))
      }, 100)
    })

    // 这里的 await 确保异步错误会被正确捕获并冒泡到全局错误处理中间件
    const data = await fetchData()  // 会抛出错误
    ctx.body = data
  }
  await next()
})

// --- 5.8 参数验证错误 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/validation-error') {
    // 模拟参数验证失败
    throw new ValidationError('请求数据验证失败', [
      { field: 'email', message: '邮箱格式不正确' },
      { field: 'password', message: '密码长度不能少于6个字符' },
      { field: 'age', message: '年龄必须是正整数' },
    ])
  }
  await next()
})

// --- 5.9 409 - 资源冲突 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/conflict') {
    throw new ConflictError('该邮箱已被注册', {
      field: 'email',
      value: 'admin@example.com'
    })
  }
  await next()
})

// --- 5.10 429 - 请求限流 ---
app.use(async (ctx, next) => {
  if (ctx.path === '/rate-limit') {
    throw new RateLimitError('请求过于频繁，请 60 秒后再试', {
      limit: 100,
      remaining: 0,
      resetAt: new Date(Date.now() + 60000).toISOString()
    })
  }
  await next()
})


// ============================================================
// 6. app.onerror —— Koa 内置的错误事件
// ============================================================
// Koa 应用实例有一个 onerror 方法，当错误冒泡到最外层仍未被处理时触发。
// 默认行为是将错误输出到 stderr。
// 我们可以覆盖它来实现自定义的错误日志记录。

app.on('error', (err, ctx) => {
  // 这里可以接入日志系统（如 Winston、Pino 等）
  // 或者发送错误通知（如邮件、Slack、钉钉等）
  console.error('[App Error]', err.message)

  // 实际项目中，你可以在这里：
  // - 记录到文件日志
  // - 发送到错误监控平台（如 Sentry）
  // - 发送告警通知
})


// ============================================================
// 启动服务器
// ============================================================
app.listen(PORT, () => {
  console.log(`========================================`)
  console.log(`  Koa 错误处理教程`)
  console.log(`  访问地址: http://localhost:${PORT}`)
  console.log(`========================================`)
  console.log(`  测试路径：`)
  console.log(`  /success           → 正常响应`)
  console.log(`  /not-found         → 404 资源不存在`)
  console.log(`  /bad-request       → 400 请求参数错误`)
  console.log(`  /unauthorized      → 401 未认证`)
  console.log(`  /forbidden         → 403 无权限`)
  console.log(`  /server-error      → 500 服务器错误`)
  console.log(`  /async-error       → 异步错误`)
  console.log(`  /validation-error  → 422 参数验证失败`)
  console.log(`  /conflict          → 409 资源冲突`)
  console.log(`  /rate-limit        → 429 请求限流`)
  console.log(`  /any-other-path    → 自动 404`)
  console.log(`========================================`)
})
