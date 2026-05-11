# Next.js 15 数据获取

## 一、数据获取概述

Next.js 15 基于 React 的 Server Components，提供了强大的数据获取能力。

### 数据获取方式

```typescript
// Next.js 15 中的数据获取方式：

// 1. 在 Server Component 中直接获取
//    - 使用 fetch API
//    - 使用数据库客户端
//    - 使用 ORM（Prisma、Drizzle 等）

// 2. 在 Client Component 中获取
//    - 使用 useEffect + fetch
//    - 使用 SWR、React Query 等库
//    - 调用 Server Actions

// 3. 静态生成时获取
//    - generateStaticParams
//    - 构建时预渲染

// 推荐优先使用 Server Component 获取数据
```

---

## 二、fetch 缓存

### 默认缓存行为

```typescript
// ============================================
// Next.js 扩展了 fetch API，添加了缓存控制
// ============================================

// app/products/page.tsx

// 默认行为：缓存请求（相当于 cache: 'force-cache'）
export default async function ProductsPage() {
  const res = await fetch('https://api.example.com/products');
  const products = await res.json();
  
  return <ProductList products={products} />;
}

// 这个请求会被缓存：
// - 开发环境：每次刷新都会重新请求
// - 生产环境：构建时请求一次，之后使用缓存
```

### 禁用缓存

```typescript
// ============================================
// cache: 'no-store' - 每次请求都获取最新数据
// ============================================

// app/news/page.tsx
export default async function NewsPage() {
  // 禁用缓存，每次请求都获取最新数据
  const res = await fetch('https://api.example.com/news', {
    cache: 'no-store',  // 不缓存
  });
  const news = await res.json();
  
  return <NewsList news={news} />;
}

// 适用场景：
// - 实时数据（股票价格、新闻等）
// - 用户特定数据
// - 频繁变化的数据
```

### 强制缓存

```typescript
// ============================================
// cache: 'force-cache' - 强制使用缓存
// ============================================

// app/docs/page.tsx
export default async function DocsPage() {
  // 强制使用缓存（这是默认行为）
  const res = await fetch('https://api.example.com/docs', {
    cache: 'force-cache',
  });
  const docs = await res.json();
  
  return <DocsList docs={docs} />;
}

// 适用场景：
// - 静态内容
// - 很少变化的数据
// - 文档、配置等
```

### 缓存时间控制

```typescript
// ============================================
// next.revalidate - 设置重新验证时间（ISR）
// ============================================

// app/posts/page.tsx
export default async function PostsPage() {
  // 每 60 秒重新验证一次
  const res = await fetch('https://api.example.com/posts', {
    next: {
      revalidate: 60,  // 60 秒后重新验证
    },
  });
  const posts = await res.json();
  
  return <PostsList posts={posts} />;
}

// 工作原理：
// 1. 第一次请求：获取数据并缓存
// 2. 60 秒内的请求：返回缓存数据
// 3. 60 秒后的第一次请求：
//    - 返回缓存数据（stale-while-revalidate）
//    - 后台重新获取数据并更新缓存
// 4. 之后的请求：返回更新后的缓存

// 适用场景：
// - 博客文章
// - 产品列表
// - 定期更新的内容
```

---

## 三、revalidate

### 路由段配置

```typescript
// ============================================
// 使用 route segment config 设置重新验证
// ============================================

// app/blog/page.tsx

// 方式 1：使用 fetch 的 next.revalidate
export default async function BlogPage() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 },  // 1 小时
  });
  const posts = await res.json();
  
  return <BlogList posts={posts} />;
}

// 方式 2：使用路由段配置（适用于整个页面）
export const revalidate = 3600;  // 1 小时

export default async function BlogPage() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  
  return <BlogList posts={posts} />;
}

// 方式 3：false 表示静态生成，0 表示禁用缓存
export const revalidate = false;  // 默认，静态生成
export const revalidate = 0;      // 禁用缓存，每次都重新获取
```

### 按需重新验证

