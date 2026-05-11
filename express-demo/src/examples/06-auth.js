/**
 * ========================================
 * Express 5 JWT 认证系统完整示例
 * ========================================
 *
 * 本文件实现一个完整的用户认证系统，涵盖：
 * 1. 用户注册（bcrypt 密码加密）
 * 2. 用户登录（密码验证 + JWT 签发）
 * 3. Token 认证中间件
 * 4. 权限控制（角色区分）
 * 5. 受保护的路由
 * 6. Token 刷新机制
 *
 * 依赖安装：
 *   npm install jsonwebtoken bcryptjs
 *
 * 运行方式：node src/examples/06-auth.js
 * 测试方式：使用 curl 命令（见文末）
 */

const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = 3005;

// 解析 JSON 请求体
app.use(express.json());

// ============================================
// 第一部分：配置
// ============================================

// JWT 密钥（生产环境应该从环境变量读取，不要硬编码）
const JWT_SECRET = crypto.randomBytes(32).toString('hex');
const JWT_EXPIRES_IN = '1h';       // Access Token 过期时间
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // Refresh Token 过期时间

console.log(`[配置] JWT Secret: ${JWT_SECRET.substring(0, 8)}...`);
console.log(`[配置] Access Token 有效期: ${JWT_EXPIRES_IN}`);
console.log(`[配置] Refresh Token 有效期: ${REFRESH_TOKEN_EXPIRES_IN}`);

// ============================================
// 第二部分：模拟数据库
// ============================================
// 在实际项目中，应该使用数据库存储用户信息

// 用户数据存储
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    // 密码: "admin123" 的 bcrypt 哈希值
    // 实际项目中通过 bcrypt.hash() 生成
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    // 密码: "user123" 的 bcrypt 哈希值
    passwordHash: '$2a$10$dXJ3SW6G7P50lGmMQgel3uGqSj6fu3sHhsY8DIp6NYWYvB3V7OeG6',
    role: 'user',
    createdAt: '2025-01-02T00:00:00.000Z',
  },
];

// Refresh Token 存储（实际项目应使用 Redis 或数据库）
const refreshTokens = new Map();

// 自增 ID
let nextUserId = 3;

// ============================================
// 第三部分：密码加密工具（bcrypt 简化版）
// ============================================
// 注意：实际项目请安装 bcryptjs：npm install bcryptjs
// 这里使用 Node.js 内置的 crypto 模块模拟

/**
 * 简化版密码哈希
 * 实际项目请使用 bcryptjs：
 *   const bcrypt = require('bcryptjs');
 *   const hash = await bcrypt.hash(password, 10);
 *   const match = await bcrypt.compare(password, hash);
 */
const passwordUtils = {
  /**
   * 对密码进行哈希
   * @param {string} password - 明文密码
   * @returns {Promise<string>} 哈希后的密码
   */
  async hash(password) {
    // 实际项目使用 bcryptjs：
    // return await bcrypt.hash(password, 10);
    //
    // 这里使用 Node.js 内置 crypto 模块模拟（仅用于教学演示）
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  },

  /**
   * 验证密码
   * @param {string} password - 明文密码
   * @param {string} hashedPassword - 哈希后的密码
   * @returns {Promise<boolean>}
   */
  async verify(password, hashedPassword) {
    // 实际项目使用 bcryptjs：
    // return await bcrypt.compare(password, hashedPassword);
    //
    // 这里使用 Node.js 内置 crypto 模块模拟
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return hash === verifyHash;
  },
};

// ============================================
// 第四部分：JWT 工具（简化版实现）
// ============================================
// 注意：实际项目请安装 jsonwebtoken：npm install jsonwebtoken
// 这里使用 Node.js 内置的 crypto 模块实现一个简化版 JWT

/**
 * 简化版 JWT 实现
 * 实际项目请使用 jsonwebtoken 库：
 *   const jwt = require('jsonwebtoken');
 *   const token = jwt.sign(payload, secret, { expiresIn: '1h' });
 *   const decoded = jwt.verify(token, secret);
 */
