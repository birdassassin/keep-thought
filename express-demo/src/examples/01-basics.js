/**
 * ========================================
 * Express 5 基础入门教程
 * ========================================
 *
 * 本文件涵盖 Express 5 的核心基础知识：
 * 1. Hello World 应用
 * 2. HTTP 方法（GET / POST / PUT / DELETE）
 * 3. req（请求）对象详解
 * 4. res（响应）对象详解
 * 5. 路由参数（Route Parameters）
 * 6. 查询参数（Query Parameters）
 * 7. 中间件基础（Middleware Basics）
 *
 * 运行方式：node src/examples/01-basics.js
 * 测试方式：使用浏览器访问 http://localhost:3000 或使用 curl
 */

// ============================================
// 第一步：导入 Express 框架
// ============================================
// express 是一个函数，调用后会返回一个 Express 应用实例
const express = require('express');

// 创建 Express 应用实例
const app = express();

// 定义服务器端口号
const PORT = 3000;

// ============================================
// 第二步：Hello World - 最简单的 Express 应用
// ============================================
// app.get(route, handler) 定义一个 GET 请求路由
// - route: 请求的路径（字符串或正则表达式）
// - handler: 请求处理函数，接收两个参数：
//   - req (Request): 客户端请求对象，包含请求的所有信息
//   - res (Response): 服务器响应对象，用于向客户端发送响应
app.get('/', (req, res) => {
  // res.send() 发送字符串响应给客户端
  // Express 会自动设置 Content-Type 为 text/html
  res.send('Hello World! 欢迎来到 Express 5 的世界！');
});

// ============================================
// 第三步：HTTP 方法 - RESTful 路由
// ============================================
// Express 支持所有标准 HTTP 方法，对应不同的 CRUD 操作：
// - GET: 读取资源（Read）
// - POST: 创建资源（Create）
// - PUT: 更新资源（完整替换）（Update）
// - DELETE: 删除资源（Delete）
// - PATCH: 更新资源（部分修改）（Update）

// --- GET 请求：获取数据 ---
app.get('/api/users', (req, res) => {
  // res.json() 发送 JSON 格式的响应
  // Express 会自动设置 Content-Type 为 application/json
  // 并将 JavaScript 对象序列化为 JSON 字符串
  res.json({
    code: 200,
    message: '获取用户列表成功',
    data: [
      { id: 1, name: '张三', email: 'zhangsan@example.com' },
      { id: 2, name: '李四', email: 'lisi@example.com' },
    ],
  });
});

// --- POST 请求：创建数据 ---
// 注意：要处理 POST 请求体（request body），需要先使用中间件
// 这里我们先用一个简单的示例，后面会详细讲解中间件
app.post('/api/users', (req, res) => {
  // 在实际应用中，req.body 包含客户端发送的 JSON 数据
  // 但需要先配置 express.json() 中间件才能解析
  res.status(201).json({
    code: 201,
    message: '用户创建成功',
    data: { id: 3, name: '王五', email: 'wangwu@example.com' },
  });
});

// --- PUT 请求：更新数据（完整替换） ---
app.put('/api/users/:id', (req, res) => {
  // :id 是路由参数，后面会详细讲解
  res.json({
    code: 200,
    message: '用户更新成功',
    data: { id: req.params.id, name: '张三（已更新）' },
  });
});

// --- DELETE 请求：删除数据 ---
app.delete('/api/users/:id', (req, res) => {
  res.json({
    code: 200,
    message: `用户 ${req.params.id} 删除成功`,
  });
});

// --- PATCH 请求：部分更新数据 ---
app.patch('/api/users/:id', (req, res) => {
  res.json({
    code: 200,
    message: '用户部分更新成功',
    data: { id: req.params.id, email: 'newemail@example.com' },
  });
});

// ============================================
// 第四步：req（请求）对象详解
// ============================================
// req 对象包含了客户端发送的 HTTP 请求的所有信息
// 以下是一些最常用的属性和方法

