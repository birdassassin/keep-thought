# Express.js 5 完整教程示例

> Express 5.0 于 2025 年 2 月正式发布，这是 Express 诞生 10 年来的首次大版本更新。
> 本教程面向 Node.js 新手，通过丰富的代码示例帮助你快速掌握 Express 5 的核心概念。

---

## 环境要求

| 依赖 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 18.0.0+ | 20.x LTS 或 22.x LTS |
| npm | 9.0.0+ | 10.x |
| Express | 5.0.0+ | 最新 5.x |

## 快速开始

```bash
# 1. 初始化项目
npm init -y

# 2. 安装 Express 5
npm install express@5

# 3. 运行示例
node src/examples/01-basics.js
```

## Express 5 新特性概览

### 1. 原生 async/await 路由处理（最重要）

Express 5 最大的改进是原生支持异步路由处理函数。在 Express 4 中，如果异步路由抛出错误，你需要手动调用 `next(err)` 来传递错误。Express 5 会自动捕获 Promise rejection。

```javascript
// Express 4 - 需要手动 try/catch
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err); // 必须手动传递错误
  }
});

// Express 5 - 自动捕获异步错误
app.get('/users', async (req, res) => {
  const users = await User.findAll(); // 如果出错，Express 5 自动处理
  res.json(users);
});
```

### 2. path-to-regexp 路由语法更新

Express 5 使用 `path-to-regexp` 新版本，路由匹配语法发生了变化：

```javascript
// Express 4 语法（已废弃）
app.get('/users/:id([0-9]+)', handler);

// Express 5 新语法
app.get('/users/:id(\\d+)', handler);

// Express 5 支持正则命名组
app.get('/users/:id(\\d+)', handler);
```

**主要变化：**
- `*` 通配符改为 `{*path}` 或 `{*anyName}` 语法
- 不再支持 `.` 作为可选字符（如 `/user.:format`）
- 命名参数使用 `{:name}` 语法
- 正则约束使用 `(:name)` 语法

```javascript
// Express 4
app.get('/files/*', handler);

// Express 5
app.get('/files/{*path}', handler);
```

### 3. 移除已废弃的 API

以下在 Express 4 中已废弃的方法在 Express 5 中被完全移除：

| 移除的 API | 替代方案 |
|-----------|---------|
| `app.del()` | 使用 `app.delete()` |
| `app.param(fn)` | 在路由处理函数中直接获取参数 |
| `req.param(name)` | 使用 `req.params`、`req.query` 或 `req.body` |
| `req.host` | 使用 `req.hostname`（不含端口号） |
| `req.acceptsCharset()` | 使用 `req.acceptsCharsets()` |
| `req.acceptsEncoding()` | 使用 `req.acceptsEncodings()` |
| `req.acceptsLanguage()` | 使用 `req.acceptsLanguages()` |
| `res.json(obj, status)` | 使用 `res.status(status).json(obj)` |
| `res.jsonp(obj, status)` | 使用 `res.status(status).jsonp(obj)` |
| `res.redirect(url, status)` | 使用 `res.redirect(status, url)` |
| `res.send(body, status)` | 使用 `res.status(status).send(body)` |
| `res.send(status)` | 使用 `res.sendStatus(status)` |
| `res.sendfile()` | 使用 `res.sendFile()` |
| `app.router` | 已移除（路由直接挂载） |
| `req.host` | 使用 `req.hostname` |

### 4. 其他改进

- **`res.redirect()` 不再回退到 `req.headers.referer`**：必须明确指定重定向目标
- **`res.render()` 只接受对象作为参数**：不再支持 `res.render(view, locals, callback)` 中的字符串 locals
- **改进的错误处理**：更清晰的错误堆栈信息
- **更好的 `app.route()` 支持**：链式路由定义更加一致

## Express 4 vs Express 5 对比

| 特性 | Express 4 | Express 5 |
|------|-----------|-----------|
| 异步错误处理 | 需要手动 try/catch + next(err) | 自动捕获 Promise rejection |
| 路由语法 | 旧版 path-to-regexp | 新版 path-to-regexp |
| `app.del()` | 可用（已废弃） | 已移除 |
| `req.param()` | 可用（已废弃） | 已移除 |
| `res.send(status)` | 可用 | 已移除 |
| 通配符路由 | `*` | `{*name}` |
| 路径参数正则 | `:id(\\d+)` | `:id(\\d+)`（语法微调） |
| Node.js 最低版本 | 0.10.0 | 18.0.0 |
| 发布时间 | 2014 年 | 2025 年 2 月 |

## 示例目录

| 文件 | 内容 | 难度 |
|------|------|------|
| [01-basics.js](src/examples/01-basics.js) | Hello World、HTTP 方法、req/res 对象、路由参数、查询参数、中间件基础 | 入门 |
| [02-routing.js](src/examples/02-routing.js) | Express Router、嵌套路由、路由模块化、正则路由、路由分组 | 进阶 |
| [03-middleware.js](src/examples/03-middleware.js) | 内置中间件、错误处理中间件、第三方中间件、中间件链、自定义中间件 | 进阶 |
| [04-error-handling.js](src/examples/04-error-handling.js) | 错误处理中间件、自定义错误类、404 处理、异步错误处理、全局错误处理 | 进阶 |
| [05-rest-api.js](src/examples/05-rest-api.js) | RESTful API 完整示例（Todo CRUD）、请求验证、分页、统一响应格式 | 实战 |
| [06-auth.js](src/examples/06-auth.js) | JWT 认证、bcrypt 密码加密、登录注册、Token 中间件、权限控制 | 实战 |
| [07-migration.md](src/examples/07-migration.md) | Express 4 到 5 迁移指南、破坏性变更列表、迁移步骤 | 参考 |

## 学习建议

1. **按顺序学习**：从 01 到 06 依次学习，每个示例都建立在前一个的基础之上
2. **动手实践**：不要只看代码，要亲自运行每个示例
3. **查阅文档**：遇到问题时，参考 [Express 5 官方文档](https://expressjs.com/)
4. **阅读迁移指南**：如果你有 Express 4 经验，请先阅读 07-migration.md

## 许可证

MIT
