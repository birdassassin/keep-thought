# Remix 基础入门

本文档将带你了解 Remix 的核心概念，从项目创建到基础使用。

---

## 一、Remix 简介

### 1.1 什么是 Remix？

Remix 是一个全栈 Web 框架，专注于构建快速、现代的 Web 应用。

```tsx
// Remix 的核心理念：
// 1. Web 标准 - 使用标准的 HTML 表单和 HTTP 方法
// 2. 渐进增强 - 即使没有 JavaScript 也能工作
// 3. 服务端渲染 - 默认在服务端渲染页面
// 4. 嵌套路由 - 每个路由独立加载数据
```

### 1.2 为什么选择 Remix？

```tsx
// 传统 SPA 的问题：
// - 首屏加载慢（需要加载大量 JS）
// - SEO 不友好
// - 数据获取复杂

// Remix 的解决方案：
// ✅ 服务端渲染，首屏快速
// ✅ SEO 友好
// ✅ 内置数据加载和变更机制
// ✅ 自动代码分割
// ✅ 优秀的用户体验
```

### 1.3 Remix vs Next.js

```tsx
// Remix 的独特优势：

// 1. 渐进增强
// Remix 使用 HTML 表单，即使 JS 失败也能提交
<form method="post">
  <input name="email" type="email" />
  <button type="submit">提交</button>
</form>

// 2. 嵌套路由数据加载
// 每个路由组件可以有自己的 loader，并行加载

// 3. 更简单的数据变更
// 使用 action 处理 POST/PUT/DELETE 请求
// 无需手动管理 loading 状态

// 4. 更小的客户端包
// 默认不发送客户端路由数据
```

---

## 二、项目创建

### 2.1 使用脚手架创建项目

```bash
# 使用 npm 创建项目
npx create-remix@latest my-remix-app

# 使用 yarn 创建项目
yarn create remix my-remix-app

# 使用 pnpm 创建项目
pnpm create remix my-remix-app
```

### 2.2 创建过程中的选项

```bash
# 创建过程中会询问：

? Where would you like to create your app? 
  → ./my-remix-app

? What type of app do you want to create? 
  → Just the basics (基础模板)
  → A pre-configured stack ready for production (生产就绪模板)

? Where do you want to deploy? 
  → Remix App Server (默认服务器)
  → Express Server (自定义服务器)
  → Architect (AWS Lambda)
  → Fly.io
  → Netlify
  → Vercel
  → Cloudflare Workers

? TypeScript or JavaScript? 
  → TypeScript (推荐)
  → JavaScript

? Do you want me to run `npm install`? 
  → Yes
```

### 2.3 项目启动

```bash
# 进入项目目录
cd my-remix-app

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## 三、目录结构

### 3.1 标准目录结构

```
my-remix-app/
├── app/                    # 应用主目录
│   ├── components/         # 可复用组件
│   ├── routes/             # 路由文件（重要！）
│   │   ├── _index.tsx      # 首页路由
│   │   ├── about.tsx       # /about 路由
│   │   └── posts/          # 嵌套路由目录
│   │       ├── _index.tsx  # /posts 路由
│   │       └── $id.tsx     # /posts/:id 动态路由
│   ├── entry.client.tsx    # 客户端入口
│   ├── entry.server.tsx    # 服务端入口
│   └── root.tsx            # 根组件
│
├── public/                 # 静态资源
│   └── favicon.ico
│
├── remix.config.js         # Remix 配置文件
├── package.json
└── tsconfig.json
```

### 3.2 关键文件详解

```tsx
// app/root.tsx - 根组件
// 这是整个应用的根布局，所有页面都会渲染在这里

import {
  Links,           // 渲染 <link> 标签
  LiveReload,      // 开发环境热重载
  Meta,            // 渲染 <meta> 标签
  Outlet,          // 渲染子路由内容
  Scripts,         // 渲染 <script> 标签
  ScrollRestoration, // 滚动位置恢复
} from "@remix-run/react";

// 导入全局样式
import styles from "./styles/global.css";

// 导出样式链接
export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