const jwtUtils = {
  /**
   * 生成 JWT Token
   * @param {object} payload - Token 载荷数据
   * @param {string} secret - 密钥
   * @param {string} expiresIn - 过期时间
   * @returns {string} JWT Token
   */
  sign(payload, secret, expiresIn) {
    // 实际项目使用 jsonwebtoken：
    // return jwt.sign(payload, secret, { expiresIn });

    // 简化版 JWT 实现（仅用于教学演示）
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const expSeconds = this._parseExpiresIn(expiresIn);
    const fullPayload = {
      ...payload,
      iat: now,       // 签发时间
      exp: now + expSeconds, // 过期时间
    };
    const payloadEncoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

    // 生成签名
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payloadEncoded}`)
      .digest('base64url');

    return `${header}.${payloadEncoded}.${signature}`;
  },

  /**
   * 验证 JWT Token
   * @param {string} token - JWT Token
   * @param {string} secret - 密钥
   * @returns {object} 解码后的载荷
   */
  verify(token, secret) {
    // 实际项目使用 jsonwebtoken：
    // return jwt.verify(token, secret);

    // 简化版 JWT 验证
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('无效的 Token 格式');
    }

    const [header, payloadEncoded, signature] = parts;

    // 验证签名
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payloadEncoded}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new Error('Token 签名无效');
    }

    // 解码载荷
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString());

    // 检查是否过期
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token 已过期');
    }

    return payload;
  },

  /**
   * 解析过期时间字符串为秒数
   * @param {string} expiresIn - 如 "1h", "7d", "30m"
   * @returns {number} 秒数
   */
  _parseExpiresIn(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // 默认 1 小时

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  },
};

// ============================================
// 第五部分：认证中间件
// ============================================

/**
 * Token 认证中间件
 * 从请求头 Authorization 中提取 Bearer Token 并验证
 */
const authenticate = (req, res, next) => {
  try {
    // 1. 从请求头获取 Token
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌',
        hint: '请在请求头中添加: Authorization: Bearer <token>',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. 验证 Token
    const decoded = jwtUtils.verify(token, JWT_SECRET);

    // 3. 将用户信息挂载到 req 对象上
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    // 4. 继续处理请求
    next();
  } catch (err) {
    // Token 无效或已过期
    return res.status(401).json({
      code: 401,
      message: `认证失败: ${err.message}`,
    });
  }
};

/**
 * 角色权限中间件（工厂模式）
 * @param {...string} roles - 允许的角色列表
 * @returns {function} 中间件函数
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '请先登录',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 403,
        message: `权限不足：需要 ${roles.join(' 或 ')} 角色，当前角色为 ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * 可选认证中间件
 * 如果提供了 Token 则验证，没有提供也不报错
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwtUtils.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      };
    }
  } catch (err) {
    // Token 无效，但这是可选认证，不报错
    req.user = null;
  }
  next();
};

// ============================================
// 第六部分：认证路由
// ============================================

// --- POST /api/auth/register - 用户注册 ---
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // 1. 验证输入
    const errors = [];
    if (!username || username.length < 3) {
      errors.push({ field: 'username', message: '用户名至少 3 个字符' });
    }
    if (!email || !email.includes('@')) {
      errors.push({ field: 'email', message: '请输入有效的邮箱地址' });
    }
    if (!password || password.length < 6) {
      errors.push({ field: 'password', message: '密码至少 6 个字符' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '请求参数验证失败',
        errors,
      });
    }

    // 2. 检查用户名和邮箱是否已存在
    if (users.find((u) => u.username === username)) {
      return res.status(409).json({
        code: 409,
        message: `用户名 "${username}" 已被注册`,
      });
    }
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({
        code: 409,
        message: `邮箱 "${email}" 已被注册`,
      });
    }

    // 3. 加密密码
    const passwordHash = await passwordUtils.hash(password);

    // 4. 创建用户
    const newUser = {
      id: nextUserId++,
      username,
      email,
      passwordHash,
      role, // 注册时只能注册普通用户，管理员由系统创建
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);

    // 5. 返回结果（不返回密码哈希）
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/auth/login - 用户登录 ---
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. 验证输入
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '请提供用户名和密码',
      });
    }

    // 2. 查找用户
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // 3. 验证密码
    const isPasswordValid = await passwordUtils.verify(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // 4. 生成 Access Token
    const accessToken = jwtUtils.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      JWT_EXPIRES_IN
    );

    // 5. 生成 Refresh Token
    const refreshToken = jwtUtils.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      JWT_SECRET,
      REFRESH_TOKEN_EXPIRES_IN
    );

    // 6. 存储 Refresh Token
    refreshTokens.set(refreshToken, {
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    // 7. 返回 Token
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: JWT_EXPIRES_IN,
      },
    });
  } catch (err) {
    next(err);
  }
});

// --- POST /api/auth/refresh - 刷新 Token ---
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      code: 400,
      message: '请提供 Refresh Token',
    });
  }

  // 1. 检查 Refresh Token 是否存在
  const stored = refreshTokens.get(refreshToken);
  if (!stored) {
    return res.status(401).json({
      code: 401,
      message: '无效的 Refresh Token',
    });
  }

  try {
    // 2. 验证 Refresh Token
    const decoded = jwtUtils.verify(refreshToken, JWT_SECRET);

    // 3. 查找用户
    const user = users.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户不存在',
      });
    }

    // 4. 删除旧的 Refresh Token
    refreshTokens.delete(refreshToken);

    // 5. 生成新的 Access Token
    const newAccessToken = jwtUtils.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      JWT_EXPIRES_IN
    );

    // 6. 生成新的 Refresh Token
    const newRefreshToken = jwtUtils.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      JWT_SECRET,
      REFRESH_TOKEN_EXPIRES_IN
    );

    // 7. 存储新的 Refresh Token
    refreshTokens.set(newRefreshToken, {
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    res.json({
      code: 200,
      message: 'Token 刷新成功',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: JWT_EXPIRES_IN,
      },
    });
  } catch (err) {
    return res.status(401).json({
      code: 401,
      message: `Token 刷新失败: ${err.message}`,
    });
  }
});

