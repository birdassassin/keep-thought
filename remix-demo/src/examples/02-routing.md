# Remix 路由系统详解

本文档详细介绍 Remix 的路由系统，包括嵌套路由、动态路由、布局嵌套等内容。

---

## 一、嵌套路由

### 1.1 什么是嵌套路由？

```tsx
// 嵌套路由允许你将页面分成多个独立的区域
// 每个区域可以有自己的数据加载和状态

// 例如，一个典型的博客布局：
// ┌─────────────────────────────────────┐
// │           Header (根路由)            │
// ├─────────────────────────────────────┤
// │   Sidebar   │      Content          │
// │  (父路由)   │     (子路由)          │
// │             │                       │
// │             │                       │
// ├─────────────────────────────────────┤
// │           Footer (根路由)            │
// └─────────────────────────────────────┘

// Remix 的嵌套路由优势：
// 1. 每个路由独立加载数据（并行加载）
// 2. 导航时只更新变化的部分
// 3. 更好的代码组织和复用
```

### 1.2 创建嵌套路由

```tsx
// 文件结构：
// app/routes/
// ├── _index.tsx          # / 首页
// ├── posts._index.tsx    # /posts 文章列表
// ├── posts.$id.tsx       # /posts/:id 文章详情
// └── posts.new.tsx       # /posts/new 新建文章

// 使用 Outlet 渲染子路由

// app/routes/posts.tsx - 父路由布局
import { Outlet } from "@remix-run/react";

export default function PostsLayout() {
  return (
    <div className="posts-layout">
      <aside className="sidebar">
        <h2>文章导航</h2>
        <nav>
          <Link to="/posts">所有文章</Link>
          <Link to="/posts/new">新建文章</Link>
        </nav>
      </aside>
      
      <main className="content">
        {/* Outlet 是子路由渲染的位置 */}
        <Outlet />
      </main>
    </div>
  );
}

// app/routes/posts._index.tsx - 子路由
export default function PostsIndex() {
  return (
    <div>
      <h1>文章列表</h1>
      {/* 文章列表内容 */}
    </div>
  );
}
```

### 1.3 嵌套路由数据加载

```tsx
// 每个路由可以有自己的 loader
// Remix 会并行加载所有路由的数据

// app/routes/posts.tsx - 父路由 loader
export const loader = async () => {
  // 加载侧边栏需要的分类数据
  const categories = await db.category.findMany();
  return json({ categories });
};

export default function PostsLayout() {
  const { categories } = useLoaderData<typeof loader>();
  
  return (
    <div className="layout">
      <aside>
        {categories.map(cat => (
          <Link key={cat.id} to={`/posts?category=${cat.id}`}>
            {cat.name}
          </Link>
        ))}
      </aside>
      <Outlet />
    </div>
  );
}

// app/routes/posts._index.tsx - 子路由 loader
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("category");
  
  // 加载文章列表
  const posts = await db.post.findMany({
    where: categoryId ? { categoryId } : undefined,
  });
  
  return json({ posts });
};

export default function PostsIndex() {
  const { posts } = useLoaderData<typeof loader>();
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

---

## 二、动态路由

### 2.1 基本动态路由

```tsx
// 使用 $ 前缀创建动态路由参数

// app/routes/posts.$id.tsx
// URL: /posts/123 → params.id = "123"
// URL: /posts/hello-world → params.id = "hello-world"

import { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // params 包含所有动态参数
  // { id: "123" }
  
  const post = await db.post.findUnique({
    where: { id: params.id },
  });
  
  if (!post) {
    throw new Response("文章不存在", { status: 404 });
  }
  
  return json({ post });
};

