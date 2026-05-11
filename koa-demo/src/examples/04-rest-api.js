/**
 * ============================================================
 * Koa.js 教程 - 第4课：REST API 设计
 * ============================================================
 *
 * 本文件涵盖以下内容：
 * 1. RESTful API 设计原则 —— URL 设计、HTTP 方法、状态码
 * 2. CRUD 操作 —— 完整的增删改查实现
 * 3. 请求参数验证 —— 简单的参数校验逻辑
 * 4. 分页查询 —— 分页参数处理和分页响应格式
 * 5. 统一响应格式 —— 成功和失败的统一响应结构
 *
 * 安装依赖：
 *   npm install koa koa-router koa-bodyparser
 *
 * 运行方式：node src/examples/04-rest-api.js
 * 测试方式（使用 curl）：
 *   # 获取用户列表（分页）
 *   curl http://localhost:3000/api/v1/users?page=1&limit=5
 *
 *   # 获取单个用户
 *   curl http://localhost:3000/api/v1/users/1
 *
 *   # 创建用户
 *   curl -X POST http://localhost:3000/api/v1/users \
 *     -H "Content-Type: application/json" \
 *     -d '{"name":"张三","email":"zhangsan@example.com","age":25}'
 *
 *   # 更新用户
 *   curl -X PUT http://localhost:3000/api/v1/users/1 \
 *     -H "Content-Type: application/json" \
 *     -d '{"name":"张三丰","age":30}'
 *
 *   # 删除用户
 *   curl -X DELETE http://localhost:3000/api/v1/users/1
 * ============================================================
 */

const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
const router = new Router()
const PORT = 3000


// ============================================================
// 1. RESTful API 设计原则
// ============================================================
//
// REST（Representational State Transfer）是一种 API 设计风格，核心原则：
//
// 【1.1 URL 设计】
// - 使用名词表示资源，不使用动词
// - 资源用复数形式
// - 使用嵌套表示资源关系
// - 使用小写字母和连字符
//
//   好的设计：
//   GET    /api/v1/users           → 获取用户列表
//   GET    /api/v1/users/1         → 获取用户详情
//   POST   /api/v1/users           → 创建用户
//   PUT    /api/v1/users/1         → 更新用户（全量）
//   PATCH  /api/v1/users/1         → 更新用户（部分）
//   DELETE /api/v1/users/1         → 删除用户
//
//   好的嵌套设计：
//   GET    /api/v1/users/1/posts         → 获取用户的文章列表
//   POST   /api/v1/users/1/posts         → 给用户创建文章
//   GET    /api/v1/users/1/posts/2       → 获取用户的具体文章
//
//   不好的设计（避免）：
//   GET    /api/v1/getUsers              ← URL 中包含动词
//   POST   /api/v1/createUser            ← URL 中包含动词
//   GET    /api/v1/User                  ← 使用了单数
//   GET    /api/v1/user_list             ← 使用了下划线
//
// 【1.2 HTTP 方法】
// - GET    → 获取资源（安全、幂等）
// - POST   → 创建资源（非安全、非幂等）
// - PUT    → 全量更新资源（非安全、幂等）
// - PATCH  → 部分更新资源（非安全、非幂等）
// - DELETE → 删除资源（非安全、幂等）
//
// 【1.3 状态码】
// - 200 → 成功
// - 201 → 创建成功
// - 204 → 删除成功（无响应体）
// - 400 → 请求参数错误
// - 401 → 未认证
// - 403 → 无权限
// - 404 → 资源不存在
// - 409 → 资源冲突
// - 500 → 服务器错误
//
// 【1.4 版本控制】
// - URL 路径版本：/api/v1/users（推荐，简单直观）
// - 请求头版本：Accept: application/vnd.myapi.v1+json
// - 查询参数版本：/api/users?version=1


// ============================================================
// 2. 模拟数据库
// ============================================================
// 在实际项目中，你会使用数据库（如 MySQL、PostgreSQL、MongoDB）。
// 这里使用内存数组模拟数据库操作。