// 根组件
export default function App() {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Outlet 是子路由渲染的位置 */}
        <Outlet />
        
        {/* 开发环境热重载 */}
        <LiveReload />
        
        {/* 脚本和滚动恢复 */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

```tsx
// app/routes/_index.tsx - 首页路由
// 文件名以 _ 开头表示这是一个索引路由（不带路径名）

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// loader 在服务端运行，用于加载数据
export const loader = async () => {
  // 可以访问数据库、API 等
  const message = "欢迎来到 Remix！";
  
  // 返回 JSON 响应
  return json({ message });
};

// 页面组件
export default function Index() {
  // 获取 loader 返回的数据
  const { message } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>首页</h1>
      <p>{message}</p>
    </div>
  );
}
```

---

## 四、路由基础

### 4.1 文件系统路由

```tsx
// Remix 使用文件系统路由，文件路径决定 URL 路径

// 路由文件与 URL 的对应关系：
// app/routes/_index.tsx      → /
// app/routes/about.tsx       → /about
// app/routes/contact.tsx     → /contact
// app/routes/blog/index.tsx  → /blog
// app/routes/blog/post.tsx   → /blog/post
```

### 4.2 基本路由示例

```tsx
// app/routes/about.tsx - 关于页面

import { MetaFunction } from "@remix-run/react";

// 设置页面元信息
export const meta: MetaFunction = () => {
  return [
    { title: "关于我们 - 我的网站" },
    { name: "description", content: "了解更多关于我们的信息" },
  ];
};

// 页面组件
export default function About() {
  return (
    <div className="about-page">
      <h1>关于我们</h1>
      <p>这是一个使用 Remix 构建的网站。</p>
      
      {/* 使用 Link 组件进行客户端导航 */}
      <Link to="/">返回首页</Link>
    </div>
  );
}
```

### 4.3 Link 组件

```tsx
// 使用 Link 进行客户端导航（不刷新页面）

import { Link } from "@remix-run/react";

export default function Navigation() {
  return (
    <nav>
      {/* 基本用法 */}
      <Link to="/">首页</Link>
      
      {/* 带参数 */}
      <Link to="/posts/123">文章详情</Link>
      
      {/* 相对路径 */}
      <Link to="../about">关于</Link>
      
      {/* 带样式 */}
      <Link 
        to="/contact"
        className="nav-link"
        style={{ color: 'blue' }}
      >
        联系我们
      </Link>
      
      {/* 预加载行为 */}
      <Link 
        to="/dashboard"
        prefetch="intent"  // 鼠标悬停时预加载
      >
        控制台
      </Link>
      
      {/* 替换历史记录 */}
      <Link 
        to="/login"
        replace  // 不在历史记录中添加新条目
      >
        登录
      </Link>
    </nav>
  );
}
```

### 4.4 路由配置（可选）

```tsx
// remix.config.js - 自定义路由配置

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // 忽略的文件
  ignoredRouteFiles: ["**/*.css"],

  // 自定义路由（高级用法）
  routes: async (defineRoutes) => {
    return defineRoutes((route) => {
      // 手动定义路由
      route("/custom-page", "custom-route.tsx");
      
      // 带布局的路由
      route("/admin", "admin/layout.tsx", () => {
        route("/dashboard", "admin/dashboard.tsx");
        route("/users", "admin/users.tsx");
      });
    });
  },
};
```

---

## 五、Loader 和 Action

### 5.1 Loader - 数据加载

```tsx
// loader 在服务端运行，用于加载页面数据
// 只支持 GET 请求

import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// 定义 loader 函数
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // params - URL 参数（动态路由）
  const postId = params.id;
  
  // request - Request 对象
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("q");
  
  // 获取数据（可以访问数据库）
  const post = await db.post.findUnique({
    where: { id: postId },
  });
  
  // 如果数据不存在，抛出 404
  if (!post) {
    throw new Response("文章不存在", { status: 404 });
  }
  
  // 返回 JSON 响应
  return json({ post, searchQuery });
};

// 页面组件
export default function PostDetail() {
  // 获取 loader 返回的数据
  const { post, searchQuery } = useLoaderData<typeof loader>();
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### 5.2 Action - 数据变更

```tsx
// action 处理 POST、PUT、DELETE 等请求
// 用于表单提交、数据修改

import { json, redirect, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

// 定义 action 函数
export const action = async ({ request }: ActionFunctionArgs) => {
  // 获取表单数据
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  
  // 验证数据
  const errors = {
    email: email ? null : "邮箱不能为空",
    password: password && password.length >= 6 
      ? null 
      : "密码至少6个字符",
  };
  
  // 如果有错误，返回错误信息
  if (Object.values(errors).some(Boolean)) {
    return json({ errors }, { status: 400 });
  }
  
  // 执行登录逻辑
  const user = await login(email, password);
  
  // 如果登录成功，重定向到首页
  if (user) {
    return redirect("/dashboard");
  }
  
  // 登录失败
  return json({ 
    errors: { form: "邮箱或密码错误" } 
  });
};

// 页面组件
export default function LoginPage() {
  // 获取 action 返回的数据
  const actionData = useActionData<typeof action>();
  
  return (
    <div className="login-form">
      <h1>登录</h1>
      
      {/* 使用 Form 组件 */}
      <Form method="post">
        {/* 邮箱字段 */}
        <div>
          <label htmlFor="email">邮箱</label>
          <input 
            id="email"
            name="email" 
            type="email" 
            required 
          />
          {/* 显示错误信息 */}
          {actionData?.errors?.email && (
            <p className="error">{actionData.errors.email}</p>
          )}
        </div>
        
        {/* 密码字段 */}
        <div>
          <label htmlFor="password">密码</label>
          <input 
            id="password"
            name="password" 
            type="password" 
            required 
          />
          {actionData?.errors?.password && (
            <p className="error">{actionData.errors.password}</p>
          )}
        </div>
        
        {/* 表单级错误 */}
        {actionData?.errors?.form && (
          <p className="error">{actionData.errors.form}</p>
        )}
        
        <button type="submit">登录</button>
      </Form>
    </div>
  );
}
```

### 5.3 Loader vs Action 对比

```tsx
// Loader 和 Action 的区别：

// ┌─────────────────────────────────────────────────────────┐
// │                    Loader                               │
// ├─────────────────────────────────────────────────────────┤
// │ • 只处理 GET 请求                                       │
// │ • 在服务端运行                                          │
// │ • 用于加载数据                                          │
// │ • 页面加载时自动调用                                     │
// │ • 返回数据给 useLoaderData                              │
// └─────────────────────────────────────────────────────────┘

// ┌─────────────────────────────────────────────────────────┐
// │                    Action                               │
// ├─────────────────────────────────────────────────────────┤
// │ • 处理 POST、PUT、DELETE、PATCH 请求                    │
// │ • 在服务端运行                                          │
// │ • 用于修改数据                                          │
// │ • 表单提交时调用                                        │
// │ • 返回数据给 useActionData                              │
// │ • 可以重定向                                            │
// └─────────────────────────────────────────────────────────┘

// 示例：一个完整的 CRUD 页面

// app/routes/todos.$id.tsx

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";

// 类型定义
type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

// Loader: 加载待办事项
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const todo = await db.todo.findUnique({
    where: { id: params.id },
  });
  
  if (!todo) {
    throw new Response("未找到", { status: 404 });
  }
  
  return json({ todo });
};

// Action: 更新或删除待办事项
export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent"); // 获取操作意图
  
  switch (intent) {
    case "update": {
      const title = formData.get("title");
      const completed = formData.get("completed") === "true";
      
      await db.todo.update({
        where: { id: params.id },
        data: { title, completed },
      });
      
      return redirect("/todos");
    }
    
    case "delete": {
      await db.todo.delete({
        where: { id: params.id },
      });
      
      return redirect("/todos");
    }
    
    default:
      return json({ error: "未知操作" }, { status: 400 });
  }
};