app.get('/api/request-info', (req, res) => {
  // req.method - HTTP 请求方法（GET、POST、PUT 等）
  const method = req.method;

  // req.url - 请求的完整路径（包含查询参数）
  const url = req.url;

  // req.path - 请求的路径部分（不包含查询参数）
  const path = req.path;

  // req.hostname - 服务器的主机名（不含端口号）
  // 注意：Express 5 中 req.host 已被移除，使用 req.hostname
  const hostname = req.hostname;

  // req.ip - 客户端的 IP 地址
  const ip = req.ip;

  // req.protocol - 请求协议（http 或 https）
  const protocol = req.protocol;

  // req.headers - 请求头对象（所有 HTTP 头信息）
  const userAgent = req.headers['user-agent'];

  // req.get(header) - 获取指定请求头的值
  const contentType = req.get('Content-Type');
  const accept = req.get('Accept');

  // req.cookies - 请求中的 Cookie（需要 cookie-parser 中间件）
  // req.signedCookies - 签名的 Cookie

  res.json({
    method,
    url,
    path,
    hostname,
    ip,
    protocol,
    userAgent,
    contentType,
    accept,
    message: '以上是 req 对象的常用属性',
  });
});

// ============================================
// 第五步：res（响应）对象详解
// ============================================
// res 对象用于构建和发送 HTTP 响应给客户端

// --- res.send() - 发送各种类型的数据 ---
app.get('/api/response/send', (req, res) => {
  // res.send() 可以发送字符串、Buffer、对象、数组等
  // Express 会自动根据参数类型设置 Content-Type
  res.send('<h1>这是 HTML 响应</h1><p>res.send() 自动设置 Content-Type</p>');
});

// --- res.json() - 发送 JSON 响应 ---
app.get('/api/response/json', (req, res) => {
  // res.json() 将 JavaScript 对象/数组序列化为 JSON 并发送
  // 等价于 res.set('Content-Type', 'application/json').send(JSON.stringify(obj))
  res.json({ message: '这是 JSON 响应', timestamp: Date.now() });
});

// --- res.status() - 设置 HTTP 状态码 ---
app.get('/api/response/status', (req, res) => {
  // res.status(code) 设置 HTTP 响应状态码
  // 常用状态码：
  // 200 - 成功
  // 201 - 创建成功
  // 204 - 成功但无内容
  // 400 - 错误请求
  // 401 - 未授权
  // 403 - 禁止访问
  // 404 - 未找到
  // 500 - 服务器内部错误
  res.status(201).json({ message: '资源创建成功', code: 201 });
});

// --- res.set() / res.get() - 设置和获取响应头 ---
app.get('/api/response/headers', (req, res) => {
  // res.set() 设置响应头
  res.set('X-Custom-Header', 'my-custom-value');
  res.set({
    'X-Another-Header': 'another-value',
    'X-Powered-By': 'Express 5 Tutorial',
  });

  // res.type() 设置 Content-Type
  res.type('application/json');

  res.json({ message: '响应头已设置', headers: res.getHeaders() });
});

// --- res.redirect() - 重定向 ---
app.get('/api/response/redirect', (req, res) => {
  // res.redirect() 发送 302 重定向响应
  // 注意：Express 5 中不再回退到 req.headers.referer
  // 必须明确指定重定向目标
  res.redirect('/'); // 重定向到首页
});

// --- res.sendFile() - 发送文件 ---
app.get('/api/response/download', (req, res) => {
  // res.sendFile() 发送文件作为响应
  // 注意：Express 5 中 res.sendfile() 已被移除，必须使用 res.sendFile()
  // res.sendFile(path, options, callback)
  res.json({ message: 'res.sendFile() 用于发送文件，例如：res.sendFile("/path/to/file.pdf")' });
});

// --- res.sendStatus() - 仅发送状态码 ---
app.get('/api/response/status-only', (req, res) => {
  // res.sendStatus() 只发送状态码和对应的状态消息
  // 注意：Express 5 中 res.send(status) 已被移除，必须使用 res.sendStatus()
  // res.sendStatus(200) 等价于 res.status(200).send('OK')
  res.sendStatus(204); // 204 No Content
});

