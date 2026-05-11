/**
 * ========================================
 * Express 5 路由系统详解
 * ========================================
 *
 * 本文件涵盖 Express 5 的路由系统：
 * 1. Express Router 路由器
 * 2. 嵌套路由
 * 3. 路由模块化（拆分到单独文件）
 * 4. 路由参数高级用法
 * 5. 正则路由
 * 6. 路由分组
 *
 * 运行方式：node src/examples/02-routing.js
 * 测试方式：使用 curl 或浏览器访问 http://localhost:3001
 */

const express = require('express');

const app = express();
const PORT = 3001;

// ============================================
// 第一部分：Express Router 基础
// ============================================
// express.Router() 创建一个独立的路由器实例
// 路由器就像一个"迷你 Express 应用"，拥有自己的路由和中间件
// 但它不是一个完整的应用（没有 listen 方法等）

// 创建一个用户路由器
const userRouter = express.Router();

// 在路由器上定义路由，语法与 app 完全一样
userRouter.get('/', (req, res) => {
  res.json({ message: '用户列表（来自 userRouter）' });
});

userRouter.get('/:id', (req, res) => {
  res.json({ message: `获取用户 ${req.params.id}（来自 userRouter）` });
});

userRouter.post('/', (req, res) => {
  res.status(201).json({ message: '创建用户（来自 userRouter）' });
});

// 将路由器挂载到应用上
// app.use(path, router) 将路由器挂载到指定路径
// 这样 userRouter 中的所有路由都会加上 /api/users 前缀
app.use('/api/users', userRouter);

// ============================================
// 第二部分：嵌套路由
// ============================================
// 路由器可以嵌套使用，形成层级结构
// 例如：/api/users/:userId/posts/:postId

// 创建文章路由器
const postRouter = express.Router();

// 获取某用户的所有文章
// 注意：这里的 :userId 来自父路由
postRouter.get('/', (req, res) => {
  const { userId } = req.params;
  res.json({
    message: `获取用户 ${userId} 的所有文章`,
    posts: [
      { id: 1, title: '第一篇文章', userId },
      { id: 2, title: '第二篇文章', userId },
    ],
  });
});

// 获取某用户的某篇文章
postRouter.get('/:postId', (req, res) => {
  const { userId, postId } = req.params;
  res.json({
    message: `获取用户 ${userId} 的文章 ${postId}`,
    post: { id: postId, title: '文章详情', userId },
  });
});

// 创建文章
postRouter.post('/', (req, res) => {
  const { userId } = req.params;
  res.status(201).json({
    message: `为用户 ${userId} 创建文章`,
    post: { id: 3, title: '新文章', userId },
  });
});

// 将文章路由器挂载到用户路由器下
// 这样就形成了嵌套路由：
// /api/users/:userId/posts -> postRouter
userRouter.use('/:userId/posts', postRouter);

// ============================================
// 第三部分：路由模块化
// ============================================
// 在实际项目中，通常将不同模块的路由拆分到单独的文件中
// 以下是模拟的模块化路由结构：

// --- 模拟 products 路由模块 ---
// 在实际项目中，这应该是一个单独的文件：src/routes/products.js
const productRouter = express.Router();

// 获取产品列表
productRouter.get('/', (req, res) => {
  res.json({
    message: '产品列表',
    products: [
      { id: 1, name: 'Express 入门', price: 29.9 },
      { id: 2, name: 'Node.js 实战', price: 49.9 },
    ],
  });
});

// 获取单个产品
productRouter.get('/:id', (req, res) => {
  res.json({
    message: `获取产品 ${req.params.id}`,
    product: { id: req.params.id, name: 'Express 入门', price: 29.9 },
  });
});

// 创建产品
productRouter.post('/', (req, res) => {
  res.status(201).json({ message: '产品创建成功' });
});

// 更新产品
productRouter.put('/:id', (req, res) => {
  res.json({ message: `产品 ${req.params.id} 更新成功` });
});

// 删除产品
productRouter.delete('/:id', (req, res) => {
  res.json({ message: `产品 ${req.params.id} 删除成功` });
});

// 将产品路由器挂载到应用
app.use('/api/products', productRouter);

// --- 模拟 orders 路由模块 ---
const orderRouter = express.Router();

orderRouter.get('/', (req, res) => {
  res.json({
    message: '订单列表',
    orders: [
      { id: 'ORD-001', total: 79.8, status: '已完成' },
      { id: 'ORD-002', total: 29.9, status: '待发货' },
    ],
  });
});

