# Express 4 到 Express 5 迁移指南

> Express 5.0 于 2025 年 2 月发布，是 Express 诞生 10 年来的首次大版本更新。本指南帮助你将现有的 Express 4 应用迁移到 Express 5。

---

## 目录

1. [迁移前的准备](#1-迁移前的准备)
2. [破坏性变更列表](#2-破坏性变更列表)
3. [逐步迁移步骤](#3-逐步迁移步骤)
4. [路由语法变更](#4-路由语法变更)
5. [移除的 API 及替代方案](#5-移除的-api-及替代方案)
6. [异步错误处理改进](#6-异步错误处理改进)
7. [常见问题与解决方案](#7-常见问题与解决方案)

---

## 1. 迁移前的准备

### 1.1 检查 Node.js 版本

Express 5 要求 **Node.js 18.0.0 或更高版本**。

```bash
node -v  # 确保 >= 18.0.0
```

### 1.2 检查当前 Express 版本

```bash
npm list express
```

### 1.3 运行测试

在迁移之前，确保你的测试套件全部通过：

```bash
npm test
```

### 1.4 检查依赖兼容性

检查你的第三方中间件和插件是否兼容 Express 5：

```bash
npm outdated
```

---

## 2. 破坏性变更列表

以下是 Express 5 的所有破坏性变更：

### 2.1 移除的方法和属性

| 变更类型 | 移除的 API | 替代方案 |
|---------|-----------|---------|
| 方法 | `app.del()` | 使用 `app.delete()` |
| 方法 | `req.param(name)` | 使用 `req.params`、`req.query` 或 `req.body` |
| 方法 | `req.host` | 使用 `req.hostname`（不含端口号） |
| 方法 | `req.acceptsCharset()` | 使用 `req.acceptsCharsets()` |
| 方法 | `req.acceptsEncoding()` | 使用 `req.acceptsEncodings()` |
| 方法 | `req.acceptsLanguage()` | 使用 `req.acceptsLanguages()` |
| 方法 | `res.send(status)` | 使用 `res.sendStatus(status)` |
| 方法 | `res.sendfile()` | 使用 `res.sendFile()`（注意大小写） |
| 属性 | `app.router` | 已移除（路由直接挂载，无需引用） |
| 方法 | `app.param(fn)`（回调形式） | 在路由处理函数中直接获取参数 |

### 2.2 行为变更

| 变更 | Express 4 | Express 5 |
|------|-----------|-----------|
| `res.redirect()` 回退 | 无目标时回退到 `Referer` | 必须明确指定目标 |
| `res.json(obj, status)` | 支持传递状态码 | 不支持，使用 `res.status(code).json(obj)` |
| `res.jsonp(obj, status)` | 支持传递状态码 | 不支持，使用 `res.status(code).jsonp(obj)` |
| `res.redirect(url, status)` | 支持 | 不支持，使用 `res.redirect(status, url)` |
| `res.send(body, status)` | 支持传递状态码 | 不支持，使用 `res.status(code).send(body)` |
| `res.render()` locals | 支持字符串 | 只接受对象 |
| 异步路由错误 | 需要手动捕获 | 自动捕获 Promise rejection |
| 路由通配符 | `*` | `{*name}` |
| 路径参数正则 | 旧版 path-to-regexp | 新版 path-to-regexp |

### 2.3 path-to-regexp 路由语法变更

这是影响最大的变更之一。Express 5 使用了新版的 `path-to-regexp` 库。

#### 通配符变更

```javascript
// Express 4 - 使用 * 通配符
app.get('/files/*', handler);     // 匹配 /files/anything
app.get('/*', handler);           // 匹配所有路径

// Express 5 - 使用 {*name} 语法
app.get('/files/{*path}', handler);  // 匹配 /files/anything
app.get('{*path}', handler);         // 匹配所有路径
```

#### 正则参数变更

```javascript
// Express 4
app.get('/users/:id([0-9]+)', handler);

// Express 5
app.get('/users/:id(\\d+)', handler);
```

#### 可选参数变更

```javascript
// Express 4 - 使用 ? 表示可选
app.get('/users/:id?', handler);

// Express 5 - 可选参数语法变化
// 注意：Express 5 的 path-to-regexp 对可选参数的处理方式不同
app.get('/users/{:id}', handler);
```

#### 点号处理变更

```javascript
// Express 4 - 点号是可选的
app.get('/user.:format', handler);
// 匹配 /user.json, /user.xml, /user (format 为空)

// Express 5 - 点号需要显式匹配
app.get('/user{.:format}', handler);
// 或者更明确地：
app.get('/user.:format', handler);
// 但行为可能不同，需要测试
```

---

## 3. 逐步迁移步骤

### 步骤 1：更新依赖

```bash
# 更新 Express 到 5.x
npm install express@5

# 如果使用 TypeScript，更新类型定义
npm install -D @types/express
```

### 步骤 2：修复 `app.del()` 调用

全局搜索并替换：

```bash
# 搜索所有 app.del() 调用
grep -r "app\.del(" src/
grep -r "router\.del(" src/
```

```javascript
// 修改前
app.del('/users/:id', handler);

// 修改后
app.delete('/users/:id', handler);
```

### 步骤 3：修复 `req.param()` 调用

```bash
# 搜索所有 req.param() 调用
grep -r "req\.param(" src/
```

```javascript
// 修改前
const id = req.param('id');

// 修改后 - 根据参数来源选择
const id = req.params.id;    // 路由参数 /users/:id
const id = req.query.id;     // 查询参数 /users?id=123
const id = req.body.id;      // 请求体 {"id": 123}
```

### 步骤 4：修复 `req.host` 调用

```javascript
// 修改前
const host = req.host;  // 可能包含端口号

// 修改后
const host = req.hostname;  // 只包含主机名
```

### 步骤 5：修复 `res.send(status)` 调用

```bash
# 搜索 res.send() 中传递数字的情况
grep -r "res\.send([0-9]" src/
```

```javascript
// 修改前
res.send(200);
res.send(404);
res.send(500);

// 修改后
res.sendStatus(200);
res.sendStatus(404);
res.sendStatus(500);
```

### 步骤 6：修复 `res.send(body, status)` 调用

```javascript
// 修改前
res.send('Not Found', 404);
res.json({ error: 'Not Found' }, 404);

// 修改后
res.status(404).send('Not Found');
res.status(404).json({ error: 'Not Found' });
```

### 步骤 7：修复 `res.sendfile()` 调用

```javascript
// 修改前
res.sendfile('/path/to/file.pdf');

// 修改后（注意大小写：File 而不是 file）
res.sendFile('/path/to/file.pdf');
```

### 步骤 8：修复 `res.redirect(url, status)` 调用

```javascript
// 修改前
res.redirect('/home', 301);

// 修改后
res.redirect(301, '/home');
```

### 步骤 9：修复 `app.param()` 回调

```javascript
// 修改前 - Express 4 的参数预处理回调
app.param('id', (req, res, next, id) => {
  // 预处理 id 参数
  req.userId = parseInt(id, 10);
  next();
});

// 修改后 - 在路由处理函数中直接处理
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  // ... 处理逻辑
});

// 或者使用中间件
const parseId = (req, res, next) => {
  if (req.params.id) {
    req.userId = parseInt(req.params.id, 10);
  }
  next();
};

app.get('/users/:id', parseId, (req, res) => {
  // req.userId 已可用
});
```

### 步骤 10：更新路由语法

```bash
# 搜索使用旧版通配符的路由
grep -rE "\/\*$|\/\*\)" src/
```

```javascript
// 修改前
app.get('/api/*', handler);

// 修改后
app.get('/api/{*path}', handler);
```

### 步骤 11：修复 `res.redirect()` 无目标调用

```javascript
// 修改前 - Express 4 会回退到 Referer
res.redirect('back');

// 修改后 - 必须明确指定
const backUrl = req.get('Referer') || '/';
res.redirect(backUrl);
```

### 步骤 12：简化异步错误处理（可选但推荐）

```javascript
// 修改前 - Express 4 需要手动 try/catch
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// 修改后 - Express 5 自动捕获（推荐但旧写法仍然兼容）
app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});
```

### 步骤 13：运行测试并修复问题

```bash
npm test
```

---

## 4. 路由语法变更详解

### 4.1 命名参数

```javascript
// Express 4 和 5 都支持
app.get('/users/:id', handler);
app.get('/users/:userId/posts/:postId', handler);
```

### 4.2 正则约束参数

```javascript
// Express 4
app.get('/users/:id([0-9]+)', handler);
app.get('/files/:name([a-z]+\\.pdf)', handler);

// Express 5
app.get('/users/:id(\\d+)', handler);
app.get('/files/:name([a-z]+\\.pdf)', handler);
```

### 4.3 通配符

```javascript
// Express 4
app.get('/static/*', handler);

// Express 5
app.get('/static/{*path}', handler);
// req.params.path = 'css/style.css' (当访问 /static/css/style.css 时)
```

### 4.4 正则路由

```javascript
// Express 4 和 5 都支持正则路由
app.get(/^\/users\/(\d+)$/, handler);

// Express 5 中捕获组的行为可能有细微变化，需要测试
```

---

## 5. 移除的 API 及替代方案

### 5.1 `req.acceptsCharset()` -> `req.acceptsCharsets()`

```javascript
// 修改前
const charset = req.acceptsCharset('utf-8');

// 修改后
const charset = req.acceptsCharsets('utf-8');
```

### 5.2 `req.acceptsEncoding()` -> `req.acceptsEncodings()`

```javascript
// 修改前
const encoding = req.acceptsEncoding('gzip');

// 修改后
const encoding = req.acceptsEncodings('gzip');
```

### 5.3 `req.acceptsLanguage()` -> `req.acceptsLanguages()`

```javascript
// 修改前
const lang = req.acceptsLanguage('zh-CN');

// 修改后
const lang = req.acceptsLanguages('zh-CN');
```

### 5.4 `app.router` 属性

```javascript
// 修改前
console.log(app.router); // Express 内部路由

// 修改后
// 已移除，不需要引用 app.router
// 路由直接挂载在 app 上
```

---

## 6. 异步错误处理改进

### 6.1 Express 4 的限制

在 Express 4 中，如果异步路由处理函数抛出错误，Express 不会自动捕获：

```javascript
// Express 4 - 这会导致请求挂起（永远不会响应）
app.get('/users', async (req, res) => {
  const users = await User.findAll(); // 如果这里出错...
  res.json(users);
});

// Express 4 的正确写法
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err); // 必须手动传递错误
  }
});
```

### 6.2 Express 5 的改进

Express 5 自动捕获路由处理函数和中间件中的 Promise rejection：

```javascript
// Express 5 - 自动捕获异步错误
app.get('/users', async (req, res) => {
  const users = await User.findAll(); // 如果出错，Express 5 自动处理
  res.json(users);
});
```

**注意：** Express 5 的自动捕获只对返回 Promise 或使用 async/await 的函数有效。回调风格的异步代码仍然需要手动处理错误。

```javascript
// 仍然需要手动处理的回调风格
app.get('/users', (req, res, next) => {
  fs.readFile('/data/users.json', (err, data) => {
    if (err) {
      return next(err); // 回调错误仍需手动处理
    }
    res.json(JSON.parse(data));
  });
});
```

---

## 7. 常见问题与解决方案

### Q1: 迁移后路由匹配行为变了

**原因：** path-to-regexp 版本更新导致路由匹配规则变化。

**解决方案：** 仔细检查使用正则约束和通配符的路由，参考上面的路由语法变更部分。

### Q2: 第三方中间件不兼容

**原因：** 某些旧版中间件可能依赖 Express 4 的内部 API。

**解决方案：**
1. 检查中间件是否有新版本
2. 查看中间件的 GitHub issues
3. 考虑替代方案

### Q3: `res.redirect('back')` 不工作了

**原因：** Express 5 移除了回退到 `Referer` 的行为。

**解决方案：**
```javascript
// 手动实现 back 重定向
const backUrl = req.get('Referer') || '/default-page';
res.redirect(backUrl);
```

### Q4: 测试中 mock 的 `app.router` 报错

**原因：** `app.router` 已被移除。

**解决方案：** 移除对 `app.router` 的引用，直接测试路由端点。

### Q5: path-to-regexp 正则语法报错

**原因：** 新版 path-to-regexp 的正则语法有变化。

**解决方案：**
```javascript
// 如果正则约束不工作，尝试使用路由中间件替代
app.get('/users/:id', (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ message: 'ID 必须是数字' });
  }
  next();
}, handler);
```

### Q6: TypeScript 类型错误

**原因：** Express 5 的类型定义可能与 Express 4 不同。

**解决方案：**
```bash
# 更新到最新的类型定义
npm install -D @types/express@latest
```

---

## 迁移检查清单

完成以下检查清单，确保迁移完整：

- [ ] Node.js 版本 >= 18.0.0
- [ ] Express 版本更新到 5.x
- [ ] 所有 `app.del()` 替换为 `app.delete()`
- [ ] 所有 `req.param()` 替换为 `req.params`/`req.query`/`req.body`
- [ ] 所有 `req.host` 替换为 `req.hostname`
- [ ] 所有 `res.send(status)` 替换为 `res.sendStatus(status)`
- [ ] 所有 `res.sendfile()` 替换为 `res.sendFile()`
- [ ] 所有 `res.json(obj, status)` 替换为 `res.status(status).json(obj)`
- [ ] 所有 `res.redirect(url, status)` 替换为 `res.redirect(status, url)`
- [ ] 所有 `app.param(fn)` 回调迁移到中间件
- [ ] 通配符路由 `*` 更新为 `{*name}`
- [ ] `res.redirect('back')` 替换为显式重定向
- [ ] 测试全部通过
- [ ] 第三方中间件兼容性确认

---

## 参考资源

- [Express 5 官方文档](https://expressjs.com/)
- [Express 5 迁移指南（官方）](https://expressjs.com/en/guide/migrating-5.html)
- [path-to-regexp 文档](https://github.com/pillarjs/path-to-regexp)
- [Express 5 GitHub Releases](https://github.com/expressjs/express/releases)
