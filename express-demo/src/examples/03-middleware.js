/**
 * ========================================
 * Express 5 中间件详解
 * ========================================
 *
 * 本文件涵盖 Express 5 的中间件系统：
 * 1. 中间件的概念和执行流程
 * 2. 内置中间件（express.json / urlencoded / static）
 * 3. 错误处理中间件
 * 4. 第三方中间件（cors / morgan / helmet）
 * 5. 中间件链的执行顺序
 * 6. 自定义中间件的编写
 *
 * 运行方式：node src/examples/03-middleware.js
 * 测试方式：使用 curl 或浏览器访问 http://localhost:3002
 *
 * 安装第三方中间件：
 *   npm install cors morgan helmet
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// ============================================
// 第一部分：中间件的概念
// ============================================
// 中间件（Middleware）是 Express 的核心概念
//
// 中间件是一个函数，签名为：(req, res, next) => { ... }
// - req: 请求对象
// - res: 响应对象
// - next: 下一个中间件函数
//
// 中间件的执行流程：
// 请求 -> 中间件1 -> 中间件2 -> 中间件3 -> 路由处理函数 -> 响应
//
// 每个中间件可以：
// 1. 执行任何代码
// 2. 修改 req 和 res 对象
// 3. 结束请求-响应周期（发送响应）
// 4. 调用 next() 将控制权传递给下一个中间件

// ============================================
// 第二部分：内置中间件
// ============================================

// --- express.json() ---
// 解析 Content-Type 为 application/json 的请求体
// 将解析后的数据挂载到 req.body 上
app.use(express.json());
console.log('[中间件] express.json() 已注册 - 解析 JSON 请求体');

// --- express.urlencoded() ---
// 解析 Content-Type 为 application/x-www-form-urlencoded 的请求体
// extended: true 表示使用 qs 库（支持嵌套对象），false 使用 querystring 库
app.use(express.urlencoded({ extended: true }));
console.log('[中间件] express.urlencoded() 已注册 - 解析 URL 编码请求体');

// --- express.static() ---
// 托管静态文件（HTML、CSS、JS、图片等）
// 第一个参数是静态文件所在的目录
// 访问时不需要加目录名，直接访问文件名
// 例如：public/index.html -> http://localhost:3002/index.html
//
// 注意：这里只是演示，实际使用时需要创建 public 目录
// app.use(express.static(path.join(__dirname, 'public')));
console.log('[中间件] express.static() 已注释（需要 public 目录）');

// --- express.raw() ---
// 解析请求体为原始 Buffer
// 适用于处理二进制数据
app.use('/api/raw', express.raw({ type: 'application/octet-stream' }));

// --- express.text() ---
// 解析请求体为纯文本
app.use('/api/text', express.text({ type: 'text/plain' }));

// ============================================
// 第三部分：自定义中间件
// ============================================

// --- 请求日志中间件 ---
const requestLogger = (req, res, next) => {
  const start = Date.now(); // 记录请求开始时间
  const { method, path, ip } = req;

  // 当响应完成时，计算请求耗时
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    console.log(`[日志] ${method} ${path} ${statusCode} ${duration}ms - ${ip}`);
  });

  next(); // 传递给下一个中间件
};

// --- 请求计时中间件 ---
const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

// --- 响应头设置中间件 ---
const setResponseHeaders = (req, res, next) => {
  // 设置自定义响应头
  res.set('X-API-Version', '1.0.0');
  res.set('X-Server', 'Express 5 Tutorial');

  // 设置安全相关的响应头（简化版，实际项目推荐使用 helmet）
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');

  next();
};

// --- 请求 ID 中间件 ---
const requestId = (req, res, next) => {
  // 为每个请求生成唯一 ID，方便追踪和调试
  req.id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  res.set('X-Request-ID', req.id);
  next();
};

// 注册自定义中间件
// 注意：中间件的注册顺序很重要！
// 先注册的中间件先执行
app.use(requestId);      // 1. 生成请求 ID
app.use(requestTimer);   // 2. 记录开始时间
app.use(setResponseHeaders); // 3. 设置响应头
app.use(requestLogger);  // 4. 请求日志

// ============================================
// 第四部分：条件中间件
// ============================================
// 根据条件决定是否应用中间件

const conditionalMiddleware = (req, res, next) => {
  // 只对 /api/ 开头的路径生效
  if (req.path.startsWith('/api/')) {
    console.log(`[条件中间件] API 请求: ${req.path}`);
    // 可以在这里添加 API 专属的逻辑
    req.isApiRequest = true;
  }
  next();
};

app.use(conditionalMiddleware);

// ============================================
// 第五部分：中间件错误处理
// ============================================
// 中间件中可能发生错误，需要正确处理

const safeMiddleware = (req, res, next) => {
  try {
    // 可能出错的代码
    const data = JSON.parse('{"valid": true}');
    req.parsedData = data;
    next();
  } catch (err) {
    // 将错误传递给错误处理中间件
    next(err);
  }
};

app.use('/api/safe', safeMiddleware);

// ============================================
// 第六部分：路由级中间件
// ============================================
// 中间件可以只应用于特定的路由

// --- 认证中间件 ---
const authenticate = (req, res, next) => {
  const token = req.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌',
    });
  }

  // 模拟 token 验证
  if (token !== 'valid-token') {
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌',
    });
  }

  // 将用户信息挂载到 req 上
  req.user = { id: 1, name: '张三', role: 'user' };
  next();
};

// --- 角色权限中间件 ---
const requireRole = (role) => {
  // 返回一个中间件函数（中间件工厂模式）
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '请先登录' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({
        message: `权限不足：需要 ${role} 角色`,
      });
    }
    next();
  };
};

// --- 请求验证中间件 ---
const validate = (schema) => {
  // schema 是一个验证规则对象
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rules.label || field} 是必填项`);
      }

      if (rules.type && value !== undefined) {
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`${rules.label || field} 必须是字符串`);
        }
        if (rules.type === 'number' && typeof value !== 'number') {
          errors.push(`${rules.label || field} 必须是数字`);
        }
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${rules.label || field} 至少需要 ${rules.minLength} 个字符`);
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${rules.label || field} 最多 ${rules.maxLength} 个字符`);
      }

      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        errors.push(`${rules.label || field} 不能小于 ${rules.min}`);
      }

      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        errors.push(`${rules.label || field} 不能大于 ${rules.max}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '请求参数验证失败',
        errors,
      });
    }

    next();
  };
};

// ============================================
// 第七部分：使用中间件的路由示例
// ============================================

// 需要认证的路由
app.get('/api/profile', authenticate, (req, res) => {
  res.json({
    message: '个人资料',
    user: req.user,
    requestId: req.id,
  });
});

// 需要管理员权限的路由
app.get('/api/admin/stats', authenticate, requireRole('admin'), (req, res) => {
  res.json({
    message: '管理员统计数据',
    stats: { users: 1000, revenue: 50000 },
    requestedBy: req.user.name,
  });
});

// 带验证的创建用户路由
const createUserSchema = {
  name: { required: true, type: 'string', label: '用户名', minLength: 2, maxLength: 20 },
  email: { required: true, type: 'string', label: '邮箱' },
  age: { required: false, type: 'number', label: '年龄', min: 0, max: 150 },
};

app.post('/api/validated-users', validate(createUserSchema), (req, res) => {
  res.status(201).json({
    message: '用户创建成功（已通过验证）',
    user: { id: Date.now(), ...req.body },
  });
});

// ============================================
// 第八部分：第三方中间件
// ============================================
// 以下中间件需要先安装：npm install cors morgan helmet

// --- cors 中间件 ---
// 处理跨域资源共享（Cross-Origin Resource Sharing）
// 允许前端应用从不同的域名/端口访问 API
//
// 安装：npm install cors
// 使用方式一：简单启用（允许所有跨域请求）
// const cors = require('cors');
// app.use(cors());
//
// 使用方式二：配置选项
// app.use(cors({
//   origin: 'https://example.com',  // 允许的源
//   methods: ['GET', 'POST', 'PUT'], // 允许的 HTTP 方法
//   allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
//   credentials: true,  // 允许发送 Cookie
//   maxAge: 86400,      // 预检请求缓存时间（秒）
// }));
//
// 使用方式三：动态配置
// app.use(cors({
//   origin: (origin, callback) => {
//     const whitelist = ['https://example.com', 'https://app.example.com'];
//     if (!origin || whitelist.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// }));

// 手动实现一个简单的 CORS 中间件（不依赖第三方库）
const simpleCors = (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求（OPTIONS）
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};

app.use(simpleCors);
console.log('[中间件] CORS 中间件已注册');

// --- morgan 中间件 ---
// HTTP 请求日志记录器
//
// 安装：npm install morgan
// const morgan = require('morgan');
//
// 预定义格式：
// - 'dev'    - 开发环境，彩色输出
// - 'combined' - Apache 标准日志格式
// - 'common' - 标准日志格式
// - 'short'  - 简短格式
// - 'tiny'   - 极简格式
//
// app.use(morgan('dev'));

// 手动实现一个简单的请求日志中间件（替代 morgan）
const simpleMorgan = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(
      `${timestamp} ${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${reset} ${duration}ms`
    );
  });

  next();
};

app.use(simpleMorgan);
console.log('[中间件] 日志中间件已注册（简化版 morgan）');

// --- helmet 中间件 ---
// 安全中间件，通过设置各种 HTTP 响应头来保护应用
//
// 安装：npm install helmet
// const helmet = require('helmet');
// app.use(helmet());
//
// helmet 设置了以下安全响应头：
// - Content-Security-Policy: 防止 XSS 攻击
// - X-Frame-Options: 防止点击劫持
// - X-Content-Type-Options: 防止 MIME 类型嗅探
// - Strict-Transport-Security: 强制使用 HTTPS
// 等等...

// ============================================
// 第九部分：错误处理中间件
// ============================================
// 错误处理中间件有 4 个参数：(err, req, res, next)
// Express 通过参数数量来区分普通中间件和错误处理中间件

// 全局错误处理中间件
// 注意：错误处理中间件必须放在所有路由和中间件之后
const globalErrorHandler = (err, req, res, next) => {
  console.error(`[错误] ${req.id || 'unknown'} - ${err.message}`);
  console.error(err.stack);

  // 根据错误类型返回不同的状态码
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    code: statusCode,
    message,
    // 开发环境返回错误堆栈，生产环境不返回
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId: req.id,
  });
};

// ============================================
// 路由定义
// ============================================

// 测试 JSON 解析
app.post('/api/parse-json', (req, res) => {
  res.json({
    message: 'JSON 解析成功',
    receivedBody: req.body,
    contentType: req.get('Content-Type'),
  });
});

// 测试 URL 编码解析
app.post('/api/parse-form', (req, res) => {
  res.json({
    message: '表单数据解析成功',
    receivedBody: req.body,
  });
});

// 测试原始数据
app.post('/api/raw', (req, res) => {
  res.json({
    message: '原始数据接收成功',
    contentType: req.get('Content-Type'),
    bodyLength: req.body ? req.body.length : 0,
  });
});

// 测试文本数据
app.post('/api/text', (req, res) => {
  res.json({
    message: '文本数据接收成功',
    text: req.body,
  });
});

// 测试中间件链
app.get('/api/middleware-info', (req, res) => {
  const elapsed = Date.now() - (req.startTime || Date.now());
  res.json({
    message: '中间件信息',
    requestId: req.id,
    isApiRequest: req.isApiRequest,
    elapsedMs: elapsed,
    headers: {
      'X-API-Version': res.get('X-API-Version'),
      'X-Server': res.get('X-Server'),
      'X-Request-ID': res.get('X-Request-ID'),
    },
  });
});

// 测试错误处理
app.get('/api/error', (req, res, next) => {
  // 手动抛出一个错误
  const error = new Error('这是一个测试错误');
  error.statusCode = 400;
  next(error);
});

// 测试异步错误
app.get('/api/async-error', async (req, res) => {
  // Express 5 自动捕获异步错误
  await Promise.reject(new Error('Express 5 自动捕获的异步错误'));
});

// ============================================
// 注册错误处理中间件（必须放在最后）
// ============================================
app.use(globalErrorHandler);

// ============================================
// 启动服务器
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`  Express 5 中间件教程服务器已启动`);
  console.log(`  访问地址: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('已注册的中间件（按执行顺序）：');
  console.log('  1. express.json()       - JSON 请求体解析');
  console.log('  2. express.urlencoded() - 表单数据解析');
  console.log('  3. requestId            - 请求 ID 生成');
  console.log('  4. requestTimer         - 请求计时');
  console.log('  5. setResponseHeaders   - 响应头设置');
  console.log('  6. requestLogger        - 请求日志');
  console.log('  7. conditionalMiddleware - 条件中间件');
  console.log('  8. simpleCors           - CORS 跨域处理');
  console.log('  9. simpleMorgan         - HTTP 日志');
  console.log('');
  console.log('测试命令：');
  console.log('  curl http://localhost:3002/api/middleware-info');
  console.log('  curl -X POST -H "Content-Type: application/json" -d \'{"name":"张三"}\' http://localhost:3002/api/parse-json');
  console.log('  curl -H "Authorization: Bearer valid-token" http://localhost:3002/api/profile');
  console.log('  curl -X POST -H "Content-Type: application/json" -d \'{"name":"a"}\' http://localhost:3002/api/validated-users');
  console.log('');
});
