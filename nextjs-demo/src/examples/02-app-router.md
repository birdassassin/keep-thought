# Next.js 15 App Router 路由

## 一、App Router 概述

App Router 是 Next.js 13 引入的新路由系统，基于文件系统路由，使用 `app` 目录组织路由结构。

### 与 Pages Router 的区别

```typescript
// Pages Router（旧版，使用 pages 目录）
// pages/index.tsx        → /
// pages/about.tsx        → /about
// pages/blog/[id].tsx    → /blog/:id

// App Router（新版，使用 app 目录）
// app/page.tsx           → /
// app/about/page.tsx     → /about
// app/blog/[id]/page.tsx → /blog/:id

// App Router 的优势：
// 1. 支持嵌套布局
// 2. 支持 Server Components
// 3. 更好的流式渲染支持
// 4. 更灵活的数据获取
```

---

## 二、文件路由

### 基本路由结构

```
app/
├── page.tsx              # / (首页)
├── about/
│   └── page.tsx          # /about
├── blog/
│   ├── page.tsx          # /blog
│   └── [id]/
│       └── page.tsx      # /blog/:id
└── contact/
    └── page.tsx          # /contact
```

### 路由文件说明

```typescript
// ============================================
// app/page.tsx - 首页 (/)
// ============================================

export default function HomePage() {
  return <h1>首页</h1>;
}

// ============================================
// app/about/page.tsx - 关于页面 (/about)
// ============================================

export default function AboutPage() {
  return <h1>关于我们</h1>;
}

// ============================================
// app/blog/page.tsx - 博客列表 (/blog)
// ============================================

export default function BlogListPage() {
  return <h1>博客列表</h1>;
}

// 注意：
// 1. 每个路由必须有一个 page.tsx 文件
// 2. 文件夹名决定 URL 路径
// 3. page.tsx 是必须的，否则路由不会生效
```

### 特殊文件

```typescript
// App Router 中的特殊文件：

// page.tsx      - 页面组件（必需）
// layout.tsx    - 布局组件（共享 UI）
// loading.tsx   - 加载状态（自动显示）
// error.tsx     - 错误处理
// not-found.tsx - 404 页面
// route.ts      - API 路由
// template.tsx  - 模板组件（类似 layout，但会重新挂载）
// default.tsx   - 并行路由默认页面

// 目录结构示例：
app/
├── page.tsx           # 首页
├── layout.tsx         # 根布局
├── loading.tsx        # 全局加载状态
├── error.tsx          # 全局错误处理
├── not-found.tsx      # 404 页面
└── blog/
    ├── page.tsx       # 博客列表
    ├── layout.tsx     # 博客布局
    ├── loading.tsx    # 博客加载状态
    └── [id]/
        └── page.tsx   # 博客详情
```

---

## 三、动态路由

### 基本动态路由

```typescript
// ============================================
// app/blog/[id]/page.tsx
// ============================================
// 匹配 /blog/1, /blog/2, /blog/hello-world 等

// 定义页面 Props 类型
interface PageProps {
  params: Promise<{
    id: string;  // 动态参数名与文件夹名对应
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  // 获取动态路由参数
  const { id } = await params;
  
  // 获取查询参数
  const { preview } = await searchParams;
  
  return (
    <div>
      <h1>博客文章 ID: {id}</h1>
      {preview && <p>预览模式: {preview}</p>}
    </div>
  );
}

// 访问 /blog/123?preview=true
// id = "123", preview = "true"
```

### 多个动态参数

```typescript
// ============================================
// app/shop/[category]/[product]/page.tsx
// ============================================
// 匹配 /shop/electronics/phone, /shop/clothes/shirt 等

interface PageProps {
  params: Promise<{
    category: string;
    product: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { category, product } = await params;
  
  return (
    <div>
      <h1>分类: {category}</h1>
      <h2>产品: {product}</h2>
    </div>
  );
}

// 访问 /shop/electronics/phone
// category = "electronics", product = "phone"
```

