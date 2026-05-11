# Remix 数据加载详解

本文档详细介绍 Remix 的数据加载机制，包括 useLoaderData、并行加载、错误边界等内容。

---

## 一、useLoaderData

### 1.1 基本用法

```tsx
// useLoaderData 用于获取当前路由 loader 返回的数据

import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// 定义 loader（服务端运行）
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // 可以访问数据库、调用 API 等
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  
  // 返回 JSON 响应
  return json({ posts });
};

// 页面组件（客户端运行）
export default function PostsPage() {
  // 获取 loader 返回的数据
  // TypeScript 会自动推断类型
  const { posts } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <h1>最新文章</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 1.2 类型安全

```tsx
// Remix 提供完整的类型安全支持

import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// 定义返回类型
type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
};

type LoaderData = {
  posts: Post[];
  total: number;
  page: number;
};

// 使用类型化的 json
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  
  const [posts, total] = await Promise.all([
    db.post.findMany({
      skip: (page - 1) * 10,
      take: 10,
    }),
    db.post.count(),
  ]);
  
  // 类型安全的返回
  return json<LoaderData>({ posts, total, page });
};

// 组件中自动获得类型
export default function PostsPage() {
  const { posts, total, page } = useLoaderData<typeof loader>();
  // posts: Post[]
  // total: number
  // page: number
  
  return (
    <div>
      <p>共 {total} 篇文章，当前第 {page} 页</p>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

### 1.3 Loader 参数详解

```tsx
// LoaderFunctionArgs 包含以下参数

import { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ 
  request,    // Request 对象
  params,     // URL 参数（动态路由）
  context,    // 应用上下文（可选）
}: LoaderFunctionArgs) => {
  
  // 1. request - 标准 Request 对象
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("q");
  const userAgent = request.headers.get("User-Agent");
  const cookie = request.headers.get("Cookie");
  
  // 获取请求方法
  const method = request.method; // GET, POST, etc.
  
  // 获取请求体（POST 请求）
  // const body = await request.json();
  // const formData = await request.formData();
  
  // 2. params - 动态路由参数
  // URL: /posts/123/comments/456
  // params: { id: "123", commentId: "456" }
  const { id, commentId } = params;
  
  // 3. context - 应用上下文（需要配置）
  // 可以包含数据库连接、缓存等
  const { db, cache } = context;
  
  return json({ 
    searchQuery,
    postId: id,
    commentId,
  });
};
```

---

## 二、useRouteLoaderData

### 2.1 跨路由数据共享

```tsx
// useRouteLoaderData 允许访问其他路由的 loader 数据
// 避免重复请求相同数据

import { useRouteLoaderData } from "@remix-run/react";

// app/root.tsx - 根路由加载用户信息
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json({ user });
};

// app/routes/dashboard.tsx - 访问根路由数据
export default function Dashboard() {
  // 使用路由 ID 获取数据
  // 根路由的 ID 通常是 "root"
  const rootData = useRouteLoaderData<{ user: User }>("root");
  
  if (!rootData?.user) {
    return <p>请先登录</p>;
  }
  
  return (
    <div>
      <h1>欢迎, {rootData.user.name}</h1>
    </div>
  );
}

// 自定义路由 ID
// app/routes/posts.$id.tsx
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const post = await db.post.findUnique({
    where: { id: params.id },
  });
  return json({ post });
};

// 路由 ID 默认是文件路径
// posts.$id.tsx → routes/posts.$id
```

### 2.2 实际应用场景

```tsx
// 场景：在多个子路由中共享父路由数据

// app/routes/admin.tsx - 管理后台布局
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 加载管理员信息和权限
  const admin = await getAdminUser(request);
  const permissions = await getPermissions(admin.id);
  const notifications = await getNotifications(admin.id);
  
  return json({ admin, permissions, notifications });
};

export default function AdminLayout() {
  const { admin, permissions, notifications } = useLoaderData<typeof loader>();
  
  return (
    <div className="admin-layout">
      <header>
        <h1>管理后台</h1>
        <span>{notifications.length} 条通知</span>
      </header>
      
      <div className="content">
        <Outlet context={{ permissions }} />
      </div>
    </div>
  );
}

// app/routes/admin.users.tsx - 用户管理页面
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 只加载用户列表
  const users = await db.user.findMany();
  return json({ users });
};

export default function UsersPage() {
  const { users } = useLoaderData<typeof loader>();
  
  // 访问父路由的数据
  const adminData = useRouteLoaderData<typeof adminLoader>("routes/admin");
  
  // 检查权限
  if (!adminData?.permissions.includes("users:read")) {
    return <p>无权限访问</p>;
  }
  
  return (
    <div>
      <h1>用户管理</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 三、并行加载

### 3.1 嵌套路由并行加载

```tsx
// Remix 自动并行加载嵌套路由的数据

// 文件结构：
// app/routes/
// ├── posts.tsx          # 父路由
// └── posts.$id.tsx      # 子路由

// app/routes/posts.tsx
export const loader = async () => {
  console.log("父路由 loader 开始");
  const categories = await db.category.findMany();
  console.log("父路由 loader 结束");
  return json({ categories });
};

// app/routes/posts.$id.tsx
export const loader = async ({ params }: LoaderFunctionArgs) => {
  console.log("子路由 loader 开始");
  const post = await db.post.findUnique({
    where: { id: params.id },
  });
  console.log("子路由 loader 结束");
  return json({ post });
};

// 访问 /posts/123 时：
// 父路由 loader 和子路由 loader 并行执行
// 输出顺序可能是：
// 父路由 loader 开始
// 子路由 loader 开始
// 子路由 loader 结束
// 父路由 loader 结束
```

### 3.2 单个 Loader 内并行加载

```tsx
// 在单个 loader 中并行加载多个数据

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // ❌ 串行加载（慢）
  const post = await db.post.findUnique({ where: { id: params.id } });
  const comments = await db.comment.findMany({ where: { postId: params.id } });
  const author = await db.user.findUnique({ where: { id: post.authorId } });
  
  // ✅ 并行加载（快）
  const [post, comments, author] = await Promise.all([
    db.post.findUnique({ where: { id: params.id } }),
    db.comment.findMany({ where: { postId: params.id } }),
    db.user.findUnique({ where: { id: post.authorId } }),
  ]);
  
  return json({ post, comments, author });
};

// 更复杂的并行加载
export const loader = async ({ params }: LoaderFunctionArgs) => {
  // 先获取文章
  const post = await db.post.findUnique({
    where: { id: params.id },
    include: { author: true },
  });
  
  if (!post) {
    throw new Response("文章不存在", { status: 404 });
  }
  
  // 然后并行获取相关数据
  const [comments, relatedPosts, likes] = await Promise.all([
    db.comment.findMany({
      where: { postId: params.id },
      include: { author: true },
    }),
    db.post.findMany({
      where: { 
        categoryId: post.categoryId,
        id: { not: params.id },
      },
      take: 5,
    }),
    db.like.count({
      where: { postId: params.id },
    }),
  ]);
  
  return json({ post, comments, relatedPosts, likes });
};
```

### 3.3 使用 defer 延迟加载

```tsx
// defer 允许先返回部分数据，其余数据流式传输

import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // 关键数据立即加载
  const post = await db.post.findUnique({
    where: { id: params.id },
  });
  
  // 非关键数据可以延迟加载（返回 Promise）
  const comments = db.comment.findMany({
    where: { postId: params.id },
  });
  
  const relatedPosts = db.post.findMany({
    where: { categoryId: post?.categoryId },
    take: 5,
  });
  
  // 使用 defer 返回
  return defer({
    post,           // 立即可用
    comments,       // Promise，稍后可用
    relatedPosts,   // Promise，稍后可用
  });
};

