# Koa.js 完整教程示例

> 面向新手的 Koa.js 2.x 从入门到进阶教程，每个示例都配有详细的中文注释。

## 版本信息

| 依赖 | 版本 | 说明 |
|------|------|------|
| **Koa** | 2.x | 当前最新稳定版本，基于 async/await 的下一代 Web 框架 |
| **Node.js** | 18+ | 需要 Node.js 18 或更高版本（支持原生 async/await） |
| **npm** | 9+ | 建议使用 npm 9+ 或 yarn / pnpm |

## 什么是 Koa.js？

Koa.js 是由 Express 原班人马打造的下一代 Node.js Web 框架。它本身非常轻量（仅约 600 行代码），核心只提供了一个请求/响应的上下文对象（Context）和中间件机制，其他功能都通过中间件来实现。

与 Express 相比，Koa 的最大特点是：
- **不绑定任何中间件** —— Koa 核心不包含路由、静态文件、视图引擎等功能
- **原生 async/await 支持** —— 彻底告别回调地狱
- **更优雅的错误处理** —— 通过 try/catch 即可捕获异步错误
- **更强大的上下文** —— ctx 对象整合了 request 和 response

## 核心特性

### 1. 洋葱模型（Onion Model）

Koa 的中间件采用"洋葱模型"设计，请求从外层中间件依次进入内层，响应则从内层依次返回外层：

```
请求 → 中间件1 → 中间件2 → 中间件3 → 业务逻辑
响应 ← 中间件1 ← 中间件2 ← 中间件3 ← 业务逻辑
```

这种设计使得在请求前和请求后都可以执行代码（类似 AOP 编程），非常适合日志记录、错误处理、认证等横切关注点。

### 2. async/await

Koa 2.x 完全基于 Promise 和 async/await，让异步代码看起来像同步代码：

```javascript
app.use(async (ctx) => {
  const data = await fetchData()   // 等待异步操作
  ctx.body = data                  // 直接赋值，无需回调
})
```

### 3. Context（上下文对象）

Koa 将 Node.js 原生的 `request` 和 `response` 对象封装到一个 `ctx` 对象中，并提供了许多便捷的属性和方法：

```javascript
ctx.body          // 响应体（自动设置 Content-Type）
ctx.status        // 响应状态码
ctx.method        // 请求方法（GET、POST 等）
ctx.url           // 请求路径
ctx.query         // 解析后的查询参数
ctx.params        // 路由参数（需配合 koa-router）
ctx.headers       // 请求头
ctx.throw(400)    // 抛出 HTTP 错误
```

### 4. 中间件（Middleware）

中间件是 Koa 的核心概念。每个中间件是一个 `async` 函数，通过 `await next()` 将控制权传递给下一个中间件：

```javascript
app.use(async (ctx, next) => {
  // 请求前：记录开始时间
  const start = Date.now()

  // 将控制权传递给下一个中间件
  await next()

  // 请求后：计算耗时
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})
```

## 快速开始

### 安装依赖

```bash
# 初始化项目
npm init -y

# 安装 Koa 核心框架
npm install koa

# 安装常用中间件（按需安装）
npm install koa-router      # 路由
npm install koa-bodyparser  # 请求体解析
npm install koa-static      # 静态文件服务
npm install koa-cors        # 跨域处理（推荐使用 @koa/cors）
npm install @koa/cors       # 官方跨域中间件
```

### 运行示例

```bash
# 运行基础示例
node src/examples/01-basics.js

# 运行中间件示例
node src/examples/02-middleware.js

# 运行错误处理示例
node src/examples/03-error-handling.js

# 运行 REST API 示例
node src/examples/04-rest-api.js

# 运行认证示例
node src/examples/05-auth.js

# 运行进阶示例
node src/examples/06-advanced.js
```

## 示例目录

| 文件 | 主题 | 内容概要 |
|------|------|----------|
| `01-basics.js` | 基础入门 | Hello World、app.listen、ctx 对象、请求/响应处理、中间件概念 |
| `02-middleware.js` | 中间件详解 | 洋葱模型详解、koa-router 路由、koa-static 静态文件、koa-bodyparser 请求体解析、@koa/cors 跨域、中间件组合与顺序 |
| `03-error-handling.js` | 错误处理 | 全局错误处理、自定义错误类、HTTP 状态码、错误响应格式化 |
| `04-rest-api.js` | REST API | RESTful API 设计、CRUD 操作、请求参数验证、分页查询、统一响应格式 |
| `05-auth.js` | 认证授权 | JWT 认证、登录接口、Token 验证中间件、权限控制、刷新 Token |
| `06-advanced.js` | 进阶主题 | 日志中间件、限流（koa-ratelimit）、Session 管理、WebSocket 集成、部署（PM2/Nginx） |

## 学习建议

1. **按顺序学习** —— 从 01 到 06，每个示例都基于前一个示例的知识
2. **动手实践** —— 不要只看代码，自己运行并修改每个示例
3. **理解洋葱模型** —— 这是 Koa 最核心的概念，务必深入理解
4. **查阅官方文档** —— [Koa 官方文档](https://koajs.com/)
5. **阅读中间件源码** —— Koa 的中间件代码通常很简洁，阅读源码是很好的学习方式

## 常用中间件推荐

| 中间件 | 说明 |
|--------|------|
| `koa-router` | 路由中间件 |
| `koa-bodyparser` | 请求体解析（JSON / URL-encoded） |
| `@koa/cors` | 跨域资源共享（CORS） |
| `koa-static` | 静态文件服务 |
| `koa-session` | Session 管理 |
| `koa-jwt` | JWT 认证 |
| `koa-helmet` | 安全头部设置 |
| `koa-compress` | 响应压缩（gzip） |
| `koa-logger` | 请求日志 |
| `koa-ratelimit` | 请求限流 |

## 许可证

MIT
