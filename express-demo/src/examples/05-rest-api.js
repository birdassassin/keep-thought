/**
 * ========================================
 * Express 5 RESTful API 完整示例
 * ========================================
 *
 * 本文件实现一个完整的 Todo（待办事项）RESTful API，涵盖：
 * 1. RESTful API 设计规范
 * 2. CRUD 操作（创建、读取、更新、删除）
 * 3. 请求参数验证
 * 4. 分页查询
 * 5. 统一响应格式
 * 6. 内存数据存储（模拟数据库）
 *
 * RESTful API 设计规范：
 * - 使用 HTTP 方法表示操作类型：GET(读) POST(创建) PUT(更新) DELETE(删除)
 * - 使用名词复数作为资源路径：/api/todos
 * - 使用 HTTP 状态码表示结果：200(成功) 201(创建) 204(无内容) 400(错误) 404(未找到)
 * - 使用查询参数进行过滤和分页：?page=1&limit=10&status=active
 *
 * 运行方式：node src/examples/05-rest-api.js
 * 测试方式：使用 curl 命令（见文末）
 */

const express = require('express');

const app = express();
const PORT = 3004;

// ============================================
// 中间件配置
// ============================================
app.use(express.json()); // 解析 JSON 请求体

// ============================================
// 第一部分：统一响应格式
// ============================================
// 所有 API 响应使用统一的 JSON 格式，方便前端统一处理

/**
 * 成功响应格式：
 * {
 *   code: 200,          // 业务状态码（与 HTTP 状态码一致）
 *   message: "成功",     // 提示消息
 *   data: { ... }       // 响应数据
 * }
 *
 * 错误响应格式：
 * {
 *   code: 400,          // 业务状态码
 *   message: "错误信息", // 错误描述
 *   errors: [ ... ]     // 详细错误列表（可选）
 * }
 *
 * 分页响应格式：
 * {
 *   code: 200,
 *   message: "成功",
 *   data: [ ... ],      // 当前页数据
 *   pagination: {       // 分页信息
 *     page: 1,          // 当前页码
 *     limit: 10,        // 每页数量
 *     total: 100,       // 总记录数
 *     totalPages: 10    // 总页数
 *   }
 * }
 */

