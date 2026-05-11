# React Router 7 框架模式教程

## 概述

框架模式（Framework Mode）是 React Router 7 的核心特性之一，它基于 Remix 框架的设计理念，提供了一套完整的全栈开发解决方案。

### 三种模式对比

| 特性 | 声明式模式 | 数据模式 | 框架模式 |
|------|-----------|---------|---------|
| 路由定义 | `<Route>` 组件 | `createBrowserRouter` | 文件系统路由 |
| 数据加载 | 组件内 useEffect | loader 函数 | loader + SSR |
| 适用场景 | 简单应用 | SPA 应用 | 全栈应用 |
| SSR 支持 | 否 | 否 | 是 |
| 类型安全 | 基础 | 良好 | 完整 |

---

## 一、文件路由系统

### 1.1 基本概念

框架模式使用文件系统作为路由配置：

```
app/
├── routes/
│   ├── _index.tsx          # / (首页)
│   ├── about.tsx           # /about
│   ├── users.tsx           # /users
│   ├── users.$id.tsx       # /users/:id (动态参数)
│   ├── users._index.tsx    # /users (索引路由)
│   ├── products.$category.tsx  # /products/:category
│   └── admin._layout.tsx   # /admin (布局路由)
└── root.tsx                # 根布局
```

### 1.2 文件命名约定

```typescript
// 文件命名规则

// 1. 静态路由
// about.tsx → /about
// contact.tsx → /contact

// 2. 动态参数 ($前缀)
// users.$id.tsx → /users/:id
// products.$category.$productId.tsx → /products/:category/:productId

// 3. 索引路由 (_index 后缀)
// users._index.tsx → /users (精确匹配)
// _index.tsx → / (首页)

// 4. 布局路由 (_ 前缀)
// admin._layout.tsx → /admin/* (包含子路由)
// admin._layout.users.tsx → /admin/users

// 5. 可选参数 ($前缀 + ?)
// lang.$lang?.tsx → / (可选语言前缀)

// 6. 通配符 ($ 前缀 + *)
// docs.$.tsx → /docs/* (匹配所有 docs 下的路径)
```

### 1.3 路由文件结构

```tsx
// app/routes/users.$id.tsx

import type { LoaderFunctionArgs, MetaFunction } from 'react-router';

// 元数据 - 用于 SEO
export const meta: MetaFunction = ({ data }) => {
  return [
    { title: `用户 ${data?.user.name} - 我的应用` },
    { name: 'description', content: '用户详情页面' },
  ];
};

// Loader - 服务端数据加载
export async function loader({ params }: LoaderFunctionArgs) {
  const user = await db.user.findUnique({
    where: { id: params.id },
  });
  
  if (!user) {
    throw new Response('用户不存在', { status: 404 });
  }
  
  return { user };
}

// Action - 处理表单提交
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  
  const user = await db.user.update({
    where: { id: params.id },
    data: updates,
  });
  
  return { user };
}

// 组件
export default function UserDetail() {
  const { user } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// 错误边界
export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div>
      <h1>出错了</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

---

## 二、SSR（服务端渲染）配置

### 2.1 基本配置

```typescript
// app/entry.server.tsx
// 服务端入口文件

import { renderToString } from 'react-dom/server';
import { createReadableStreamFromReadable } from '@react-router/node';
import type { AppLoadContext, EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  // 创建 React 流
  const shellRendered = false;
  
  const stream = renderToPipeableStream(
    <ServerRouter context={remixContext} url={request.url} />,
    {
      onShellReady() {
        // 流式响应
        responseHeaders.set('Content-Type', 'text/html');
        
        return new Response(
          createReadableStreamFromReadable(stream),
          {
            headers: responseHeaders,
            status: responseStatusCode,
          }
        );
      },
      onShellError(error: unknown) {
        console.error(error);
        return new Response('服务器错误', { status: 500 });
      },
    }
  );
}
```

### 2.2 客户端入口

```typescript
// app/entry.client.tsx
// 客户端入口文件

import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});
```

### 2.3 根布局

```tsx
// app/root.tsx
// 根布局文件

import type { LinksFunction, MetaFunction } from 'react-router';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

// 样式链接
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: '/styles/global.css' },
  { rel: 'icon', href: '/favicon.ico' },
];