export default function PostPage() {
  const { post, comments, relatedPosts } = useLoaderData<typeof loader>();
  
  return (
    <div>
      {/* 文章内容立即可见 */}
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
      
      {/* 评论使用 Await 组件 */}
      <section>
        <h2>评论</h2>
        <Suspense fallback={<p>加载评论中...</p>}>
          <Await resolve={comments}>
            {(comments) => (
              <ul>
                {comments.map(comment => (
                  <li key={comment.id}>{comment.content}</li>
                ))}
              </ul>
            )}
          </Await>
        </Suspense>
      </section>
      
      {/* 相关文章 */}
      <aside>
        <h2>相关文章</h2>
        <Suspense fallback={<p>加载中...</p>}>
          <Await resolve={relatedPosts}>
            {(posts) => (
              <ul>
                {posts.map(p => (
                  <li key={p.id}>{p.title}</li>
                ))}
              </ul>
            )}
          </Await>
        </Suspense>
      </aside>
    </div>
  );
}
```

---

## 四、错误边界

### 4.1 ErrorBoundary 组件

```tsx
// ErrorBoundary 捕获渲染错误和 loader/action 错误

import { useRouteError, isRouteErrorResponse } from "@remix-run/react";

// 在路由文件中导出 ErrorBoundary
export function ErrorBoundary() {
  const error = useRouteError();
  
  // 判断是否是路由错误响应
  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-container">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
        <Link to="/">返回首页</Link>
      </div>
    );
  }
  
  // 其他错误（如 JavaScript 错误）
  if (error instanceof Error) {
    return (
      <div className="error-container">
        <h1>出错了</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
  
  return <h1>未知错误</h1>;
}

// 在 loader 中抛出错误响应
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const post = await db.post.findUnique({
    where: { id: params.id },
  });
  
  if (!post) {
    // 抛出 404 响应
    throw new Response("文章不存在", { status: 404 });
  }
  
  // 或者使用 json 返回错误
  throw json({ message: "文章不存在" }, { status: 404 });
  
  return json({ post });
};
```

### 4.2 错误边界嵌套

```tsx
// 错误边界会向上冒泡，直到被捕获