// 初始数据
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, createdAt: '2024-01-15T08:00:00.000Z' },
  { id: 2, name: '李四', email: 'lisi@example.com', age: 30, createdAt: '2024-02-20T10:30:00.000Z' },
  { id: 3, name: '王五', email: 'wangwu@example.com', age: 28, createdAt: '2024-03-10T14:15:00.000Z' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', age: 35, createdAt: '2024-04-05T09:00:00.000Z' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', age: 22, createdAt: '2024-05-18T16:45:00.000Z' },
]

// 自增 ID 计数器
let nextId = 6


// ============================================================
// 3. 统一响应格式
// ============================================================

/**
 * 成功响应格式：
 * {
 *   code: 200,              // 业务状态码（与 HTTP 状态码一致）
 *   message: 'success',     // 响应消息
 *   data: { ... },          // 响应数据
 *   timestamp: 1234567890   // 时间戳
 * }
 *
 * 分页响应格式：
 * {
 *   code: 200,
 *   message: 'success',
 *   data: {
 *     items: [...],         // 数据列表
 *     pagination: {         // 分页信息
 *       page: 1,            // 当前页码
 *       limit: 10,          // 每页数量
 *       total: 100,         // 总记录数
 *       totalPages: 10      // 总页数
 *     }
 *   },
 *   timestamp: 1234567890
 * }
 *
 * 错误响应格式：
 * {
 *   code: 400,              // 业务状态码
 *   message: '错误描述',     // 错误消息
 *   errors: [...],          // 错误详情（可选）
 *   timestamp: 1234567890
 * }
 */

/**
 * 构建成功响应
 * @param {*} data - 响应数据
 * @param {number} statusCode - HTTP 状态码，默认 200
 * @param {string} message - 响应消息
 */
function success(data, statusCode = 200, message = 'success') {
  return {
    code: statusCode,
    message,
    data,
    timestamp: Date.now()
  }
}

/**
 * 构建分页响应
 * @param {Array} items - 当前页的数据列表
 * @param {number} total - 总记录数
 * @param {number} page - 当前页码
 * @param {number} limit - 每页数量
 */
function paginated(items, total, page, limit) {
  return {
    code: 200,
    message: 'success',
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    },
    timestamp: Date.now()
  }
}

/**
 * 构建错误响应
 * @param {number} statusCode - HTTP 状态码
 * @param {string} message - 错误消息
 * @param {Array} errors - 错误详情列表
 */
function error(statusCode, message, errors = null) {
  const response = {
    code: statusCode,
    message,
    timestamp: Date.now()
  }
  if (errors) {
    response.errors = errors
  }
  return response
}


// ============================================================
// 4. 参数验证工具
// ============================================================

/**
 * 简单的参数验证器
 * 在实际项目中，建议使用专业的验证库，如 Joi 或 zod
 *
 * @param {object} data - 待验证的数据
 * @param {object} rules - 验证规则
 * @returns {{ valid: boolean, errors: Array }} 验证结果
 *
 * 使用示例：
 * const { valid, errors } = validate({ name: '张三', age: 25 }, {
 *   name: { required: true, type: 'string', minLength: 2 },
 *   age: { required: true, type: 'number', min: 0, max: 150 },
 * })
 */