orderRouter.get('/:id', (req, res) => {
  res.json({
    message: `获取订单 ${req.params.id}`,
    order: { id: req.params.id, total: 79.8, status: '已完成' },
  });
});

app.use('/api/orders', orderRouter);

/*
 * 模块化路由的推荐目录结构：
 *
 * src/
 * ├── routes/
 * │   ├── index.js          # 路由汇总，导入所有子路由
 * │   ├── users.js          # 用户路由模块
 * │   ├── products.js       # 产品路由模块
 * │   └── orders.js         # 订单路由模块
 * ├── controllers/
 * │   ├── userController.js # 用户控制器（业务逻辑）
 * │   ├── productController.js
 * │   └── orderController.js
 * ├── middleware/
 * │   ├── auth.js           # 认证中间件
 * │   └── validator.js      # 验证中间件
 * └── app.js                # Express 应用入口
 *
 * 示例 - src/routes/index.js：
 *
 * const express = require('express');
 * const router = express.Router();
 * const userRoutes = require('./users');
 * const productRoutes = require('./products');
 * const orderRoutes = require('./orders');
 *
 * router.use('/users', userRoutes);
 * router.use('/products', productRoutes);
 * router.use('/orders', orderRoutes);
 *
 * module.exports = router;
 *
 * 示例 - src/app.js：
 *
 * const express = require('express');
 * const routes = require('./routes');
 * const app = express();
 * app.use('/api', routes);
 * module.exports = app;
 */

// ============================================
// 第四部分：路由参数高级用法
// ============================================

// --- 可选路由参数 ---
// Express 5 中使用新版 path-to-regexp 语法
// 注意：Express 5 不再支持 `.` 作为可选字符
// 可选参数使用 {:param} 语法
app.get('/api/files/:filename.:ext', (req, res) => {
  // Express 5 中，点号需要显式匹配
  // :filename 和 :ext 分别匹配文件名和扩展名
  res.json({
    filename: req.params.filename,
    extension: req.params.ext,
    message: 'Express 5 中点号需要显式匹配',
  });
});

// --- 带约束的路由参数 ---
// 使用正则表达式约束参数格式
app.get('/api/articles/:year(\\d{4})/:month(\\d{2})', (req, res) => {
  // :year(\\d{4}) 表示 year 必须是 4 位数字
  // :month(\\d{2}) 表示 month 必须是 2 位数字
  const { year, month } = req.params;
  res.json({
    message: `获取 ${year} 年 ${month} 月的文章`,
    year,
    month,
  });
});

// --- Express 5 通配符路由 ---
// Express 5 中，通配符使用 {*name} 语法（替代 Express 4 的 *）
app.get('/api/docs/{*path}', (req, res) => {
  // {*path} 会匹配 /api/docs/ 后面的所有路径
  // 例如：/api/docs/getting-started/installation
  // req.params.path = 'getting-started/installation'
  res.json({
    message: '文档路径',
    path: req.params.path,
    fullUrl: req.url,
  });
});

// ============================================
// 第五部分：正则路由
// ============================================
// 路由路径可以是正则表达式，用于匹配复杂的 URL 模式

// 匹配所有以 .html 结尾的请求
app.get(/.*\.html$/, (req, res) => {
  res.json({
    message: '匹配到 HTML 文件请求',
    path: req.path,
  });
});

// 匹配特定模式的路径
// 例如：/api/items/abc-123 或 /api/items/xyz-789
app.get(/^\/api\/items\/([a-z]+)-(\d+)$/, (req, res) => {
  // 使用正则捕获组时，匹配的内容存储在 req.params[0], req.params[1]...
  // 注意：使用正则时参数索引从 0 开始（不是命名参数）
  res.json({
    message: '正则路由匹配',
    prefix: req.params[0],  // 第一个捕获组
    number: req.params[1],  // 第二个捕获组
  });
});

// ============================================
// 第六部分：路由分组与 app.route()
// ============================================
// app.route() 为同一个路径创建链式路由处理器
// 避免重复书写路径，代码更整洁

app.route('/api/books')
  // 获取所有书籍
  .get((req, res) => {
    res.json({
      message: '获取书籍列表',
      books: [
        { id: 1, title: 'Express 5 权威指南' },
        { id: 2, title: 'Node.js 设计模式' },
      ],
    });
  })
  // 创建新书籍
  .post((req, res) => {
    res.status(201).json({
      message: '书籍创建成功',
      book: { id: 3, title: '新书籍' },
    });
  });

