/**
 * ========================================
 * Express 5 错误处理详解
 * ========================================
 *
 * 本文件涵盖 Express 5 的错误处理机制：
 * 1. 错误处理中间件
 * 2. 自定义错误类（AppError）
 * 3. 404 路由未找到处理
 * 4. 异步错误处理（Express 5 原生支持）
 * 5. 全局错误处理
 * 6. 错误分类与处理策略
 *
 * 运行方式：node src/examples/04-error-handling.js
 * 测试方式：使用 curl 或浏览器访问 http://localhost:3003
 */

const express = require('express');

const app = express();
const PORT = 3003;

// 解析 JSON 请求体
app.use(express.json());

// ============================================
// 第一部分：自定义错误类
// ============================================
// 创建自定义错误类，使错误处理更加结构化
// 每种错误类型都有对应的 HTTP 状态码

/**
 * AppError - 应用自定义错误基类
 * 继承自 Error，添加了 statusCode 和 isOperational 属性
 *
 * @param {string} message - 错误消息
 * @param {number} statusCode - HTTP 状态码
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // 调用父类 Error 的构造函数

    this.statusCode = statusCode;
    // 根据状态码判断错误类型
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // 标记为可操作的错误（非程序 bug）
    this.isOperational = true;

    // 捕获错误堆栈信息，方便调试
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================
// 第二部分：具体错误类型
// ============================================

/**
 * ValidationError - 请求验证错误（400）
 * 当客户端发送的数据不符合要求时使用
 */
class ValidationError extends AppError {
  constructor(message, fields) {
    super(message, 400);
    this.fields = fields; // 哪些字段验证失败
  }
}

/**
 * NotFoundError - 资源未找到错误（404）
 * 当请求的资源不存在时使用
 */