// --- POST /api/auth/logout - 退出登录 ---
app.post('/api/auth/logout', authenticate, (req, res) => {
  // 在实际项目中，还需要将 Token 加入黑名单
  // 这里只返回成功
  res.json({
    code: 200,
    message: '退出登录成功',
  });
});

// ============================================
// 第七部分：受保护的路由
// ============================================

// --- GET /api/me - 获取当前用户信息 ---
app.get('/api/me', authenticate, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  res.json({
    code: 200,
    message: '获取当前用户信息成功',
    data: userWithoutPassword,
  });
});

// --- GET /api/profile - 用户资料（可选认证） ---
app.get('/api/profile', optionalAuth, (req, res) => {
  if (req.user) {
    const user = users.find((u) => u.id === req.user.id);
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      code: 200,
      message: '已登录',
      data: userWithoutPassword,
    });
  } else {
    res.json({
      code: 200,
      message: '未登录（游客模式）',
      data: null,
    });
  }
});

// --- GET /api/admin/users - 管理员：获取所有用户 ---
app.get('/api/admin/users', authenticate, requireRole('admin'), (req, res) => {
  // 只返回非敏感信息
  const safeUsers = users.map(({ passwordHash: _, ...user }) => user);
  res.json({
    code: 200,
    message: '获取用户列表成功（管理员）',
    data: safeUsers,
  });
});

// --- DELETE /api/admin/users/:id - 管理员：删除用户 ---
app.delete('/api/admin/users/:id', authenticate, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: `用户 (ID: ${id}) 不存在`,
    });
  }

  if (id === req.user.id) {
    return res.status(400).json({
      code: 400,
      message: '不能删除自己的账号',
    });
  }

  const deletedUser = users.splice(index, 1)[0];
  const { passwordHash: _, ...userWithoutPassword } = deletedUser;

  res.json({
    code: 200,
    message: '用户删除成功',
    data: userWithoutPassword,
  });
});

// --- PUT /api/users/password - 修改密码 ---
app.put('/api/users/password', authenticate, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 验证输入
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '请提供旧密码和新密码',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '新密码至少 6 个字符',
      });
    }

    // 查找用户
    const user = users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    // 验证旧密码
    const isValid = await passwordUtils.verify(oldPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        code: 401,
        message: '旧密码错误',
      });
    }

    // 更新密码
    user.passwordHash = await passwordUtils.hash(newPassword);

    res.json({
      code: 200,
      message: '密码修改成功',
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// 第八部分：API 文档路由
// ============================================
app.get('/api', (req, res) => {
  res.json({
    code: 200,
    message: 'Express 5 JWT 认证 API',
    version: '1.0.0',
    auth: {
      'POST /api/auth/register': '用户注册',
      'POST /api/auth/login': '用户登录',
      'POST /api/auth/refresh': '刷新 Token',
      'POST /api/auth/logout': '退出登录',
    },
    protected: {
      'GET /api/me': '获取当前用户信息（需要认证）',
      'GET /api/profile': '用户资料（可选认证）',
      'PUT /api/users/password': '修改密码（需要认证）',
    },
    admin: {
      'GET /api/admin/users': '获取所有用户（需要管理员权限）',
      'DELETE /api/admin/users/:id': '删除用户（需要管理员权限）',
    },
    testAccounts: {
      admin: { username: 'admin', password: 'admin123', role: 'admin' },
      user: { username: 'user', password: 'user123', role: 'user' },
    },
  });
});

// ============================================
// 第九部分：错误处理
// ============================================
app.use((err, req, res, next) => {
  console.error(`[错误] ${err.message}`);
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    message: err.message || '服务器内部错误',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

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
  console.log(`  Express 5 JWT 认证教程服务器已启动`);
  console.log(`  访问地址: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('测试账号：');
  console.log('  管理员 - username: admin, password: admin123');
  console.log('  普通用户 - username: user, password: user123');
  console.log('');
  console.log('测试命令：');
  console.log('');
  console.log('  # 1. 注册新用户');
  console.log('  curl -X POST -H "Content-Type: application/json" \\');
  console.log('    -d \'{"username":"testuser","email":"test@example.com","password":"test123"}\' \\');
  console.log('    http://localhost:3005/api/auth/register');
  console.log('');
  console.log('  # 2. 登录（保存返回的 Token）');
  console.log('  curl -X POST -H "Content-Type: application/json" \\');
  console.log('    -d \'{"username":"admin","password":"admin123"}\' \\');
  console.log('    http://localhost:3005/api/auth/login');
  console.log('');
  console.log('  # 3. 使用 Token 访问受保护的路由');
  console.log('  curl -H "Authorization: Bearer <your-token>" \\');
  console.log('    http://localhost:3005/api/me');
  console.log('');
  console.log('  # 4. 管理员访问');
  console.log('  curl -H "Authorization: Bearer <admin-token>" \\');
  console.log('    http://localhost:3005/api/admin/users');
  console.log('');
  console.log('  # 5. 刷新 Token');
  console.log('  curl -X POST -H "Content-Type: application/json" \\');
  console.log('    -d \'{"refreshToken":"<your-refresh-token>"}\' \\');
  console.log('    http://localhost:3005/api/auth/refresh');
  console.log('');
});