```typescript
// ============================================
// 使用 revalidatePath 和 revalidateTag
// ============================================

// app/actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

// 重新验证特定路径
export async function revalidateBlog() {
  // 重新验证 /blog 路径
  revalidatePath('/blog');
  
  // 重新验证所有 blog 相关路径
  revalidatePath('/blog', 'page');
  
  // 重新验证所有路径
  revalidatePath('/', 'layout');
}

// 使用标签重新验证
export async function revalidatePosts() {
  // 重新验证带有 'posts' 标签的所有请求
  revalidateTag('posts');
}

// ============================================
// 在 fetch 中使用标签
// ============================================

// app/blog/page.tsx
export default async function BlogPage() {
  const res = await fetch('https://api.example.com/posts', {
    next: {
      tags: ['posts'],  // 添加标签
    },
  });
  const posts = await res.json();
  
  return <BlogList posts={posts} />;
}

// 当调用 revalidateTag('posts') 时，这个请求会被重新验证
```

### 实际应用示例

```typescript
// ============================================
// 博客文章发布后重新验证
// ============================================

// app/admin/actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';

export async function createPost(formData: FormData) {
  // 创建文章
  const post = await db.post.create({
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    },
  });
  
  // 重新验证相关页面
  revalidatePath('/blog');           // 博客列表页
  revalidatePath(`/blog/${post.id}`); // 文章详情页
  revalidateTag('posts');            // 所有带 posts 标签的请求
  
  return post;
}

export async function updatePost(id: string, formData: FormData) {
  // 更新文章
  const post = await db.post.update({
    where: { id },
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    },
  });
  
  // 重新验证
  revalidatePath('/blog');
  revalidatePath(`/blog/${id}`);
  
  return post;
}

export async function deletePost(id: string) {
  // 删除文章
  await db.post.delete({ where: { id } });
  
  // 重新验证
  revalidatePath('/blog');
  revalidateTag('posts');
}
```

---

## 四、并行请求

### Promise.all

```typescript
// ============================================
// 使用 Promise.all 并行获取多个数据
// ============================================

// app/dashboard/page.tsx
export default async function DashboardPage() {
  // 并行获取多个数据
  const [users, products, orders] = await Promise.all([
    fetch('https://api.example.com/users').then(r => r.json()),
    fetch('https://api.example.com/products').then(r => r.json()),
    fetch('https://api.example.com/orders').then(r => r.json()),
  ]);
  
  return (
    <div>
      <UsersSection users={users} />
      <ProductsSection products={products} />
      <OrdersSection orders={orders} />
    </div>
  );
}

// 所有请求同时发起，总时间 = 最慢的那个请求
// 而不是所有请求时间之和
```

### 预加载数据

```typescript
// ============================================
// 使用 preload 模式提前获取数据
// ============================================

// lib/api.ts
// 预加载函数
export const preloadUsers = () => {
  // void 表示我们不等待结果，只是启动请求
  void fetchUsers();
};

export const preloadProducts = () => {
  void fetchProducts();
};

// 实际的获取函数
export async function fetchUsers() {
  const res = await fetch('https://api.example.com/users', {
    cache: 'no-store',
  });
  return res.json();
}

export async function fetchProducts() {
  const res = await fetch('https://api.example.com/products', {
    cache: 'no-store',
  });
  return res.json();
}

// app/dashboard/layout.tsx
import { preloadUsers, preloadProducts } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 在布局中预加载数据
  preloadUsers();
  preloadProducts();
  
  return (
    <div>
      <nav>...</nav>
      {children}
    </div>
  );
}

// app/dashboard/page.tsx
import { fetchUsers, fetchProducts } from '@/lib/api';

export default async function DashboardPage() {
  // 数据可能已经被预加载，这里会使用缓存
  const [users, products] = await Promise.all([
    fetchUsers(),
    fetchProducts(),
  ]);
  
  return (
    <div>
      <UsersList users={users} />
      <ProductsList products={products} />
    </div>
  );
}
```