// 元数据
export const meta: MetaFunction = () => [
  { title: '我的应用' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
];

// Loader - 全局数据
export async function loader() {
  return {
    ENV: {
      API_URL: process.env.API_URL,
    },
  };
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <html lang="zh-CN">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {/* 主内容出口 */}
        <Outlet />
        
        {/* 滚动恢复 */}
        <ScrollRestoration />
        
        {/* 客户端脚本 */}
        <Scripts />
        
        {/* 开发环境热更新 */}
        <LiveReload />
        
        {/* 环境变量注入 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
      </body>
    </html>
  );
}
```

### 2.4 服务端配置

```typescript
// server.ts
// 自定义服务器配置

import { createRequestHandler } from '@react-router/express';
import express from 'express';

const app = express();

// 静态资源
app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));
app.use(express.static('public', { maxAge: '1h' }));

// React Router 处理器
app.all(
  '*',
  createRequestHandler({
    build: await import('./build/server/index.js'),
    getLoadContext() {
      // 自定义上下文
      return {
        db: createDbConnection(),
        session: getSession(),
      };
    },
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
```

---

## 三、类型安全

### 3.1 自动类型推断

```tsx
// React Router 7 提供完整的类型推断

import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';

// Loader 类型推断
export async function loader({ params, request }: LoaderFunctionArgs) {
  // params 自动推断路由参数
  const { userId } = params; // string | undefined
  
  // request 类型为 Request
  const url = new URL(request.url);
  const search = url.searchParams.get('q');
  
  return {
    user: { id: 1, name: '张三' },
    posts: [{ id: 1, title: '文章' }],
  };
}

// 组件中自动推断 loader 返回类型
export default function UserPage() {
  // 类型自动推断为 { user: { id: number; name: string }; posts: { id: number; title: string }[] }
  const { user, posts } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>{user.name}</h1>
      {posts.map((post) => (
        <p key={post.id}>{post.title}</p>
      ))}
    </div>
  );
}
```

### 3.2 类型工具

```typescript
// 类型工具函数

import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  SerializeFrom,
  MetaFunction,
} from 'react-router';

// SerializeFrom - 将 loader 返回值序列化为客户端类型
type LoaderData = SerializeFrom<typeof loader>;

// MetaFunction 类型
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.user.name} - 个人主页` },
  ];
};

// 自定义类型守卫
function isError(response: unknown): response is { error: string } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response
  );
}
```

### 3.3 路由模块类型

```typescript
// 路由模块类型定义

import type {
  // 数据加载
  LoaderFunction,
  LoaderFunctionArgs,
  ClientLoaderFunction,
  ClientLoaderFunctionArgs,
  
  // 数据操作
  ActionFunction,
  ActionFunctionArgs,
  ClientActionFunction,
  ClientActionFunctionArgs,
  
  // 组件
  RouteHandle,
  
  // 元数据
  MetaFunction,
  LinksFunction,
  
  // 错误处理
  ShouldRevalidateFunction,
  HandleErrorFunction,
} from 'react-router';

// 完整的路由模块类型
interface RouteModule {
  // 数据加载
  loader?: LoaderFunction;
  clientLoader?: ClientLoaderFunction;
  
  // 数据操作
  action?: ActionFunction;
  clientAction?: ClientActionFunction;
  
  // 组件
  default: () => JSX.Element;
  ErrorBoundary?: () => JSX.Element;
  HydrateFallback?: () => JSX.Element;
  
  // 元数据
  meta?: MetaFunction;
  links?: LinksFunction;
  
  // 其他
  handle?: RouteHandle;
  shouldRevalidate?: ShouldRevalidateFunction;
}
```

---

## 四、高级特性

### 4.1 客户端 Loader

```tsx
// clientLoader - 在客户端执行的 loader

import type { ClientLoaderFunctionArgs } from 'react-router';

// 服务端 loader
export async function loader({ params }: LoaderFunctionArgs) {
  return { user: await fetchUser(params.id) };
}

// 客户端 loader - 用于客户端导航时的数据加载
export async function clientLoader({ params, serverLoader }: ClientLoaderFunctionArgs) {
  // 检查缓存
  const cached = localStorage.getItem(`user-${params.id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 调用服务端 loader
  const data = await serverLoader<typeof loader>();
  
  // 缓存数据
  localStorage.setItem(`user-${params.id}`, JSON.stringify(data));
  
  return data;
}

// 启用客户端 loader
export const clientLoaderHydrate = true;
```

### 4.2 预加载资源

```tsx
// 预加载链接资源

import { Link, NavLink, PrefetchPageLinks } from 'react-router';

function Navigation() {
  return (
    <nav>
      {/* Link 自动预加载 */}
      <Link 
        to="/about" 
        prefetch="intent"  // hover 时预加载
      >
        关于我们
      </Link>
      
      {/* 手动预加载 */}
      <PrefetchPageLinks page="/dashboard" />
      
      {/* NavLink - 带激活状态 */}
      <NavLink
        to="/products"
        className={({ isActive }) => isActive ? 'active' : ''}
        prefetch="render"  // 渲染时预加载
      >
        产品
      </NavLink>
    </nav>
  );
}
```

### 4.3 乐观 UI

```tsx
// 乐观更新示例

import { useFetcher } from 'react-router';

function LikeButton({ postId }: { postId: string }) {
  const fetcher = useFetcher();
  
  // 乐观值：如果正在提交，使用表单数据
  const isLiked = fetcher.formData
    ? fetcher.formData.get('liked') === 'true'
    : false;
  
  return (
    <fetcher.Form method="post" action="/api/like">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="liked" value={String(!isLiked)} />
      <button type="submit">
        {isLiked ? '❤️' : '🤍'}
      </button>
    </fetcher.Form>
  );
}
```

### 4.4 路由 Handle

```tsx
// 使用 handle 自定义路由元数据