// app/root.tsx - 根错误边界
export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <html>
      <head>
        <title>出错了</title>
      </head>
      <body>
        <h1>应用错误</h1>
        <p>抱歉，发生了错误</p>
        <Link to="/">返回首页</Link>
      </body>
    </html>
  );
}

// app/routes/posts.$id.tsx - 路由错误边界
export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="not-found">
        <h2>文章不存在</h2>
        <p>该文章可能已被删除</p>
        <Link to="/posts">查看所有文章</Link>
      </div>
    );
  }
  
  // 其他错误向上冒泡到父路由或根错误边界
  throw error;
}
```

### 4.3 使用 CatchBoundary（旧版）

```tsx
// 注意：Remix v2 已将 ErrorBoundary 和 CatchBoundary 合并
// 以下是旧版写法，仅供参考

// Remix v1 写法
export function CatchBoundary() {
  const caught = useCatch();
  
  return (
    <div>
      <h1>{caught.status}</h1>
      <p>{caught.data}</p>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <h1>错误</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

### 4.4 自定义错误处理

```tsx
// 创建可复用的错误处理函数

// app/utils/errors.ts

// 自定义错误类
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "未授权") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "无权限") {
    super(message);
    this.name = "ForbiddenError";
  }
}

// 错误处理函数
export function handleError(error: unknown) {
  if (error instanceof NotFoundError) {
    throw new Response(error.message, { status: 404 });
  }
  
  if (error instanceof UnauthorizedError) {
    throw redirect("/login");
  }
  
  if (error instanceof ForbiddenError) {
    throw new Response(error.message, { status: 403 });
  }
  
  // 未知错误
  console.error(error);
  throw new Response("服务器错误", { status: 500 });
}

// 在 loader 中使用
export const loader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const post = await db.post.findUnique({
      where: { id: params.id },
    });
    
    if (!post) {
      throw new NotFoundError("文章不存在");
    }
    
    return json({ post });
  } catch (error) {
    handleError(error);
  }
};
```

---

## 五、缓存策略

### 5.1 HTTP 缓存头

```tsx
// 使用 headers 函数设置 HTTP 缓存

import { json, LoaderFunctionArgs } from "@remix-run/node";

// 设置缓存头
export const headers = () => {
  return {
    // 浏览器缓存 1 小时
    "Cache-Control": "public, max-age=3600",
    
    // 或者更复杂的缓存策略
    // "Cache-Control": "public, max-age=3600, s-maxage=86400",
    // max-age: 浏览器缓存时间
    // s-maxage: CDN 缓存时间
    // public: 可以被任何缓存存储
    // private: 只能被浏览器缓存
    // no-cache: 每次使用前验证
    // no-store: 不缓存
  };
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const post = await db.post.findUnique({
    where: { id: params.id },
  });
  
  return json({ post });
};

// 根据数据动态设置缓存
export const headers = ({ loaderData }: { loaderData: any }) => {
  if (loaderData?.post?.published) {
    return {
      "Cache-Control": "public, max-age=3600",
    };
  } else {
    return {
      "Cache-Control": "private, no-cache",
    };
  }
};
```

### 5.2 使用 ETag 和 Last-Modified

```tsx
// 使用 ETag 进行条件请求

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const post = await db.post.findUnique({
    where: { id: params.id },
  });
  
  if (!post) {
    throw new Response("文章不存在", { status: 404 });
  }
  
  // 生成 ETag（内容哈希）
  const etag = crypto
    .createHash("md5")
    .update(JSON.stringify(post))
    .digest("hex");
  
  // 检查客户端是否有最新版本
  const ifNoneMatch = request.headers.get("If-None-Match");
  if (ifNoneMatch === etag) {
    // 客户端缓存是最新的，返回 304
    throw new Response(null, { status: 304 });
  }
  
  // 返回数据和 ETag
  return json({ post }, {
    headers: {
      "ETag": etag,
      "Cache-Control": "public, max-age=3600",
    },
  });
};
```

### 5.3 客户端缓存

```tsx
// 使用 useRevalidator 手动刷新数据

import { useRevalidator } from "@remix-run/react";

export default function PostPage() {
  const revalidator = useRevalidator();
  const { post } = useLoaderData<typeof loader>();
  
  const handleRefresh = () => {
    // 重新调用 loader 获取最新数据
    revalidator.revalidate();
  };
  
  return (
    <div>
      <h1>{post.title}</h1>
      <button 
        onClick={handleRefresh}
        disabled={revalidator.state === "loading"}
      >
        {revalidator.state === "loading" ? "刷新中..." : "刷新"}
      </button>
    </div>
  );
}

// 在 action 后自动刷新
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  
  // 更新文章
  await db.post.update({
    where: { id: params.id },
    data: { title: formData.get("title") },
  });
  
  // 重定向会自动刷新 loader
  return redirect(`/posts/${params.id}`);
};
```

### 5.4 使用 shouldRevalidate

```tsx
// 控制何时重新加载 loader 数据

import { ShouldRevalidateFunction } from "@remix-run/react";

// 默认情况下，action 成功后会重新加载所有 loader
// 使用 shouldRevalidate 可以控制这个行为

export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,     // action 返回的数据
  currentUrl,       // 当前 URL
  formData,         // 表单数据
  json,             // JSON 数据
  defaultShouldRevalidate,  // 默认行为
  nextUrl,          // 下一个 URL
}) => {
  // 只在特定条件下重新加载
  if (actionResult?.type === "comment-added") {
    // 只重新加载评论相关的数据
    return false;
  }
  
  // 使用默认行为
  return defaultShouldRevalidate;
};

// 更实际的例子
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formData,
  defaultShouldRevalidate,
}) => {
  // 如果是点赞操作，不重新加载整个页面
  if (formData?.get("intent") === "like") {
    return false;
  }
  
  return defaultShouldRevalidate;
};
```

---

## 六、数据加载最佳实践

### 6.1 避免过度获取

```tsx
// ❌ 获取所有字段
const users = await db.user.findMany();

// ✅ 只获取需要的字段
const users = await db.user.findMany({
  select: {
    id: true,
    name: true,
    avatar: true,
  },
});

// ❌ 获取所有关联数据
const posts = await db.post.findMany({
  include: { 
    author: true, 
    comments: true, 
    likes: true,
    category: true,
  },
});

// ✅ 按需获取
const posts = await db.post.findMany({
  select: {
    id: true,
    title: true,
    excerpt: true,
    author: {
      select: { id: true, name: true },
    },
  },
});
```

### 6.2 分页和无限滚动

```tsx
// 分页加载

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10;
  
  const [posts, total] = await Promise.all([
    db.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.post.count(),
  ]);
  
  return json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export default function PostsPage() {
  const { posts, pagination } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      
      <nav>
        {pagination.page > 1 && (
          <Link to={`?page=${pagination.page - 1}`}>上一页</Link>
        )}
        <span>第 {pagination.page} 页</span>
        {pagination.page < pagination.totalPages && (
          <Link to={`?page=${pagination.page + 1}`}>下一页</Link>
        )}
      </nav>
    </div>
  );
}
```

---

## 七、小结

通过本节学习，你应该掌握了：

1. **useLoaderData**: 获取 loader 返回的数据
2. **useRouteLoaderData**: 跨路由数据共享
3. **并行加载**: 使用 Promise.all 和 defer
4. **错误边界**: 使用 ErrorBoundary 处理错误
5. **缓存策略**: HTTP 缓存和客户端缓存控制

下一节我们将学习 Remix 的数据变更机制。
