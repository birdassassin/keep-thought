/**
 * ============================================================
 * Koa.js 教程 - 第1课：基础入门
 * ============================================================
 *
 * 本文件涵盖以下内容：
 * 1. Hello World —— 最简单的 Koa 应用
 * 2. app.listen —— 启动 HTTP 服务器
 * 3. ctx 对象 —— Koa 的核心上下文对象
 * 4. 请求处理 —— 获取请求信息
 * 5. 响应处理 —— 设置响应内容
 * 6. 中间件概念 —— 理解 Koa 中间件的基本用法
 *
 * 运行方式：node src/examples/01-basics.js
 * 测试方式：浏览器访问 http://localhost:3000
 * ============================================================
 */

// -------------------------------------------------------
// 0. 导入 Koa 框架
// -------------------------------------------------------
// Koa 是一个类，我们通过 new 关键字创建应用实例
const Koa = require('koa')

// 创建一个 Koa 应用实例
// 这个 app 对象就是整个 Web 应用的核心
const app = new Koa()

// 设置监听端口
const PORT = 3000


// ============================================================
// 1. Hello World —— 最简单的 Koa 应用
// ============================================================
// app.use() 用来注册一个中间件函数
// 中间件函数接收两个参数：
//   - ctx：上下文对象（Context），封装了请求和响应
//   - next：一个函数，调用它将控制权传递给下一个中间件
app.use(async (ctx) => {
  // ctx.body 是 Koa 提供的便捷属性
  // 设置 ctx.body 会自动：
  //   1. 将值转换为字符串（如果是对象则转为 JSON）
  //   2. 自动设置 Content-Type（字符串为 text/html，对象为 application/json）
  //   3. 自动设置 Content-Length
  //   4. 自动设置状态码为 200
  ctx.body = 'Hello World! 欢迎来到 Koa.js 的世界！'
})

// 注意：上面的中间件没有调用 await next()
// 这意味着请求到此为止，不会传递给后续中间件
// 如果注册了多个中间件，只有第一个会被执行


// ============================================================
// 2. app.listen —— 启动 HTTP 服务器
// ============================================================
// app.listen() 实际上是 Node.js 原生 http.createServer() 的语法糖
// 它创建一个 HTTP 服务器并监听指定端口
//
// 等价写法：
//   const http = require('http')
//   const server = http.createServer(app.callback())
//   server.listen(3000)
//
// app.callback() 返回一个符合 Node.js HTTP 服务器要求的回调函数
app.listen(PORT, () => {
  console.log(`========================================`)
  console.log(`  Koa 服务器已启动！`)
  console.log(`  访问地址: http://localhost:${PORT}`)
  console.log(`========================================`)
})


// ============================================================
// 以下内容为教学说明，不会被实际执行
// （因为上面的中间件没有调用 next()，请求不会到达这里）
// ============================================================

/*
// ============================================================
// 3. ctx 对象详解
// ============================================================
// ctx（Context）是 Koa 的核心，它将 Node.js 的 request 和 response
// 对象封装在一起，并提供了许多便捷的属性和方法
//
// ctx 的主要属性分类：
//
// 【请求相关（ctx.request 的别名）】
//   ctx.header        - 请求头对象
//   ctx.headers       - 同 ctx.header
//   ctx.method        - 请求方法（GET、POST、PUT、DELETE 等）
//   ctx.url           - 请求路径（包含查询字符串）
//   ctx.path          - 请求路径（不包含查询字符串）
//   ctx.query         - 解析后的查询参数对象（如 ?name=abc → { name: 'abc' }）
//   ctx.querystring   - 原始查询字符串（如 'name=abc'）
//   ctx.host          - 请求的主机名（如 'localhost:3000'）
//   ctx.origin        - 请求的完整来源（如 'http://localhost:3000'）
//   ctx.href          - 完整的请求 URL
//   ctx.ip            - 客户端 IP 地址
//   ctx.protocol      - 请求协议（http 或 https）
//
// 【响应相关（ctx.response 的别名）】
//   ctx.body          - 响应体内容
//   ctx.status        - HTTP 状态码（如 200、404、500）
//   ctx.type          - 响应的 Content-Type（不包含编码，如 'json'、'html'）
//   ctx.length        - 响应内容的长度（自动设置 Content-Length）
//   ctx.redirect(url) - 重定向到指定 URL
//   ctx.attachment()  - 设置 Content-Disposition 为 "attachment"
//   ctx.lastModified  - 设置 Last-Modified 头
//   ctx.etag          - 设置 ETag 头
//
// 【便捷方法】
//   ctx.get(field)    - 获取请求头字段
//   ctx.set(field, value) - 设置响应头字段
//   ctx.remove(field) - 移除响应头字段
//   ctx.throw(status, message) - 抛出 HTTP 错误
//   ctx.assert(condition, status, message) - 条件断言

app.use(async (ctx) => {
  // --- 获取请求信息 ---

  // 获取请求方法
  const method = ctx.method  // 'GET', 'POST', 'PUT', 'DELETE' 等

  // 获取请求路径
  const url = ctx.url        // '/users?page=1'
  const path = ctx.path      // '/users'

  // 获取查询参数
  const query = ctx.query    // { page: '1' }
  const name = ctx.query.name // 获取特定查询参数

  // 获取请求头
  const userAgent = ctx.get('User-Agent')
  const contentType = ctx.get('Content-Type')

  // 获取客户端 IP
  const ip = ctx.ip

  // --- 设置响应信息 ---

  // 设置响应状态码
  ctx.status = 200

  // 设置响应体（Koa 会自动根据类型设置 Content-Type）
  ctx.body = '响应内容'          // Content-Type: text/html; charset=utf-8
  ctx.body = { foo: 'bar' }     // Content-Type: application/json
  ctx.body = Buffer.from('hello') // Content-Type: application/octet-stream

  // 设置响应头
  ctx.set('X-Custom-Header', 'my-value')
  ctx.set({
    'Cache-Control': 'no-cache',
    'X-Powered-By': 'Koa'
  })

  // 重定向
  // ctx.redirect('/other-page')
  // ctx.redirect('https://www.example.com')

  // 抛出错误（会自动设置状态码和错误页面）
  // ctx.throw(404, '页面不存在')
  // ctx.throw(400, '参数错误')
  // ctx.throw(500, '服务器内部错误')
})
*/