// 页面组件
export default function TodoDetail() {
  const { todo } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>{todo.title}</h1>
      
      {/* 更新表单 */}
      <Form method="post">
        <input type="hidden" name="intent" value="update" />
        <input name="title" defaultValue={todo.title} />
        <input 
          name="completed" 
          type="checkbox" 
          defaultChecked={todo.completed} 
        />
        <button type="submit">保存</button>
      </Form>
      
      {/* 删除表单 */}
      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <button type="submit">删除</button>
      </Form>
    </div>
  );
}
```

### 5.4 请求处理流程

```tsx
// Remix 的请求处理流程：

// 1. 用户访问页面
//    GET /posts/123
//         ↓
// 2. 服务端匹配路由
//    app/routes/posts.$id.tsx
//         ↓
// 3. 调用 loader 获取数据
//    export const loader = async ({ params }) => {
//      const post = await getPost(params.id);
//      return json({ post });
//    }
//         ↓
// 4. 渲染组件（服务端）
//    export default function Post() {
//      const { post } = useLoaderData();
//      return <article>...</article>;
//    }
//         ↓
// 5. 发送 HTML 到浏览器
//         ↓
// 6. 客户端 hydration
//    React 接管页面

// 表单提交流程：

// 1. 用户提交表单
//    <Form method="post">
//         ↓
// 2. 调用 action 处理数据
//    export const action = async ({ request }) => {
//      const formData = await request.formData();
//      // 处理数据...
//      return redirect("/success");
//    }
//         ↓
// 3. 重定向或返回数据
//         ↓
// 4. 更新 UI
```

---

## 六、小结

通过本节学习，你应该掌握了：

1. **Remix 简介**: 了解 Remix 是什么，为什么选择它
2. **项目创建**: 使用脚手架创建 Remix 项目
3. **目录结构**: 理解 Remix 项目的文件结构
4. **路由基础**: 使用文件系统路由和 Link 组件
5. **Loader/Action**: 数据加载和变更的核心概念

下一节我们将深入学习 Remix 的路由系统。