export default function PostDetail() {
  const { post } = useLoaderData<typeof loader>();
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### 2.2 多个动态参数

```tsx
// app/routes/users.$userId.posts.$postId.tsx
// URL: /users/123/posts/456
// params: { userId: "123", postId: "456" }

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { userId, postId } = params;
  
  // 同时获取用户和文章信息
  const [user, post] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.post.findFirst({ 
      where: { 
        id: postId, 
        authorId: userId 
      } 
    }),
  ]);
  
  return json({ user, post });
};

export default function UserPost() {
  const { user, post } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>{post.title}</h1>
      <p>作者: {user.name}</p>
    </div>
  );
}
```

### 2.3 可选动态路由

```tsx
// 使用 ($) 创建可选的路由段

// app/routes/users.$id?.tsx
// 匹配: /users 和 /users/123

export const loader = async ({ params }: LoaderFunctionArgs) => {
  if (params.id) {
    // 有 ID，加载特定用户
    const user = await db.user.findUnique({
      where: { id: params.id },
    });
    return json({ user, mode: "detail" });
  } else {
    // 没有 ID，加载用户列表
    const users = await db.user.findMany();
    return json({ users, mode: "list" });
  }
};

export default function UsersPage() {
  const data = useLoaderData<typeof loader>();
  
  if (data.mode === "detail") {
    return <UserDetail user={data.user} />;
  } else {
    return <UserList users={data.users} />;
  }
}
```

### 2.4 通配符路由

```tsx
// 使用 $.tsx 匹配所有剩余路径（Splat Routes）

// app/routes/docs.$.tsx
// 匹配: /docs/a, /docs/a/b, /docs/a/b/c/d

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // params["*"] 包含通配符匹配的部分
  // /docs/a/b → params["*"] = "a/b"
  
  const path = params["*"] || "index";
  
  const doc = await getDocByPath(path);
  
  return json({ doc, path });
};

export default function DocsPage() {
  const { doc, path } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <p>当前路径: {path}</p>
      <div dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
}
```

---

## 三、路由文件命名规则

### 3.1 文件命名约定

```tsx
// Remix 路由文件命名规则：

// 1. 基本路由
// about.tsx → /about
// contact.tsx → /contact

// 2. 索引路由（以 _ 开头）
// _index.tsx → /
// posts._index.tsx → /posts

// 3. 动态路由（以 $ 开头）
// $id.tsx → /:id
// posts.$id.tsx → /posts/:id

// 4. 嵌套布局（无前缀）
// posts.tsx + posts._index.tsx → 布局 + 子路由

// 5. 可选路由（用括号包裹）
// ($lang)._index.tsx → / 或 /en 或 /zh

// 6. 通配符路由
// docs.$.tsx → /docs/* 匹配所有子路径

// 7. 路由组（用括号包裹，不影响 URL）
// (marketing)/about.tsx → /about
// (marketing)/contact.tsx → /contact
```

### 3.2 路由组

```tsx
// 使用括号创建路由组，不影响 URL 结构
// 用于组织代码和共享布局

// 文件结构：
// app/routes/
// ├── (marketing)/
// │   ├── _layout.tsx      # 共享布局（不生成 URL）
// │   ├── about.tsx        # /about
// │   └── contact.tsx      # /contact
// └── (shop)/
//     ├── _layout.tsx      # 共享布局
//     ├── products.tsx     # /products
//     └── cart.tsx         # /cart

// (marketing)/_layout.tsx
export default function MarketingLayout() {
  return (
    <div className="marketing">
      <header>
        <nav>
          <Link to="/about">关于</Link>
          <Link to="/contact">联系</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

// (shop)/_layout.tsx
export default function ShopLayout() {
  return (
    <div className="shop">
      <header>
        <nav>
          <Link to="/products">商品</Link>
          <Link to="/cart">购物车</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
```

### 3.3 路由优先级

```tsx
// 当多个路由匹配同一 URL 时，优先级规则：

// 1. 静态路由优先于动态路由
// about.tsx 匹配 /about
// $slug.tsx 匹配 /about
// → about.tsx 优先

// 2. 更具体的路由优先
// posts.$id.tsx 匹配 /posts/123
// posts.$.tsx 匹配 /posts/123
// → posts.$id.tsx 优先

// 3. 索引路由优先于动态路由
// _index.tsx 匹配 /
// $slug.tsx 匹配 /
// → _index.tsx 优先

// 示例文件结构：
// app/routes/
// ├── _index.tsx        # / → 索引路由
// ├── about.tsx         # /about → 静态路由
// ├── posts._index.tsx  # /posts → 索引路由
// ├── posts.$id.tsx     # /posts/:id → 动态路由
// ├── posts.new.tsx     # /posts/new → 静态路由（优先于动态）
// └── $.tsx             # /* → 通配符（最低优先级）
```

---

## 四、布局嵌套

### 4.1 根布局

```tsx
// app/root.tsx - 应用的根布局
// 所有页面都会使用这个布局

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import styles from "./styles/tailwind.css";

// 导出样式链接
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

// 导出 meta 函数
export const meta: MetaFunction = () => [
  { title: "我的 Remix 应用" },
  { name: "description", content: "一个优秀的网站" },
];

// 根组件
export default function App() {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* 全局导航 */}
        <header>
          <nav>
            <Link to="/">首页</Link>
            <Link to="/posts">文章</Link>
            <Link to="/about">关于</Link>
          </nav>
        </header>
        
        {/* 主内容区域 - 子路由渲染位置 */}
        <main>
          <Outlet />
        </main>
        
        {/* 全局页脚 */}
        <footer>
          <p>&copy; 2024 我的网站</p>
        </footer>
        
        {/* Remix 内置组件 */}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

### 4.2 多层嵌套布局

```tsx
// 创建多层嵌套布局

// 文件结构：
// app/routes/
// ├── admin._layout.tsx      # 管理后台布局
// ├── admin._index.tsx       # /admin
// ├── admin.users._layout.tsx # 用户管理布局
// ├── admin.users._index.tsx  # /admin/users
// └── admin.users.$id.tsx     # /admin/users/:id

// admin._layout.tsx - 第一层布局
export default function AdminLayout() {
  return (
    <div className="admin">
      <aside className="sidebar">
        <nav>
          <Link to="/admin">仪表盘</Link>
          <Link to="/admin/users">用户管理</Link>
          <Link to="/admin/settings">设置</Link>
        </nav>
      </aside>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

// admin.users._layout.tsx - 第二层布局
export default function UsersLayout() {
  return (
    <div className="users-layout">
      <div className="users-list">
        {/* 用户列表 */}
        <UsersList />
      </div>
      <div className="user-detail">
        <Outlet />
      </div>
    </div>
  );
}

// admin.users.$id.tsx - 最内层页面
export const loader = async ({ params }) => {
  const user = await db.user.findUnique({
    where: { id: params.id },
  });
  return json({ user });
};

export default function UserDetail() {
  const { user } = useLoaderData<typeof loader>();
  
  return (
    <div className="user-detail">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### 4.3 使用 useMatches 访问父路由数据

```tsx
// useMatches 可以访问所有匹配的路由信息

import { useMatches } from "@remix-run/react";

export default function Breadcrumb() {
  const matches = useMatches();
  
  // matches 包含所有匹配的路由
  // [
  //   { id: "root", pathname: "/", data: {...}, handle: {...} },
  //   { id: "routes/admin", pathname: "/admin", data: {...} },
  //   { id: "routes/admin.users", pathname: "/admin/users", data: {...} },
  // ]
  
  return (
    <nav className="breadcrumb">
      {matches.map((match, index) => (
        <span key={match.id}>
          {index > 0 && " > "}
          <Link to={match.pathname}>
            {match.handle?.title || match.pathname}
          </Link>
        </span>
      ))}
    </nav>
  );
}

// 在路由中定义 handle
// app/routes/admin.users.$id.tsx
export const handle = {
  title: "用户详情",
  breadcrumb: (data) => data.user.name,
};
```

---

## 五、链接导航

### 5.1 Link 组件详解

```tsx
import { Link, NavLink } from "@remix-run/react";

export default function Navigation() {
  return (
    <nav>
      {/* 基本链接 */}
      <Link to="/">首页</Link>
      
      {/* 带查询参数 */}
      <Link to="/search?q=remix">搜索 Remix</Link>
      
      {/* 相对路径 */}
      <Link to="../">上一级</Link>
      <Link to="./edit">编辑</Link>
      
      {/* 预加载策略 */}
      <Link 
        to="/dashboard"
        prefetch="intent"  // hover 或 focus 时预加载
      >
        控制台
      </Link>
      
      {/* 预加载选项：
        - "none": 不预加载（默认）
        - "intent": 鼠标悬停或聚焦时预加载
        - "render": 组件渲染时预加载
        - "viewport": 进入视口时预加载
      */}
      
      {/* 阻止滚动恢复 */}
      <Link 
        to="/list"
        preventScrollReset
      >
        列表（保持滚动位置）
      </Link>
      
      {/* 替换历史记录 */}
      <Link 
        to="/login"
        replace
      >
        登录
      </Link>
    </nav>
  );
}
```

### 5.2 NavLink 组件

```tsx
// NavLink 可以为活动链接添加样式

import { NavLink } from "@remix-run/react";

export default function Navigation() {
  return (
    <nav>
      {/* 使用 className 函数 */}
      <NavLink
        to="/about"
        className={({ isActive, isPending }) => {
          let classes = "nav-link";
          if (isActive) classes += " active";
          if (isPending) classes += " pending";
          return classes;
        }}
      >
        关于
      </NavLink>
      
      {/* 使用 style 函数 */}
      <NavLink
        to="/contact"
        style={({ isActive }) => ({
          color: isActive ? "red" : "black",
          fontWeight: isActive ? "bold" : "normal",
        })}
      >
        联系
      </NavLink>
      
      {/* 使用 children 渲染函数 */}
      <NavLink to="/posts">
        {({ isActive, isPending }) => (
          <span className={isActive ? "active" : ""}>
            {isPending ? "加载中..." : "文章"}
          </span>
        )}
      </NavLink>
      
      {/* 嵌套路由匹配 */}
      <NavLink
        to="/admin"
        end  // 只有精确匹配时才激活
      >
        管理后台
      </NavLink>
    </nav>
  );
}
```

### 5.3 编程式导航

```tsx
import { useNavigate, useSubmit, Form } from "@remix-run/react";

export default function NavigationDemo() {
  const navigate = useNavigate();
  
  const handleButtonClick = () => {
    // 导航到指定路径
    navigate("/dashboard");
    
    // 返回上一页
    navigate(-1);
    
    // 前进
    navigate(1);
    
    // 替换当前历史记录
    navigate("/login", { replace: true });
  };
  
  return (
    <div>
      <button onClick={handleButtonClick}>
        导航
      </button>
      
      {/* 使用 Form 进行导航 */}
      <Form action="/search" method="get">
        <input name="q" type="text" placeholder="搜索..." />
        <button type="submit">搜索</button>
      </Form>
    </div>
  );
}
```

### 5.4 预加载优化

```tsx
// Remix 提供了多种预加载策略

import { Link, NavLink, PrefetchPageLinks } from "@remix-run/react";

export default function PreloadDemo() {
  return (
    <div>
      {/* 1. intent 预加载（推荐） */}
      {/* 鼠标悬停或聚焦时预加载 */}
      <Link to="/dashboard" prefetch="intent">
        控制台
      </Link>
      
      {/* 2. render 预加载 */}
      {/* 组件渲染时立即预加载 */}
      <Link to="/critical-page" prefetch="render">
        重要页面
      </Link>
      
      {/* 3. viewport 预加载 */}
      {/* 进入视口时预加载 */}
      <Link to="/lazy-page" prefetch="viewport">
        懒加载页面
      </Link>
      
      {/* 4. 手动预加载 */}
      {/* 在页面中预加载其他页面的资源 */}
      <PrefetchPageLinks page="/dashboard" />
      
      {/* 5. 预加载特定路由的数据 */}
      {items.map(item => (
        <div key={item.id}>
          <Link 
            to={`/items/${item.id}`}
            prefetch="intent"
          >
            {item.name}
          </Link>
        </div>
      ))}
    </div>
  );
}

// 预加载最佳实践：

// 1. 导航链接使用 prefetch="intent"
// 2. 关键页面使用 prefetch="render"
// 3. 避免过度预加载
// 4. 监控网络请求，确保预加载有价值
```

---

## 六、路由守卫与权限

### 6.1 路由权限检查

```tsx
// 在 loader 中检查用户权限

import { redirect } from "@remix-run/node";
import { getSession } from "~/session.server";

// 创建权限检查函数
export async function requireUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  
  if (!userId) {
    // 未登录，重定向到登录页
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await session.destroySession(),
      },
    });
  }
  
  const user = await db.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw redirect("/login");
  }
  
  return user;
}

// 在路由中使用
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 检查用户是否登录
  const user = await requireUser(request);
  
  // 返回用户数据
  return json({ user });
};

// 管理员权限检查
export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  
  if (user.role !== "admin") {
    throw new Response("无权限", { status: 403 });
  }
  
  return user;
}
```

### 6.2 路由中间件模式

```tsx
// 创建可复用的中间件函数

// app/utils/middleware.ts

type MiddlewareContext = {
  request: Request;
  params: Record<string, string>;
  context: Record<string, unknown>;
};

type Middleware = (
  context: MiddlewareContext,
  next: () => Promise<Response>
) => Promise<Response>;

// 组合中间件
export function compose(...middlewares: Middleware[]) {
  return async (context: MiddlewareContext): Promise<Response> => {
    let index = 0;
    
    const next = async (): Promise<Response> => {
      if (index >= middlewares.length) {
        return new Response("No handler", { status: 500 });
      }
      
      const middleware = middlewares[index++];
      return middleware(context, next);
    };
    
    return next();
  };
}

// 使用示例
const authMiddleware: Middleware = async (context, next) => {
  const session = await getSession(context.request.headers.get("Cookie"));
  const userId = session.get("userId");
  
  if (!userId) {
    return redirect("/login");
  }
  
  context.context.user = { id: userId };
  return next();
};

const loggingMiddleware: Middleware = async (context, next) => {
  console.log(`[${new Date().toISOString()}] ${context.request.url}`);
  return next();
};

// 在路由中应用
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const middleware = compose(
    loggingMiddleware,
    authMiddleware,
    async (context) => {
      // 实际的 loader 逻辑
      return json({ data: "..." });
    }
  );
  
  return middleware({ request, params, context: {} });
};
```

---

## 七、小结

通过本节学习，你应该掌握了：

1. **嵌套路由**: 使用 Outlet 实现多层布局
2. **动态路由**: 使用 $ 前缀创建参数化路由
3. **路由文件命名**: 理解各种命名约定和优先级
4. **布局嵌套**: 创建复杂的多层布局结构
5. **链接导航**: 使用 Link、NavLink 和编程式导航
6. **路由权限**: 实现路由守卫和权限检查

下一节我们将学习 Remix 的数据加载机制。