/*
// ============================================================
// 4. 请求处理 —— 根据不同请求返回不同内容
// ============================================================

app.use(async (ctx) => {
  // 根据请求路径返回不同内容
  if (ctx.path === '/') {
    ctx.body = '首页'
  } else if (ctx.path === '/about') {
    ctx.body = '关于页面'
  } else if (ctx.path === '/api/time') {
    // 返回 JSON 数据
    ctx.type = 'json'  // 显式设置 Content-Type
    ctx.body = {
      time: new Date().toISOString(),
      timestamp: Date.now()
    }
  } else {
    // 404 处理
    ctx.status = 404
    ctx.body = '页面不存在'
  }

  // 根据请求方法处理
  if (ctx.method === 'GET') {
    // 处理 GET 请求
  } else if (ctx.method === 'POST') {
    // 处理 POST 请求
  } else if (ctx.method === 'PUT') {
    // 处理 PUT 请求
  } else if (ctx.method === 'DELETE') {
    // 处理 DELETE 请求
  } else {
    // 不支持的请求方法
    ctx.status = 405  // Method Not Allowed
    ctx.body = '不支持的请求方法'
  }
})
*/


/*
// ============================================================
// 5. 响应处理 —— 不同类型的响应
// ============================================================

app.use(async (ctx) => {
  // --- 5.1 返回纯文本 ---
  // ctx.body = '这是一段纯文本'

  // --- 5.2 返回 HTML ---
  // ctx.type = 'html'
  // ctx.body = `
  //   <!DOCTYPE html>
  //   <html>
  //   <head><title>Koa 示例</title></head>
  //   <body>
  //     <h1>Hello Koa!</h1>
  //     <p>这是一个 HTML 响应</p>
  //   </body>
  //   </html>
  // `

  // --- 5.3 返回 JSON ---
  // ctx.type = 'json'
  // ctx.body = {
  //   code: 200,
  //   message: '成功',
  //   data: { id: 1, name: '张三' }
  // }

  // --- 5.4 返回文件流 ---
  // const fs = require('fs')
  // ctx.type = 'application/pdf'
  // ctx.body = fs.createReadStream('./document.pdf')

  // --- 5.5 重定向 ---
  // ctx.redirect('https://www.example.com')
  // ctx.redirect('/login')

  // --- 5.6 设置响应头 ---
  // ctx.set('Content-Type', 'text/plain')
  // ctx.set('X-Custom-Header', 'custom-value')
  // ctx.set({
  //   'Cache-Control': 'max-age=3600',
  //   'X-Request-Id': 'abc-123'
  // })

  // --- 5.7 下载文件 ---
  // ctx.attachment('report.xlsx')  // 设置 Content-Disposition
  // ctx.body = fs.createReadStream('./report.xlsx')
})
*/


/*
// ============================================================
// 6. 中间件概念 —— 多个中间件的注册与执行
// ============================================================
// 中间件是 Koa 的核心概念。每个 app.use() 注册的函数就是一个中间件。
// 中间件按照注册顺序执行，形成一条"中间件链"。
//
// 关键点：
// - 中间件必须是一个 async 函数
// - 调用 await next() 会将控制权传递给下一个中间件
// - 如果不调用 next()，请求链在此中断
// - next() 之后的代码会在所有后续中间件执行完毕后执行（洋葱模型）

// 第一个中间件：记录请求日志
app.use(async (ctx, next) => {
  console.log(`>> 请求开始: ${ctx.method} ${ctx.url}`)

  // 调用 next() 将控制权传递给下一个中间件
  // 必须使用 await，否则后续中间件中的错误无法被捕获
  await next()

  // 当所有后续中间件执行完毕后，控制权回到这里
  console.log(`<< 请求结束: ${ctx.status}`)
})

// 第二个中间件：设置响应头
app.use(async (ctx, next) => {
  // 请求前：设置自定义响应头
  ctx.set('X-Powered-By', 'Koa.js')
  ctx.set('X-Response-Time', new Date().toISOString())

  // 传递给下一个中间件
  await next()

  // 请求后：可以修改响应内容
  // （这里只是演示，实际中要小心修改已发送的响应）
})

// 第三个中间件：处理业务逻辑
app.use(async (ctx, next) => {
  if (ctx.path === '/api/hello') {
    ctx.body = { message: 'Hello from middleware!' }
  } else {
    ctx.body = '默认响应'
  }
})

// 中间件执行流程（洋葱模型）：
//
//   请求 → 中间件1(前半) → 中间件2(前半) → 中间件3(前半)
//                                                    ↓
//   响应 ← 中间件1(后半) ← 中间件2(后半) ← 中间件3(后半)
//
// 时间线：
//   1. 中间件1 执行 await next() 之前的代码
//   2. 中间件2 执行 await next() 之前的代码
//   3. 中间件3 执行全部代码（没有调用 next()）
//   4. 中间件2 执行 await next() 之后的代码
//   5. 中间件1 执行 await next() 之后的代码
*/