// routes/admin._layout.tsx
export const handle = {
  breadcrumb: '管理后台',
  requireAuth: true,
  permissions: ['admin'],
};

// 在父组件中访问
function Breadcrumbs() {
  const matches = useMatches();
  
  return (
    <nav>
      {matches.map((match, index) => (
        <span key={index}>
          {match.handle?.breadcrumb}
          {index < matches.length - 1 && ' > '}
        </span>
      ))}
    </nav>
  );
}
```

---

## 五、部署配置

### 5.1 适配器

```typescript
// 适配不同部署平台

// Vercel
// npm install @react-router/vercel

// Cloudflare Pages
// npm install @react-router/cloudflare-pages

// Node.js
// npm install @react-router/node @react-router/serve

// Netlify
// npm install @react-router/netlify
```

### 5.2 构建配置

```typescript
// react-router.config.ts

import type { Config } from '@react-router/dev/config';

export default {
  // 服务端渲染配置
  ssr: true,  // true = SSR, false = SPA
  
  // 预渲染静态页面
  async prerender() {
    return ['/about', '/contact'];
  },
  
  // 构建输出目录
  buildDirectory: 'build',
  
  // 服务端打包入口
  serverBuildFile: 'index.js',
  
  // 客户端入口
  appDirectory: 'app',
} satisfies Config;
```

### 5.3 环境变量

```typescript
// .env
DATABASE_URL="postgresql://..."
API_KEY="secret-key"

// 服务端访问
export async function loader() {
  const dbUrl = process.env.DATABASE_URL;
  // ...
}

// 客户端安全访问（需要 SERVER_ 前缀）
// .env
SERVER_PUBLIC_API_URL="https://api.example.com"

// root.tsx
export async function loader() {
  return {
    ENV: {
      API_URL: process.env.SERVER_PUBLIC_API_URL,
    },
  };
}
```

---

## 六、最佳实践

### 6.1 项目结构

```
my-app/
├── app/
│   ├── routes/           # 路由文件
│   │   ├── _index.tsx
│   │   ├── users.tsx
│   │   └── users.$id.tsx
│   ├── components/       # 共享组件
│   ├── utils/            # 工具函数
│   ├── models/           # 数据模型
│   ├── root.tsx          # 根布局
│   └── entry.client.tsx  # 客户端入口
├── public/               # 静态资源
├── server.ts             # 服务端入口
├── react-router.config.ts
├── tsconfig.json
└── package.json
```

### 6.2 性能优化

```tsx
// 1. 使用 defer 延迟非关键数据
export async function loader() {
  return defer({
    user: await getUser(),           // 关键数据，等待
    posts: getPosts(),               // 次要数据，延迟
  });
}

// 2. 使用缓存策略
export async function loader({ params, context }: LoaderFunctionArgs) {
  const cacheKey = `user-${params.id}`;
  const cached = await context.cache.get(cacheKey);
  if (cached) return cached;
  
  const data = await fetchUser(params.id);
  await context.cache.set(cacheKey, data, { ttl: 60 });
  return data;
}

// 3. 预加载关键资源
export const links: LinksFunction = () => [
  { rel: 'preload', href: '/fonts/main.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
];
```

### 6.3 错误处理

```tsx
// 全局错误边界
export function ErrorBoundary() {
  const error = useRouteError();
  
  // 开发环境显示详细信息
  if (process.env.NODE_ENV === 'development') {
    return (
      <div>
        <h1>开发错误</h1>
        <pre>{error.stack}</pre>
      </div>
    );
  }
  
  // 生产环境友好提示
  return (
    <div>
      <h1>出错了</h1>
      <p>请稍后重试或联系支持。</p>
    </div>
  );
}

// 自定义错误处理
export function handleError(error: unknown, { request }: HandleErrorFunctionArgs) {
  // 发送错误到监控系统
  Sentry.captureException(error);
  
  // 记录错误日志
  console.error('Route error:', error, 'URL:', request.url);
}
```

---

## 七、总结

### 框架模式优势

1. **开发效率**：文件路由自动生成，无需手动配置
2. **类型安全**：完整的 TypeScript 支持
3. **性能优化**：内置 SSR、流式渲染、预加载
4. **SEO 友好**：服务端渲染支持
5. **渐进增强**：支持无 JavaScript 降级

### 学习路径

```
声明式模式 → 数据模式 → 框架模式
    ↓            ↓           ↓
  简单应用     SPA 应用    全栈应用
```

### 相关资源

- [React Router 官方文档](https://reactrouter.com/)
- [Remix 框架](https://remix.run/)
- [React Router GitHub](https://github.com/remix-run/react-router)