function validate(data, rules) {
  const errors = []

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]

    // 必填检查
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} 是必填项` })
      continue
    }

    // 如果值不存在且非必填，跳过后续验证
    if (value === undefined || value === null) {
      continue
    }

    // 类型检查
    if (rule.type) {
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push({ field, message: `${field} 必须是字符串` })
      } else if (rule.type === 'number' && typeof value !== 'number') {
        errors.push({ field, message: `${field} 必须是数字` })
      } else if (rule.type === 'email' && typeof value === 'string') {
        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          errors.push({ field, message: `${field} 格式不正确` })
        }
      }
    }

    // 字符串最小长度
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors.push({ field, message: `${field} 长度不能少于 ${rule.minLength} 个字符` })
    }

    // 字符串最大长度
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      errors.push({ field, message: `${field} 长度不能超过 ${rule.maxLength} 个字符` })
    }

    // 数字最小值
    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      errors.push({ field, message: `${field} 不能小于 ${rule.min}` })
    }

    // 数字最大值
    if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
      errors.push({ field, message: `${field} 不能大于 ${rule.max}` })
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}


// ============================================================
// 5. CRUD 路由实现
// ============================================================

// --- 5.1 获取用户列表（GET /api/v1/users）---
// 支持分页查询和搜索
router.get('/api/v1/users', async (ctx) => {
  // 获取分页参数
  // ctx.query 中的值都是字符串类型，需要转换为数字
  const page = Math.max(1, Number(ctx.query.page) || 1)       // 页码，默认 1，最小 1
  const limit = Math.min(100, Math.max(1, Number(ctx.query.limit) || 10))  // 每页数量，默认 10，范围 1-100

  // 获取搜索参数
  const keyword = ctx.query.keyword || ''  // 搜索关键词
  const minAge = Number(ctx.query.minAge)  // 最小年龄
  const maxAge = Number(ctx.query.maxAge)  // 最大年龄

  // 筛选数据
  let filteredUsers = [...users]

  // 关键词搜索（匹配姓名或邮箱）
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase()
    filteredUsers = filteredUsers.filter(user =>
      user.name.toLowerCase().includes(lowerKeyword) ||
      user.email.toLowerCase().includes(lowerKeyword)
    )
  }

  // 年龄范围筛选
  if (!isNaN(minAge)) {
    filteredUsers = filteredUsers.filter(user => user.age >= minAge)
  }
  if (!isNaN(maxAge)) {
    filteredUsers = filteredUsers.filter(user => user.age <= maxAge)
  }

  // 计算分页
  const total = filteredUsers.length
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const items = filteredUsers.slice(startIndex, endIndex)

  // 返回分页响应
  ctx.body = paginated(items, total, page, limit)
})


// --- 5.2 获取单个用户（GET /api/v1/users/:id）---
router.get('/api/v1/users/:id', async (ctx) => {
  const id = Number(ctx.params.id)

  // 查找用户
  const user = users.find(u => u.id === id)

  if (!user) {
    // 用户不存在，返回 404
    ctx.status = 404
    ctx.body = error(404, `用户 ${id} 不存在`)
    return
  }

  ctx.body = success(user)
})


// --- 5.3 创建用户（POST /api/v1/users）---
router.post('/api/v1/users', async (ctx) => {
  // 获取请求体数据
  const { name, email, age } = ctx.request.body

  // 参数验证
  const { valid, errors } = validate(
    { name, email, age },
    {
      name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
      email: { required: true, type: 'email' },
      age: { required: true, type: 'number', min: 0, max: 150 },
    }
  )

  if (!valid) {
    ctx.status = 422
    ctx.body = error(422, '参数验证失败', errors)
    return
  }

  // 检查邮箱是否已存在（业务规则校验）
  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    ctx.status = 409
    ctx.body = error(409, `邮箱 ${email} 已被注册`)
    return
  }

  // 创建新用户
  const newUser = {
    id: nextId++,
    name,
    email,
    age,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)

  // 返回 201 Created
  ctx.status = 201
  ctx.body = success(newUser, 201, '用户创建成功')
})


// --- 5.4 全量更新用户（PUT /api/v1/users/:id）---
// PUT 要求客户端提供资源的全部字段，未提供的字段会被置空
router.put('/api/v1/users/:id', async (ctx) => {
  const id = Number(ctx.params.id)
  const { name, email, age } = ctx.request.body

  // 查找用户
  const userIndex = users.findIndex(u => u.id === id)

  if (userIndex === -1) {
    ctx.status = 404
    ctx.body = error(404, `用户 ${id} 不存在`)
    return
  }

  // 参数验证
  const { valid, errors } = validate(
    { name, email, age },
    {
      name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
      email: { required: true, type: 'email' },
      age: { required: true, type: 'number', min: 0, max: 150 },
    }
  )

  if (!valid) {
    ctx.status = 422
    ctx.body = error(422, '参数验证失败', errors)
    return
  }

  // 检查邮箱是否被其他用户使用
  const existingUser = users.find(u => u.email === email && u.id !== id)
  if (existingUser) {
    ctx.status = 409
    ctx.body = error(409, `邮箱 ${email} 已被其他用户注册`)
    return
  }

  // 全量更新（替换所有字段）
  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    age,
    updatedAt: new Date().toISOString()
  }

  ctx.body = success(users[userIndex], 200, '用户更新成功')
})


// --- 5.5 部分更新用户（PATCH /api/v1/users/:id）---
// PATCH 只更新客户端提供的字段，未提供的字段保持不变
router.patch('/api/v1/users/:id', async (ctx) => {
  const id = Number(ctx.params.id)
  const updates = ctx.request.body

  // 查找用户
  const userIndex = users.findIndex(u => u.id === id)

  if (userIndex === -1) {
    ctx.status = 404
    ctx.body = error(404, `用户 ${id} 不存在`)
    return
  }

  // 只验证提供的字段
  const rules = {}
  if (updates.name !== undefined) {
    rules.name = { required: true, type: 'string', minLength: 2, maxLength: 50 }
  }
  if (updates.email !== undefined) {
    rules.email = { required: true, type: 'email' }
  }
  if (updates.age !== undefined) {
    rules.age = { required: true, type: 'number', min: 0, max: 150 }
  }

  const { valid, errors } = validate(updates, rules)

  if (!valid) {
    ctx.status = 422
    ctx.body = error(422, '参数验证失败', errors)
    return
  }

  // 检查邮箱唯一性
  if (updates.email) {
    const existingUser = users.find(u => u.email === updates.email && u.id !== id)
    if (existingUser) {
      ctx.status = 409
      ctx.body = error(409, `邮箱 ${updates.email} 已被其他用户注册`)
      return
    }
  }

  // 部分更新（只更新提供的字段）
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  ctx.body = success(users[userIndex], 200, '用户部分更新成功')
})


// --- 5.6 删除用户（DELETE /api/v1/users/:id）---
router.delete('/api/v1/users/:id', async (ctx) => {
  const id = Number(ctx.params.id)

  // 查找用户
  const userIndex = users.findIndex(u => u.id === id)

  if (userIndex === -1) {
    ctx.status = 404
    ctx.body = error(404, `用户 ${id} 不存在`)
    return
  }

  // 删除用户
  const deletedUser = users.splice(userIndex, 1)[0]

  // 返回 204 No Content（无响应体）或返回被删除的数据
  // 方式1：不返回响应体
  // ctx.status = 204

  // 方式2：返回被删除的数据（推荐，让客户端知道删除了什么）
  ctx.body = success(deletedUser, 200, '用户删除成功')
})


// ============================================================
// 6. 注册中间件
// ============================================================

// 请求体解析（必须在路由之前）
app.use(bodyParser())

// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

// 404 处理（放在最后）
app.use(async (ctx) => {
  ctx.status = 404
  ctx.body = error(404, `路径 ${ctx.method} ${ctx.path} 不存在`)
})


// ============================================================
// 启动服务器
// ============================================================
app.listen(PORT, () => {
  console.log(`========================================`)
  console.log(`  Koa REST API 教程`)
  console.log(`  访问地址: http://localhost:${PORT}`)
  console.log(`========================================`)
  console.log(`  API 接口：`)
  console.log(`  GET    /api/v1/users           → 用户列表（支持分页和搜索）`)
  console.log(`  GET    /api/v1/users/:id       → 用户详情`)
  console.log(`  POST   /api/v1/users           → 创建用户`)
  console.log(`  PUT    /api/v1/users/:id       → 全量更新用户`)
  console.log(`  PATCH  /api/v1/users/:id       → 部分更新用户`)
  console.log(`  DELETE /api/v1/users/:id       → 删除用户`)
  console.log(`========================================`)
  console.log(`  查询参数：`)
  console.log(`  page=1&limit=10               → 分页`)
  console.log(`  keyword=张                    → 搜索`)
  console.log(`  minAge=20&maxAge=30           → 年龄筛选`)
  console.log(`========================================`)
})