class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} (ID: ${id}) 未找到`, 404);
    this.resource = resource;
    this.resourceId = id;
  }
}

/**
 * AuthenticationError - 认证错误（401）
 * 当用户未认证或认证失败时使用
 */
class AuthenticationError extends AppError {
  constructor(message = '认证失败') {
    super(message, 401);
  }
}

/**
 * AuthorizationError - 授权错误（403）
 * 当用户没有权限执行操作时使用
 */
class AuthorizationError extends AppError {
  constructor(message = '权限不足') {
    super(message, 403);
  }
}

/**
 * RateLimitError - 请求频率限制错误（429）
 * 当用户请求过于频繁时使用
 */
class RateLimitError extends AppError {
  constructor(message = '请求过于频繁，请稍后再试') {
    super(message, 429);
  }
}

// ============================================
// 第三部分：同步错误处理
// ============================================
// 在同步路由处理函数中，直接 throw 错误即可
// Express 会自动捕获并传递给错误处理中间件

app.get('/api/sync-error', (req, res) => {
  // 直接 throw 错误
  throw new AppError('这是一个同步错误', 500);
});

// 使用自定义错误类型
app.get('/api/not-found', (req, res) => {
  throw new NotFoundError('用户', 999);
});

app.get('/api/auth-error', (req, res) => {
  throw new AuthenticationError('Token 已过期，请重新登录');
});

app.get('/api/forbidden', (req, res) => {
  throw new AuthorizationError('您没有权限访问此资源');
});

// ============================================
// 第四部分：异步错误处理（Express 5 核心特性）
// ============================================
// Express 5 最大的改进之一：自动捕获异步错误
// 不再需要 try/catch + next(err) 的模式

// --- Express 4 的旧写法（仍然兼容） ---
app.get('/api/old-async-style', async (req, res, next) => {
  try {
    const data = await someAsyncFunction();
    res.json(data);
  } catch (err) {
    next(err); // 必须手动传递错误
  }
});

// --- Express 5 的新写法（推荐） ---
app.get('/api/new-async-style', async (req, res) => {
  // 不需要 try/catch！
  // Express 5 自动捕获 Promise rejection
  const data = await someAsyncFunction();
  res.json(data);
});

// 模拟异步函数
async function someAsyncFunction() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: '异步操作成功', data: 'hello' });
    }, 50);
  });
}

// 模拟会失败的异步函数
async function failingAsyncFunction() {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new AppError('异步操作失败：数据库连接超时', 500));
    }, 50);
  });
}

// Express 5 自动捕获异步错误
app.get('/api/async-error-auto', async (req, res) => {
  // 如果 failingAsyncFunction() 抛出错误
  // Express 5 会自动捕获并传递给错误处理中间件
  // 不需要 try/catch！
  await failingAsyncFunction();
  res.json({ message: '这行不会执行' });
});

// 更复杂的异步错误场景
app.get('/api/async-complex', async (req, res) => {
  // 模拟数据库查询
  const user = await findUserById(999);
  // 如果用户不存在，findUserById 会抛出 NotFoundError
  // Express 5 自动捕获
  res.json({ user });
});

async function findUserById(id) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new NotFoundError('用户', id));
    }, 50);
  });
});

// ============================================
// 第五部分：路由中的错误处理
// ============================================

// --- 在中间件中传递错误 ---
const validateUserInput = (req, res, next) => {
  const { name, email, age } = req.body || {};

  const errors = [];

  if (!name || name.length < 2) {
    errors.push({ field: 'name', message: '用户名至少 2 个字符' });
  }

  if (!email || !email.includes('@')) {
    errors.push({ field: 'email', message: '请输入有效的邮箱地址' });
  }

  if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 150)) {
    errors.push({ field: 'age', message: '年龄必须在 0-150 之间' });
  }

  if (errors.length > 0) {
    // 创建验证错误并传递给错误处理中间件
    return next(new ValidationError('请求参数验证失败', errors));
  }

  next();
};

app.post('/api/users', validateUserInput, (req, res) => {
  res.status(201).json({
    message: '用户创建成功',
    user: { id: 1, ...req.body },
  });
});

// --- 在路由处理函数中使用 next(err) ---
app.get('/api/users/:id', (req, res, next) => {
  const userId = parseInt(req.params.id, 10);

  // 模拟数据库查询
  if (userId > 100) {
    // 使用 next(err) 传递错误
    return next(new NotFoundError('用户', userId));
  }

  res.json({
    message: '获取用户成功',
    user: { id: userId, name: '张三' },
  });
});

// ============================================
// 第六部分：全局错误处理中间件
// ============================================
// 错误处理中间件有 4 个参数：(err, req, res, next)
// Express 通过参数数量来识别错误处理中间件
// 必须放在所有路由和中间件之后

/**
 * 全局错误处理中间件
 * 处理所有未被路由捕获的错误
 */
app.use((err, req, res, next) => {
  // 设置默认值
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 开发环境：返回详细的错误信息
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      code: err.statusCode,
      status: err.status,
      message: err.message,
      // 开发环境返回错误堆栈
      stack: err.stack,
      // 如果是验证错误，返回字段错误
      fields: err.fields || undefined,
      resource: err.resource || undefined,
      isOperational: err.isOperational || false,
    });
  } else {
    // 生产环境：隐藏详细错误信息
    res.status(err.statusCode).json({
      code: err.statusCode,
      status: err.status,
      // 只返回可操作错误的详细信息
      message: err.isOperational ? err.message : '服务器内部错误',
      // 验证错误返回字段信息
      fields: err.fields || undefined,
    });
  }

  // 记录非操作性的错误（可能是代码 bug）
  if (!err.isOperational) {
    console.error('===== 非操作性错误（可能是 Bug）=====');
    console.error(`路径: ${req.method} ${req.path}`);
    console.error(`错误: ${err.message}`);
    console.error(`堆栈: ${err.stack}`);
    console.error('====================================');
  }
});

// ============================================
// 第七部分：404 处理
// ============================================
// 404 处理中间件放在所有路由之后、错误处理中间件之前
// 当没有路由匹配时，创建一个 404 错误并传递给错误处理中间件

app.all('*', (req, res, next) => {
  // 使用 next() 传递错误给错误处理中间件
  next(new NotFoundError('路由', req.originalUrl));
});

// 注意：上面的全局错误处理中间件已经注册了
// 404 错误会被它捕获并处理

// ============================================
// 启动服务器
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`  Express 5 错误处理教程服务器已启动`);
  console.log(`  访问地址: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('错误处理示例路由：');
  console.log('  GET /api/sync-error        - 同步错误');
  console.log('  GET /api/not-found         - 404 资源未找到');
  console.log('  GET /api/auth-error        - 401 认证错误');
  console.log('  GET /api/forbidden         - 403 权限错误');
  console.log('  GET /api/async-error-auto  - 异步错误（自动捕获）');
  console.log('  GET /api/async-complex     - 复杂异步错误');
  console.log('  GET /api/users/:id         - 路由错误处理');
  console.log('  POST /api/users            - 验证错误');
  console.log('  GET /any-random-path       - 404 路由未找到');
  console.log('');
  console.log('测试命令：');
  console.log('  curl http://localhost:3003/api/sync-error');
  console.log('  curl http://localhost:3003/api/not-found');
  console.log('  curl http://localhost:3003/api/async-error-auto');
  console.log('  curl -X POST -H "Content-Type: application/json" -d \'{"name":"a"}\' http://localhost:3003/api/users');
  console.log('  curl http://localhost:3003/api/users/999');
  console.log('  curl http://localhost:3003/nonexistent-path');
  console.log('');
});