### Catch-all 路由（捕获所有路由）

```typescript
// ============================================
// app/docs/[...slug]/page.tsx
// ============================================
// 使用 [...slug] 捕获多级路径
// 匹配 /docs/a, /docs/a/b, /docs/a/b/c 等

interface PageProps {
  params: Promise<{
    slug: string[];  // 注意：这里是数组
  }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  
  // slug 是数组，包含所有路径段
  // /docs/getting-started/installation → slug = ['getting-started', 'installation']
  
  return (
    <div>
      <h1>文档路径:</h1>
      <ul>
        {slug.map((segment, index) => (
          <li key={index}>{segment}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 可选 Catch-all 路由

```typescript
// ============================================
// app/docs/[[...slug]]/page.tsx
// ============================================
// 使用 [[...slug]] 双括号表示可选
// 匹配 /docs (不带参数) 和 /docs/a/b/c (带参数)

interface PageProps {
  params: Promise<{
    slug?: string[];  // 注意：这里是可选的
  }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  
  // /docs → slug = undefined
  // /docs/a → slug = ['a']
  // /docs/a/b → slug = ['a', 'b']
  
  if (!slug) {
    return <h1>文档首页</h1>;
  }
  
  return (
    <div>
      <h1>文档: {slug.join('/')}</h1>
    </div>
  );
}
```

### 静态参数生成

```typescript
// ============================================
// app/blog/[id]/page.tsx
// ============================================
// 为动态路由生成静态页面