app.route('/api/books/:id')
  // 获取单本书籍
  .get((req, res) => {
    res.json({
      message: `获取书籍 ${req.params.id}`,
      book: { id: req.params.id, title: 'Express 5 权威指南' },
    });
  })
  // 更新书籍
  .put((req, res) => {
    res.json({
      message: `书籍 ${req.params.id} 更新成功`,
    });
  })
  // 删除书籍
  .delete((req, res) => {
    res.json({
      message: `书籍 ${req.params.id} 删除成功`,
    });
  });

// ============================================
// 第七部分：路由中间件
// ============================================
// 可以为路由器添加专属的中间件

// 创建一个需要认证的路由器
const adminRouter = express.Router();

// 路由器级别的中间件 - 对 adminRouter 下的所有路由生效
adminRouter.use((req, res, next) => {
  // 模拟认证检查
  const authHeader = req.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权：请在请求头中提供 Bearer Token',
      hint: 'Authorization: Bearer <your-token>',
    });
  }
  // 将 token 保存到 req 对象上，后续路由可以使用
  req.token = authHeader.replace('Bearer ', '');
  next();
});

// 这些路由都需要认证才能访问
adminRouter.get('/dashboard', (req, res) => {
  res.json({
    message: '管理后台',
    token: req.token,
    stats: { users: 1234, orders: 5678, revenue: 99999 },
  });
});

adminRouter.get('/users', (req, res) => {
  res.json({
    message: '管理用户列表（需要认证）',
    users: [
      { id: 1, name: '管理员', role: 'admin' },
    ],
  });
});

// 为特定路由添加中间件
const checkPermission = (req, res, next) => {
  // 模拟权限检查
  if (req.token !== 'admin-secret-token') {
    return res.status(403).json({
      code: 403,
      message: '权限不足：需要管理员权限',
    });
  }
  next();
};

adminRouter.delete('/users/:id', checkPermission, (req, res) => {
  res.json({
    message: `用户 ${req.params.id} 已被删除（需要管理员权限）`,
  });
});

// 挂载管理路由
app.use('/api/admin', adminRouter);

// ============================================
// 第八部分：多路由处理函数
// ============================================
// 一个路由可以有多个处理函数，按顺序执行

const validateUser = (req, res, next) => {
  // 验证逻辑
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({
      message: '缺少必填字段：name 和 email',
    });
  }
  // 将验证后的数据传递给下一个处理函数
  req.validatedUser = { name, email };
  next();
};

const checkDuplicate = (req, res, next) => {
  // 模拟检查重复
  console.log(`检查用户 ${req.validatedUser.email} 是否已存在...`);
  // 假设没有重复
  next();
};

const createUser = (req, res) => {
  // 创建用户
  res.status(201).json({
    message: '用户创建成功（经过验证和重复检查）',
    user: {
      id: Date.now(),
      ...req.validatedUser,
    },
  });
};

// 注册路由，传入多个处理函数
// 注意：需要先配置 express.json() 中间件才能解析请求体
app.use(express.json());
app.post('/api/register', validateUser, checkDuplicate, createUser);

// ============================================
// 404 处理
// ============================================
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: `路径 ${req.method} ${req.path} 不存在`,
    availableRoutes: [
      'GET /api/users',
      'GET /api/users/:id',
      'POST /api/users',
      'GET /api/users/:userId/posts',
      'GET /api/users/:userId/posts/:postId',
      'GET /api/products',
      'GET /api/products/:id',
      'GET /api/orders',
      'GET /api/articles/:year/:month',
      'GET /api/docs/*',
      'GET /api/books',
      'GET /api/admin/dashboard (需要认证)',
      'POST /api/register',
    ],
  });
});

// ============================================
// 启动服务器
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`  Express 5 路由教程服务器已启动`);
  console.log(`  访问地址: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('路由模块化示例：');
  console.log('  /api/users          -> userRouter');
  console.log('  /api/users/:userId/posts -> 嵌套 postRouter');
  console.log('  /api/products       -> productRouter');
  console.log('  /api/orders         -> orderRouter');
  console.log('  /api/admin/*        -> adminRouter (需要认证)');
  console.log('');
  console.log('路由参数示例：');
  console.log('  /api/articles/:year(\\\\d{4})/:month(\\\\d{2})');
  console.log('  /api/docs/{*path}   (Express 5 通配符)');
  console.log('');
  console.log('测试认证路由：');
  console.log('  curl -H "Authorization: Bearer my-token" http://localhost:3001/api/admin/dashboard');
  console.log('');
});