### 使用 Suspense 进行流式渲染

```typescript
// ============================================
// 使用 Suspense 实现渐进式加载
// ============================================

// app/dashboard/page.tsx
import { Suspense } from 'react';

// 慢组件
async function SlowComponent() {
  // 模拟慢请求
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const data = await fetch('https://api.example.com/slow').then(r => r.json());
  
  return <div>{JSON.stringify(data)}</div>;
}

// 快组件
async function FastComponent() {
  const data = await fetch('https://api.example.com/fast').then(r => r.json());
  
  return <div>{JSON.stringify(data)}</div>;
}

export default function DashboardPage() {
  return (
    <div>
      {/* 快组件会先显示 */}
      <FastComponent />
      
      {/* 慢组件显示加载状态，加载完成后显示内容 */}
      <Suspense fallback={<div>加载中...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
```

---

## 五、流式渲染

### 基本概念

```typescript
// ============================================
// 流式渲染（Streaming）允许页面逐步加载
// ============================================

// 传统 SSR：
// 1. 服务器获取所有数据
// 2. 渲染完整的 HTML
// 3. 发送给客户端
// 问题：如果有一个慢请求，整个页面都会等待

// 流式渲染：
// 1. 服务器立即发送 HTML 骨架
// 2. 数据准备好后，逐步发送内容
// 3. 用户可以更快看到页面

// Next.js 15 使用 React 19 的 Suspense 实现流式渲染
```

### 使用 Suspense

```typescript
// ============================================
// app/page.tsx - 使用 Suspense 实现流式渲染
// ============================================

import { Suspense } from 'react';

// 加载骨架组件
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

// 产品列表组件（可能需要时间加载）
async function ProductList() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 },
  }).then(r => r.json());
  
  return (
    <ul>
      {products.map((product: any) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}

// 推荐产品组件
async function RecommendedProducts() {
  const products = await fetch('https://api.example.com/recommended', {
    next: { revalidate: 60 },
  }).then(r => r.json());
  
  return (
    <div>
      <h2>推荐商品</h2>
      {products.map((product: any) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}

// 页面组件
export default function Page() {
  return (
    <div>
      <h1>商品页面</h1>
      
      {/* 产品列表 - 使用 Suspense 包裹 */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductList />
      </Suspense>
      
      {/* 推荐产品 - 独立加载 */}
      <Suspense fallback={<div>加载推荐...</div>}>
        <RecommendedProducts />
      </Suspense>
    </div>
  );
}

// 效果：
// 1. 页面立即显示标题
// 2. ProductList 显示骨架屏
// 3. RecommendedProducts 显示加载文字
// 4. 各组件数据准备好后，逐步显示内容
```

### loading.tsx 与 Suspense

```typescript
// ============================================
// loading.tsx 是特殊的 Suspense 边界
// ============================================

// 目录结构：
// app/
// ├── layout.tsx
// ├── page.tsx
// └── dashboard/
//     ├── loading.tsx      # 自动创建 Suspense 边界
//     ├── page.tsx
//     └── analytics/
//         ├── loading.tsx
//         └── page.tsx

// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

// app/dashboard/page.tsx
export default async function DashboardPage() {
  // 这个页面会被 loading.tsx 包裹
  const data = await fetchDashboardData();
  
  return <Dashboard data={data} />;
}

// 等价于：
// app/dashboard/layout.tsx
import { Suspense } from 'react';
import Loading from './loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
}
```

### 错误边界与流式渲染

```typescript
// ============================================
// 结合 Error Boundary 处理加载错误
// ============================================

// app/dashboard/page.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// 错误回退组件
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert">
      <p>加载失败:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

// 数据组件
async function DashboardData() {
  const data = await fetch('/api/dashboard').then(r => {
    if (!r.ok) throw new Error('加载失败');
    return r.json();
  });
  
  return <div>{JSON.stringify(data)}</div>;
}

export default function DashboardPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<div>加载中...</div>}>
        <DashboardData />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 六、数据库集成

### 使用 Prisma

```typescript
// ============================================
// 安装 Prisma
// npm install prisma @prisma/client
// npx prisma init
// ============================================

// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// 在开发环境中避免创建多个 PrismaClient 实例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// prisma/schema.prisma
// model Post {
//   id        String   @id @default(cuid())
//   title     String
//   content   String?
//   published Boolean @default(false)
//   author    User?   @relation(fields: [authorId], references: [id])
//   authorId  String?
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// app/blog/page.tsx
import { prisma } from '@/lib/prisma';

export default async function BlogPage() {
  // 直接查询数据库
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  });
  
  return (
    <div>
      <h1>博客文章</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          {post.author && <small>作者: {post.author.name}</small>}
        </article>
      ))}
    </div>
  );
}
```

### 使用 Drizzle ORM

```typescript
// ============================================
// 安装 Drizzle
// npm install drizzle-orm postgres
// npm install -D drizzle-kit
// ============================================

// lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });

// lib/schema.ts
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// app/blog/page.tsx
import { db } from '@/lib/db';
import { posts } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';

export default async function BlogPage() {
  // 查询所有已发布的文章
  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));
  
  return (
    <div>
      <h1>博客文章</h1>
      {allPosts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

---

## 七、最佳实践

### 1. 选择合适的缓存策略

```typescript
// ============================================
// 根据数据特性选择缓存策略
// ============================================

// 静态数据（很少变化）
// - 使用 cache: 'force-cache' 或较长的 revalidate
export async function getStaticData() {
  return fetch('/api/static', { cache: 'force-cache' });
}

// 动态数据（定期更新）
// - 使用 revalidate
export async function getDynamicData() {
  return fetch('/api/dynamic', { next: { revalidate: 60 } });
}

// 实时数据（频繁变化）
// - 使用 cache: 'no-store'
export async function getRealtimeData() {
  return fetch('/api/realtime', { cache: 'no-store' });
}

// 用户数据（个性化）
// - 使用 cache: 'no-store' 或按需重新验证
export async function getUserData(userId: string) {
  return fetch(`/api/user/${userId}`, { cache: 'no-store' });
}
```

### 2. 错误处理

```typescript
// ============================================
// 正确处理数据获取错误
// ============================================

// app/posts/page.tsx
import { notFound } from 'next/navigation';

export default async function PostsPage() {
  try {
    const res = await fetch('https://api.example.com/posts');
    
    // 处理 HTTP 错误
    if (!res.ok) {
      if (res.status === 404) {
        notFound();  // 显示 404 页面
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const posts = await res.json();
    
    return <PostsList posts={posts} />;
    
  } catch (error) {
    // 记录错误
    console.error('Failed to fetch posts:', error);
    
    // 可以返回错误 UI 或抛出错误让 error.tsx 处理
    throw error;
  }
}
```

### 3. 数据获取函数封装

```typescript
// ============================================
// 封装数据获取逻辑
// ============================================

// lib/api/posts.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getPosts(options?: {
  page?: number;
  limit?: number;
  tag?: string;
}) {
  const { page = 1, limit = 10, tag } = options || {};
  
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(tag && { tag }),
  });
  
  const res = await fetch(`${API_BASE}/posts?${params}`, {
    next: {
      revalidate: 60,
      tags: ['posts'],
    },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  return res.json();
}

export async function getPost(id: string) {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    next: {
      revalidate: 3600,
      tags: ['posts', `post-${id}`],
    },
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch post');
  }
  
  return res.json();
}

// app/blog/page.tsx
import { getPosts } from '@/lib/api/posts';

export default async function BlogPage() {
  const { posts, total } = await getPosts({ page: 1, limit: 10 });
  
  return <PostsList posts={posts} total={total} />;
}
```

---

## 下一步

恭喜你完成了数据获取的学习！

接下来，我们将深入学习 [Server Actions](./05-server-actions.md)，了解如何在 Next.js 15 中处理表单和数据变更。