// ============================================
// 第六步：路由参数（Route Parameters）
// ============================================
// 路由参数用于从 URL 路径中提取动态值
// 使用 :paramName 语法定义参数

// --- 单个路由参数 ---
app.get('/api/users/:id', (req, res) => {
  // req.params 是一个对象，包含所有路由参数
  // 例如：访问 /api/users/42 时，req.params.id = '42'
  const userId = req.params.id;

  res.json({
    message: '获取单个用户信息',
    userId,
    // 注意：路由参数总是字符串类型，需要手动转换
    userIdAsNumber: parseInt(userId, 10),
  });
});

// --- 多个路由参数 ---
app.get('/api/users/:userId/posts/:postId', (req, res) => {
  // 可以在一个路由中定义多个参数
  const { userId, postId } = req.params;

  res.json({
    message: '获取指定用户的指定文章',
    userId,
    postId,
  });
});

// --- Express 5 新的路由语法 ---
// Express 5 使用新版 path-to-regexp，支持更灵活的参数约束
app.get('/api/products/:id(\\d+)', (req, res) => {
  // :id(\\d+) 表示 id 参数必须匹配数字
  // 如果访问 /api/products/abc，将返回 404（不匹配此路由）
  res.json({
    message: '产品 ID 必须是数字',
    productId: req.params.id,
  });
});

// ============================================
// 第七步：查询参数（Query Parameters）
// ============================================
// 查询参数是 URL 中 ? 后面的键值对
// 例如：/api/search?keyword=express&page=1&limit=10

app.get('/api/search', (req, res) => {
  // req.query 是一个对象，包含所有查询参数
  // 如果参数不存在，值为 undefined
  const { keyword, page = 1, limit = 10, sort } = req.query;

  res.json({
    message: '搜索结果',
    // 注意：查询参数也总是字符串类型
    params: {
      keyword,       // "express"
      page: Number(page),   // 转换为数字
      limit: Number(limit), // 转换为数字
      sort,         // 可能是 undefined
    },
    tip: '查询参数通过 URL 的 ? 后面传递，多个参数用 & 分隔',
  });
});

// 查询参数高级用法
app.get('/api/filter', (req, res) => {
  // 处理数组类型的查询参数
  // 例如：/api/filter?category=node&category=express
  // req.query.category 将是一个数组 ['node', 'express']
  const { category, minPrice, maxPrice } = req.query;

  res.json({
    message: '筛选结果',
    filters: {
      // 如果参数有多个同名值，Express 会将其解析为数组
      categories: Array.isArray(category) ? category : [category],
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    },
  });
});

// ============================================
// 第八步：中间件基础（Middleware Basics）
// ============================================
// 中间件是一个函数，它在请求到达路由处理函数之前或之后执行
// 中间件可以访问 req、res 对象，以及 next 函数
// next() 将控制权传递给下一个中间件或路由处理函数

// --- 应用级中间件 ---
// app.use() 注册一个中间件，它会对所有请求生效
app.use((req, res, next) => {
  // 这个中间件会在每个请求处理之前执行
  // 记录请求的时间戳
  req.requestTime = new Date().toISOString();

  // 记录请求日志
  console.log(`[${req.requestTime}] ${req.method} ${req.path}`);

  // 必须调用 next() 将控制权传递给下一个中间件或路由
  // 如果不调用 next()，请求将被挂起（客户端会一直等待）
  next();
});

// --- 路由级中间件 ---
// 中间件也可以只对特定路由生效
const logMiddleware = (req, res, next) => {
  console.log(`[路由级中间件] 访问了 ${req.path}`);
  next(); // 传递给下一个处理函数
};

// 可以在路由定义中传入多个处理函数（中间件 + 路由处理函数）
app.get('/api/with-middleware', logMiddleware, (req, res) => {
  res.json({
    message: '这个路由使用了路由级中间件',
    requestTime: req.requestTime,
  });
});

// --- 多个中间件链式调用 ---
const middleware1 = (req, res, next) => {
  req.step1 = '第一步完成';
  console.log('中间件 1 执行');
  next(); // 传递给中间件 2
};