// generateStaticParams 用于静态生成
// 在构建时预渲染指定的动态路由
export async function generateStaticParams() {
  // 通常从 API 或数据库获取数据
  const posts = await fetch('https://api.example.com/posts').then(res => res.json());
  
  // 返回参数数组，每个对象对应一个静态页面
  return posts.map((post: { id: string }) => ({
    id: post.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  
  return <h1>博客文章 {id}</h1>;
}

// 构建时会生成:
// /blog/1.html
// /blog/2.html
// /blog/3.html
// ...
```

---

## 四、路由组

### 基本用法

```typescript
// 使用 (groupName) 创建路由组
// 路由组不会出现在 URL 中

// 目录结构：
app/
├── (marketing)/           # 营销页面组
│   ├── about/
│   │   └── page.tsx       # /about
│   ├── contact/
│   │   └── page.tsx       # /contact
│   └── layout.tsx         # 营销页面共享布局
├── (shop)/                # 商店页面组
│   ├── products/
│   │   └── page.tsx       # /products
│   ├── cart/
│   │   └── page.tsx       # /cart
│   └── layout.tsx         # 商店页面共享布局
└── layout.tsx             # 根布局

// 注意：
// 1. (marketing) 和 (shop) 不会出现在 URL 中
// 2. 每个组可以有自己的 layout.tsx
// 3. 适合组织不同功能模块的代码
```

### 路由组布局示例

```typescript
// ============================================
// app/(marketing)/layout.tsx
// ============================================
// 营销页面的共享布局

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-layout">
      {/* 营销页面特有的导航 */}
      <nav className="bg-blue-500 p-4">
        <a href="/about">关于</a>
        <a href="/contact">联系</a>
      </nav>
      
      {/* 页面内容 */}
      {children}
      
      {/* 营销页面特有的页脚 */}
      <footer className="bg-blue-100 p-4">
        <p>营销部门</p>
      </footer>
    </div>
  );
}

// ============================================
// app/(shop)/layout.tsx
// ============================================
// 商店页面的共享布局

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shop-layout">
      {/* 商店页面特有的导航 */}
      <nav className="bg-green-500 p-4">
        <a href="/products">产品</a>
        <a href="/cart">购物车</a>
      </nav>
      
      {/* 页面内容 */}
      {children}
      
      {/* 商店页面特有的页脚 */}
      <footer className="bg-green-100 p-4">
        <p>商店部门</p>
      </footer>
    </div>
  );
}
```

---

## 五、布局

### 根布局

```typescript
// ============================================
// app/layout.tsx - 根布局
// ============================================
// 根布局是必需的，包含 html 和 body 标签

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的应用",
  description: "应用描述",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {/* 全局导航 */}
        <header>
          <nav>
            <a href="/">首页</a>
            <a href="/about">关于</a>
          </nav>
        </header>
        
        {/* 页面内容 */}
        <main>{children}</main>
        
        {/* 全局页脚 */}
        <footer>
          <p>© 2024 我的应用</p>
        </footer>
      </body>
    </html>
  );
}
```

### 嵌套布局

```typescript
// ============================================
// app/dashboard/layout.tsx - 仪表盘布局
// ============================================
// 子布局不需要 html 和 body 标签

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout flex">
      {/* 侧边栏 */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav>
          <ul>
            <li><a href="/dashboard">概览</a></li>
            <li><a href="/dashboard/settings">设置</a></li>
            <li><a href="/dashboard/profile">个人资料</a></li>
          </ul>
        </nav>
      </aside>
      
      {/* 内容区域 */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}

// 目录结构：
// app/
// ├── layout.tsx           # 根布局
// └── dashboard/
//     ├── layout.tsx       # 仪表盘布局（嵌套在根布局内）
//     ├── page.tsx         # /dashboard
//     ├── settings/
//     │   └── page.tsx     # /dashboard/settings
//     └── profile/
//         └── page.tsx     # /dashboard/profile
```

### 布局数据传递

```typescript
// ============================================
// 使用 React Context 在布局和页面间共享数据
// ============================================

// app/providers.tsx
'use client';  // Context 需要在客户端组件中使用

import { createContext, useContext, ReactNode } from 'react';

// 定义 Context 类型
interface AppContextType {
  user: { name: string; email: string };
  theme: 'light' | 'dark';
}

// 创建 Context
const AppContext = createContext<AppContextType | null>(null);

// Provider 组件
export function AppProvider({ children }: { children: ReactNode }) {
  const value = {
    user: { name: '张三', email: 'zhangsan@example.com' },
    theme: 'light' as const,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// 自定义 Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// app/layout.tsx
import { AppProvider } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

// app/dashboard/page.tsx
'use client';

import { useApp } from '../providers';

export default function DashboardPage() {
  const { user, theme } = useApp();
  
  return (
    <div>
      <h1>欢迎, {user.name}</h1>
      <p>当前主题: {theme}</p>
    </div>
  );
}
```

---

## 六、加载状态

### 基本用法

```typescript
// ============================================
// app/dashboard/loading.tsx
// ============================================
// loading.tsx 会自动在页面加载时显示

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

// 工作原理：
// 1. 用户访问 /dashboard
// 2. 立即显示 loading.tsx 的内容
// 3. page.tsx 加载完成后替换 loading 内容
// 4. 基于 React Suspense 实现
```

### 自定义加载组件

```typescript
// ============================================
// components/LoadingSpinner.tsx
// ============================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div 
        className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClasses[size]}`}
      />
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  );
}

// app/dashboard/loading.tsx
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="加载中..." />
    </div>
  );
}
```

### 骨架屏

```typescript
// ============================================
// app/blog/loading.tsx
// ============================================
// 使用骨架屏提供更好的加载体验

export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 标题骨架 */}
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
      
      {/* 文章列表骨架 */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            {/* 文章标题骨架 */}
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            {/* 文章摘要骨架 */}
            <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tailwind CSS 的 animate-pulse 类提供闪烁动画效果
```

---

## 七、错误处理

### 基本错误处理

```typescript
// ============================================
// app/error.tsx
// ============================================
// error.tsx 用于捕获页面中的错误

'use client';  // 错误组件必须是客户端组件

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;  // 重试函数
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 可以在这里记录错误到错误追踪服务
    console.error('页面错误:', error);
  }, [error]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        出错了！
      </h2>
      <p className="text-gray-600 mb-6">
        {error.message || '发生了一个未知错误'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        重试
      </button>
    </div>
  );
}

// 注意：
// 1. error.tsx 必须是客户端组件（'use client'）
// 2. 它会捕获同一目录下 page.tsx 的错误
// 3. reset 函数可以重新渲染页面
```

### 嵌套错误处理

```typescript
// 目录结构：
app/
├── error.tsx           # 全局错误处理
└── dashboard/
    ├── error.tsx       # 仪表盘错误处理
    └── settings/
        ├── error.tsx   # 设置页面错误处理
        └── page.tsx

// 每个层级的 error.tsx 只捕获该层级及以下的错误
// 例如：/dashboard/settings 的错误会先被 settings/error.tsx 捕获
// 如果 settings/error.tsx 不存在，则被 dashboard/error.tsx 捕获
```

### 404 页面

```typescript
// ============================================
// app/not-found.tsx
// ============================================
// 自定义 404 页面

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl text-gray-600 mb-8">页面未找到</h2>
      <p className="text-gray-500 mb-8">
        抱歉，您访问的页面不存在。
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        返回首页
      </Link>
    </div>
  );
}

// 触发 404 页面的方式：
// 1. 访问不存在的路由
// 2. 在页面中调用 notFound() 函数
```

### 手动触发 404

```typescript
// ============================================
// app/blog/[id]/page.tsx
// ============================================

import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  
  // 获取文章数据
  const post = await fetch(`/api/posts/${id}`).then(res => res.json());
  
  // 如果文章不存在，显示 404 页面
  if (!post) {
    notFound();  // 这会显示 not-found.tsx 的内容
  }
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

---

## 八、路由导航

### Link 组件

```typescript
// ============================================
// 使用 Link 组件进行客户端导航
// ============================================

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      {/* 基本用法 */}
      <Link href="/">首页</Link>
      
      {/* 带路径参数 */}
      <Link href="/blog/123">博客文章</Link>
      
      {/* 带查询参数 */}
      <Link href="/search?q=nextjs">搜索</Link>
      
      {/* 动态链接 */}
      <Link href={`/products/${productId}`}>产品详情</Link>
      
      {/* 带样式 */}
      <Link 
        href="/about"
        className="text-blue-500 hover:text-blue-700"
      >
        关于我们
      </Link>
      
      {/* 替换历史记录（不添加到浏览器历史） */}
      <Link href="/login" replace>
        登录
      </Link>
      
      {/* 新窗口打开 */}
      <Link href="/external" target="_blank" rel="noopener noreferrer">
        外部链接
      </Link>
      
      {/* 滚动控制 */}
      <Link href="/about#team" scroll={false}>
        团队介绍（不滚动到顶部）
      </Link>
      
      {/* 预加载控制 */}
      <Link href="/dashboard" prefetch={false}>
        仪表盘（不预加载）
      </Link>
    </nav>
  );
}
```

### 编程式导航

```typescript
// ============================================
// 使用 useRouter 进行编程式导航
// ============================================

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    
    try {
      // 执行登录逻辑
      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        // 登录成功，跳转到仪表盘
        router.push('/dashboard');
        // 或者替换当前页面
        // router.replace('/dashboard');
        
        // 刷新当前路由
        // router.refresh();
      }
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form action={handleLogin}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
```

### usePathname 和 useSearchParams

```typescript
// ============================================
// 获取当前路径和查询参数
// ============================================

'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export default function CurrentRoute() {
  const pathname = usePathname();  // 当前路径
  const searchParams = useSearchParams();  // 查询参数
  
  // 示例 URL: /products?category=electronics&sort=price
  // pathname = '/products'
  // searchParams.get('category') = 'electronics'
  // searchParams.get('sort') = 'price'
  
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  
  return (
    <div>
      <p>当前路径: {pathname}</p>
      <p>分类: {category}</p>
      <p>排序: {sort}</p>
    </div>
  );
}
```

---

## 下一步

恭喜你完成了 App Router 路由的学习！

接下来，我们将深入学习 [服务端组件](./03-server-components.md)，了解 Server Components 和 Client Components 的区别与使用场景。