// ============================================
// 第二部分：自定义错误类
// ============================================

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, fields) {
    super(message, 400);
    this.fields = fields;
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} (ID: ${id}) 未找到`, 404);
  }
}

// ============================================
// 第三部分：模拟数据库
// ============================================
// 使用内存数组模拟数据库存储
// 在实际项目中，应该使用数据库（如 MongoDB、PostgreSQL、MySQL）

// 初始数据
let todos = [
  { id: 1, title: '学习 Express 5 基础', description: '完成 Express 5 基础教程', status: 'completed', priority: 'high', createdAt: '2025-01-15T08:00:00.000Z', updatedAt: '2025-01-15T10:00:00.000Z' },
  { id: 2, title: '学习中间件', description: '掌握 Express 中间件的使用', status: 'in_progress', priority: 'medium', createdAt: '2025-01-16T09:00:00.000Z', updatedAt: '2025-01-16T09:00:00.000Z' },
  { id: 3, title: '学习路由系统', description: '掌握 Express Router 的使用', status: 'pending', priority: 'high', createdAt: '2025-01-17T10:00:00.000Z', updatedAt: '2025-01-17T10:00:00.000Z' },
  { id: 4, title: '学习错误处理', description: '掌握 Express 错误处理机制', status: 'pending', priority: 'low', createdAt: '2025-01-18T11:00:00.000Z', updatedAt: '2025-01-18T11:00:00.000Z' },
  { id: 5, title: '构建 RESTful API', description: '实现完整的 CRUD API', status: 'in_progress', priority: 'high', createdAt: '2025-01-19T12:00:00.000Z', updatedAt: '2025-01-19T12:00:00.000Z' },
  { id: 6, title: '学习 JWT 认证', description: '实现用户认证功能', status: 'pending', priority: 'medium', createdAt: '2025-01-20T13:00:00.000Z', updatedAt: '2025-01-20T13:00:00.000Z' },
  { id: 7, title: '部署到生产环境', description: '将应用部署到服务器', status: 'pending', priority: 'low', createdAt: '2025-01-21T14:00:00.000Z', updatedAt: '2025-01-21T14:00:00.000Z' },
];

// 自增 ID 计数器
let nextId = 8;

// ============================================
// 第四部分：请求验证工具
// ============================================

/**
 * 验证创建 Todo 的请求体
 * @param {object} body - 请求体
 * @returns {{ valid: boolean, errors: Array }}
 */
function validateCreateTodo(body) {
  const errors = [];

  // title 是必填字段
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    errors.push({ field: 'title', message: '标题是必填项，且不能为空' });
  } else if (body.title.length > 100) {
    errors.push({ field: 'title', message: '标题不能超过 100 个字符' });
  }

  // description 是可选的，但如果提供了必须是字符串
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push({ field: 'description', message: '描述必须是字符串' });
  }

  // status 如果提供了，必须是有效值
  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (body.status !== undefined && !validStatuses.includes(body.status)) {
    errors.push({ field: 'status', message: `状态必须是以下之一: ${validStatuses.join(', ')}` });
  }

  // priority 如果提供了，必须是有效值
  const validPriorities = ['low', 'medium', 'high'];
  if (body.priority !== undefined && !validPriorities.includes(body.priority)) {
    errors.push({ field: 'priority', message: `优先级必须是以下之一: ${validPriorities.join(', ')}` });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证更新 Todo 的请求体
 * @param {object} body - 请求体
 * @returns {{ valid: boolean, errors: Array }}
 */
function validateUpdateTodo(body) {
  const errors = [];

  // 更新时所有字段都是可选的，但如果提供了需要验证格式
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push({ field: 'title', message: '标题不能为空' });
    } else if (body.title.length > 100) {
      errors.push({ field: 'title', message: '标题不能超过 100 个字符' });
    }
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push({ field: 'description', message: '描述必须是字符串' });
  }

  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (body.status !== undefined && !validStatuses.includes(body.status)) {
    errors.push({ field: 'status', message: `状态必须是以下之一: ${validStatuses.join(', ')}` });
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (body.priority !== undefined && !validPriorities.includes(body.priority)) {
    errors.push({ field: 'priority', message: `优先级必须是以下之一: ${validPriorities.join(', ')}` });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// 第五部分：分页工具
// ============================================

/**
 * 解析分页参数
 * @param {object} query - 查询参数对象
 * @returns {{ page: number, limit: number, offset: number }}
 */
function parsePagination(query) {
  // 默认值
  const page = Math.max(1, parseInt(query.page, 10) || 1);   // 页码，最小为 1
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10)); // 每页数量，1-100
  const offset = (page - 1) * limit; // 偏移量

  return { page, limit, offset };
}

/**
 * 构建分页元数据
 * @param {number} page - 当前页码
 * @param {number} limit - 每页数量
 * @param {number} total - 总记录数
 * @returns {object}
 */
function buildPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

// ============================================
// 第六部分：CRUD 路由
// ============================================

// --- GET /api/todos - 获取 Todo 列表（支持分页和过滤） ---
app.get('/api/todos', (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);

  // 过滤条件
  let filteredTodos = [...todos];

  // 按状态过滤
  if (req.query.status) {
    filteredTodos = filteredTodos.filter((todo) => todo.status === req.query.status);
  }

  // 按优先级过滤
  if (req.query.priority) {
    filteredTodos = filteredTodos.filter((todo) => todo.priority === req.query.priority);
  }

  // 按关键词搜索（模糊匹配标题和描述）
  if (req.query.search) {
    const keyword = req.query.search.toLowerCase();
    filteredTodos = filteredTodos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(keyword) ||
        todo.description.toLowerCase().includes(keyword)
    );
  }

  // 排序
  if (req.query.sort) {
    const [field, order] = req.query.sort.split(':');
    const sortOrder = order === 'desc' ? -1 : 1;
    filteredTodos.sort((a, b) => {
      if (a[field] < b[field]) return -1 * sortOrder;
      if (a[field] > b[field]) return 1 * sortOrder;
      return 0;
    });
  }

  // 计算总数（在分页之前）
  const total = filteredTodos.length;

  // 分页
  const paginatedTodos = filteredTodos.slice(offset, offset + limit);

  res.json({
    code: 200,
    message: '获取 Todo 列表成功',
    data: paginatedTodos,
    pagination: buildPagination(page, limit, total),
  });
});

// --- GET /api/todos/stats - 获取 Todo 统计信息 ---
app.get('/api/todos/stats', (req, res) => {
  const stats = {
    total: todos.length,
    byStatus: {
      pending: todos.filter((t) => t.status === 'pending').length,
      in_progress: todos.filter((t) => t.status === 'in_progress').length,
      completed: todos.filter((t) => t.status === 'completed').length,
    },
    byPriority: {
      high: todos.filter((t) => t.priority === 'high').length,
      medium: todos.filter((t) => t.priority === 'medium').length,
      low: todos.filter((t) => t.priority === 'low').length,
    },
  };

  res.json({
    code: 200,
    message: '获取统计信息成功',
    data: stats,
  });
});

// --- GET /api/todos/:id - 获取单个 Todo ---
app.get('/api/todos/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return next(new NotFoundError('Todo', id));
  }

  res.json({
    code: 200,
    message: '获取 Todo 成功',
    data: todo,
  });
});

// --- POST /api/todos - 创建 Todo ---
app.post('/api/todos', (req, res, next) => {
  // 验证请求体
  const validation = validateCreateTodo(req.body);
  if (!validation.valid) {
    return next(new ValidationError('请求参数验证失败', validation.errors));
  }

  // 创建新 Todo
  const now = new Date().toISOString();
  const newTodo = {
    id: nextId++,
    title: req.body.title.trim(),
    description: (req.body.description || '').trim(),
    status: req.body.status || 'pending',        // 默认状态
    priority: req.body.priority || 'medium',     // 默认优先级
    createdAt: now,
    updatedAt: now,
  };

  todos.push(newTodo);

  res.status(201).json({
    code: 201,
    message: 'Todo 创建成功',
    data: newTodo,
  });
});

// --- PUT /api/todos/:id - 更新 Todo（完整替换） ---
app.put('/api/todos/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return next(new NotFoundError('Todo', id));
  }

  // 验证请求体（PUT 要求提供完整数据）
  const validation = validateCreateTodo(req.body);
  if (!validation.valid) {
    return next(new ValidationError('请求参数验证失败', validation.errors));
  }

  // 完整替换
  todos[index] = {
    ...todos[index],
    title: req.body.title.trim(),
    description: (req.body.description || '').trim(),
    status: req.body.status || todos[index].status,
    priority: req.body.priority || todos[index].priority,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    code: 200,
    message: 'Todo 更新成功',
    data: todos[index],
  });
});

// --- PATCH /api/todos/:id - 部分更新 Todo ---
app.patch('/api/todos/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return next(new NotFoundError('Todo', id));
  }

  // 验证请求体（PATCH 只验证提供的字段）
  const validation = validateUpdateTodo(req.body);
  if (!validation.valid) {
    return next(new ValidationError('请求参数验证失败', validation.errors));
  }

  // 部分更新：只更新提供的字段
  const updates = { ...req.body };
  delete updates.id;         // 不允许更新 id
  delete updates.createdAt;  // 不允许更新创建时间

  todos[index] = {
    ...todos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  res.json({
    code: 200,
    message: 'Todo 部分更新成功',
    data: todos[index],
  });
});

// --- DELETE /api/todos/:id - 删除 Todo ---
app.delete('/api/todos/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return next(new NotFoundError('Todo', id));
  }

  const deletedTodo = todos.splice(index, 1)[0];

  res.json({
    code: 200,
    message: 'Todo 删除成功',
    data: deletedTodo,
  });
});

// --- DELETE /api/todos/completed - 批量删除已完成的 Todo ---
app.delete('/api/todos/completed', (req, res) => {
  const before = todos.length;
  const deletedTodos = todos.filter((t) => t.status === 'completed');
  todos = todos.filter((t) => t.status !== 'completed');
  const deletedCount = before - todos.length;

  res.json({
    code: 200,
    message: `已删除 ${deletedCount} 个已完成的 Todo`,
    data: { deletedCount, deletedTodos },
  });
});

// ============================================
// 第七部分：API 根路由
// ============================================
app.get('/api', (req, res) => {
  res.json({
    code: 200,
    message: 'Todo RESTful API',
    version: '1.0.0',
    endpoints: {
      'GET /api/todos': '获取 Todo 列表（支持分页、过滤、搜索）',
      'GET /api/todos/stats': '获取 Todo 统计信息',
      'GET /api/todos/:id': '获取单个 Todo',
      'POST /api/todos': '创建 Todo',
      'PUT /api/todos/:id': '更新 Todo（完整替换）',
      'PATCH /api/todos/:id': '部分更新 Todo',
      'DELETE /api/todos/:id': '删除 Todo',
      'DELETE /api/todos/completed': '批量删除已完成的 Todo',
    },
    queryParameters: {
      page: '页码（默认: 1）',
      limit: '每页数量（默认: 10, 最大: 100）',
      status: '按状态过滤（pending / in_progress / completed）',
      priority: '按优先级过滤（low / medium / high）',
      search: '搜索关键词（匹配标题和描述）',
      sort: '排序字段（如: createdAt:desc, priority:asc）',
    },
  });
});

// ============================================
// 第八部分：错误处理中间件
// ============================================
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    code: err.statusCode,
    message: err.message,
    errors: err.fields || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 404 处理
app.all('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: `路径 ${req.method} ${req.path} 不存在`,
    hint: '访问 GET /api 查看 API 文档',
  });
});

// ============================================
// 启动服务器
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`  Express 5 RESTful API 教程服务器已启动`);
  console.log(`  访问地址: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('API 端点：');
  console.log('  GET    /api                    - API 文档');
  console.log('  GET    /api/todos              - 获取列表');
  console.log('  GET    /api/todos/stats        - 统计信息');
  console.log('  GET    /api/todos/:id          - 获取详情');
  console.log('  POST   /api/todos              - 创建');
  console.log('  PUT    /api/todos/:id          - 完整更新');
  console.log('  PATCH  /api/todos/:id          - 部分更新');
  console.log('  DELETE /api/todos/:id          - 删除');
  console.log('  DELETE /api/todos/completed    - 批量删除');
  console.log('');
  console.log('测试命令：');
  console.log('');
  console.log('  # 获取所有 Todo');
  console.log('  curl http://localhost:3004/api/todos');
  console.log('');
  console.log('  # 分页查询（第 1 页，每页 5 条）');
  console.log('  curl "http://localhost:3004/api/todos?page=1&limit=5"');
  console.log('');
  console.log('  # 按状态过滤');
  console.log('  curl "http://localhost:3004/api/todos?status=pending"');
  console.log('');
  console.log('  # 搜索');
  console.log('  curl "http://localhost:3004/api/todos?search=Express"');
  console.log('');
  console.log('  # 创建 Todo');
  console.log('  curl -X POST -H "Content-Type: application/json" \\');
  console.log('    -d \'{"title":"新任务","description":"任务描述","priority":"high"}\' \\');
  console.log('    http://localhost:3004/api/todos');
  console.log('');
  console.log('  # 部分更新 Todo');
  console.log('  curl -X PATCH -H "Content-Type: application/json" \\');
  console.log('    -d \'{"status":"completed"}\' \\');
  console.log('    http://localhost:3004/api/todos/1');
  console.log('');
  console.log('  # 删除 Todo');
  console.log('  curl -X DELETE http://localhost:3004/api/todos/1');
  console.log('');
});