const middleware2 = (req, res, next) => {
  req.step2 = '第二步完成';
  console.log('中间件 2 执行');
  next(); // 传递给路由处理函数
};

app.get('/api/middleware-chain', middleware1, middleware2, (req, res) => {
  res.json({
    message: '中间件链执行完毕',
    steps: [req.step1, req.step2],
  });
});

// --- 中间件在路由之后执行 ---
// 如果在路由处理函数之后调用 next()，可以执行"后置"中间件
const afterMiddleware = (req, res, next) => {
  // 这个中间件在路由处理函数执行完后运行
  // 注意：此时响应可能已经发送，不能再修改响应内容
  console.log(`[后置中间件] 响应已发送，状态码：${res.statusCode}`);
  next();
};

// 注册后置中间件（放在所有路由之后）
app.use(afterMiddleware);

// ============================================
// 第九步：Express 5 的异步路由处理
// ============================================
// Express 5 原生支持 async/await，自动捕获异步错误
// 这是 Express 5 最重要的新特性之一

app.get('/api/async-demo', async (req, res) => {
  // 在 Express 5 中，可以直接使用 async/await
  // 如果 await 的 Promise 被 reject，Express 会自动将错误传递给错误处理中间件
  // 不需要 try/catch + next(err)

  // 模拟一个异步操作（例如数据库查询）
  const simulateAsyncOperation = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: '异步操作完成', data: '这是从异步操作中获取的数据' });
      }, 100);
    });
  };

  const result = await simulateAsyncOperation();
  res.json(result);
});

// Express 5 异步错误自动处理演示
app.get('/api/async-error-demo', async (req, res) => {
  // 这个路由会抛出一个异步错误
  // Express 5 会自动捕获这个错误并传递给错误处理中间件
  const failingAsyncOperation = () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('这是一个异步错误！Express 5 会自动捕获它。'));
      }, 100);
    });
  };

  // 不需要 try/catch，Express 5 会自动处理
  await failingAsyncOperation();
  // 这行代码不会执行，因为上面的 await 抛出了错误
  res.json({ message: '这行不会执行' });
});

// ============================================
// 第十步：404 处理 - 捕获未匹配的路由
// ============================================
// 这个中间件放在所有路由定义的最后
// 当没有路由匹配时，Express 会到达这里
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: `路径 ${req.path} 不存在`,
    hint: '请检查请求路径是否正确',
  });
});

// ============================================
// 启动服务器
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`  Express 5 基础教程服务器已启动`);
  console.log(`  访问地址: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('可用的路由：');
  console.log('  GET  /                          - Hello World');
  console.log('  GET  /api/users                 - 获取用户列表');
  console.log('  POST /api/users                 - 创建用户');
  console.log('  PUT  /api/users/:id             - 更新用户');
  console.log('  DELETE /api/users/:id           - 删除用户');
  console.log('  PATCH /api/users/:id            - 部分更新用户');
  console.log('  GET  /api/request-info          - 请求对象信息');
  console.log('  GET  /api/response/send         - 响应 send()');
  console.log('  GET  /api/response/json         - 响应 json()');
  console.log('  GET  /api/response/status       - 响应状态码');
  console.log('  GET  /api/response/headers      - 响应头设置');
  console.log('  GET  /api/response/redirect     - 重定向');
  console.log('  GET  /api/response/status-only  - 仅状态码');
  console.log('  GET  /api/users/:id             - 路由参数');
  console.log('  GET  /api/users/:userId/posts/:postId - 多参数');
  console.log('  GET  /api/products/:id(\\d+)     - 参数约束');
  console.log('  GET  /api/search?keyword=xxx    - 查询参数');
  console.log('  GET  /api/filter                - 数组查询参数');
  console.log('  GET  /api/with-middleware       - 路由级中间件');
  console.log('  GET  /api/middleware-chain      - 中间件链');
  console.log('  GET  /api/async-demo            - 异步路由');
  console.log('  GET  /api/async-error-demo      - 异步错误处理');
  console.log('');
});
