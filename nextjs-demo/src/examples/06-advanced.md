# Next.js 15 高级用法

## 一、中间件

### 什么是中间件？

```typescript
// ============================================
// 中间件是在请求到达页面之前运行的代码
// ============================================

// 中间件的用途：
// 1. 身份验证检查
// 2. 重定向
// 3. 重写 URL
// 4. 日志记录
// 5. A/B 测试
// 6. 地理位置路由

// 中间件运行时机：
// 请求 → 中间件 → 页面/API Route
```

### 基本用法

```typescript
// ============================================
// middleware.ts - 在项目根目录创建
// ============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 获取请求路径
  const path = request.nextUrl.pathname;
  
  // 记录请求
  console.log(`请求路径: ${path}`);
  
  // 继续处理请求
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 匹配所有路径，除了静态文件
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 身份验证中间件

```typescript
// ============================================
// 保护需要登录的路由
// ============================================

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否有 session token
  const token = request.cookies.get('session')?.value;
  
  // 需要登录的路径
  const protectedPaths = ['/dashboard', '/profile', '/settings'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // 如果是受保护路径且未登录，重定向到登录页
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    // 保存原始 URL，登录后可以跳转回来
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 已登录用户访问登录页，重定向到仪表盘
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*', '/login'],
};
```

### 重写 URL

```typescript
// ============================================
// 隐藏真实路径，实现 URL 别名
// ============================================

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 示例：将 /blog/post-123 重写为 /posts/123
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '');
    
    // 重写 URL（用户看到的 URL 不变，但实际访问的是另一个路径）
    const rewriteUrl = new URL(`/posts/${slug}`, request.url);
    return NextResponse.rewrite(rewriteUrl);
  }
  
  // 示例：根据地理位置重写
  const country = request.geo?.country || 'US';
  
  if (pathname === '/') {
    // 不同国家显示不同内容
    const rewriteUrl = new URL(`/${country.toLowerCase()}`, request.url);
    return NextResponse.rewrite(rewriteUrl);
  }
  
  return NextResponse.next();
}
```

### 设置请求头

```typescript
// ============================================
// 在中间件中添加自定义请求头
// ============================================

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 创建响应
  const response = NextResponse.next();
  
  // 设置自定义请求头（可以在页面中读取）
  response.headers.set('x-request-id', crypto.randomUUID());
  response.headers.set('x-request-time', new Date().toISOString());
  
  // 设置 CORS 头
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  return response;
}

// 在页面中读取请求头
// app/api/route.ts
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  const requestId = headersList.get('x-request-id');
  
  return Response.json({ requestId });
}
```

---

## 二、API Routes

### 基本用法

```typescript
// ============================================
// app/api/route.ts - API 路由
// ============================================

import { NextResponse } from 'next/server';

// GET 请求
export async function GET(request: Request) {
  const data = { message: 'Hello, World!' };
  
  return NextResponse.json(data);
}

// POST 请求
export async function POST(request: Request) {
  const body = await request.json();
  
  // 处理数据
  const result = await processData(body);
  
  return NextResponse.json(result, { status: 201 });
}

// PUT 请求
export async function PUT(request: Request) {
  const body = await request.json();
  
  return NextResponse.json({ updated: true });
}

// DELETE 请求
export async function DELETE(request: Request) {
  return NextResponse.json({ deleted: true });
}

// 访问方式：
// GET  /api/hello
// POST /api/hello
// PUT  /api/hello
// DELETE /api/hello
```

### 动态路由

```typescript
// ============================================
// app/api/users/[id]/route.ts
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/users/:id
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  
  const user = await db.user.findUnique({
    where: { id },
  });
  
  if (!user) {
    return NextResponse.json(
      { error: '用户不存在' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(user);
}

// PUT /api/users/:id
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  
  const user = await db.user.update({
    where: { id },
    data: body,
  });
  
  return NextResponse.json(user);
}

// DELETE /api/users/:id
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  
  await db.user.delete({ where: { id } });
  
  return new NextResponse(null, { status: 204 });
}
```

### 查询参数处理

```typescript
// ============================================
// app/api/search/route.ts
// ============================================

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 获取查询参数
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const tags = searchParams.getAll('tag');  // 获取多个同名参数
  
  // 搜索逻辑
  const results = await searchItems({ q, page, limit, tags });
  
  return NextResponse.json({
    results,
    pagination: {
      page,
      limit,
      total: results.total,
    },
  });
}

// 访问示例：
// /api/search?q=nextjs&page=1&limit=20&tag=react&tag=typescript
```

### 请求头和 Cookies

```typescript
// ============================================
// app/api/auth/route.ts
// ============================================

import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';

export async function GET(request: Request) {
  // 获取请求头
  const headersList = await headers();
  const authorization = headersList.get('authorization');
  const userAgent = headersList.get('user-agent');
  
  // 获取 Cookies
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  
  // 验证身份
  if (!sessionToken) {
    return NextResponse.json(
      { error: '未授权' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({ message: '已授权' });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // 设置 Cookie
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('session', 'token-value', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,  // 7 天
    path: '/',
  });
  
  return response;
}
```

### 流式响应

```typescript
// ============================================
// app/api/stream/route.ts
// ============================================

import { NextResponse } from 'next/server';

// 流式响应（适合大文件或实时数据）
export async function GET() {
  // 创建一个 TransformStream
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // 异步发送数据
  (async () => {
    for (let i = 0; i < 10; i++) {
      await writer.write(encoder.encode(`数据 ${i}\n`));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await writer.close();
  })();
  
  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}

// SSE (Server-Sent Events) 示例
export async function GET_SSE() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // 发送事件
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      // 定时发送数据
      const interval = setInterval(() => {
        sendEvent({ time: new Date().toISOString() });
      }, 1000);
      
      // 10 秒后停止
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 10000);
    },
  });
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

## 三、SEO 优化

### 元数据配置

```typescript
// ============================================
// 静态元数据
// ============================================

// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  // 基本元数据
  title: '我的网站',
  description: '网站描述',
  keywords: ['Next.js', 'React', 'TypeScript'],
  
  // 作者和版权
  authors: [{ name: '作者名' }],
  creator: '创建者',
  publisher: '发布者',
  
  // URL 配置
  metadataBase: new URL('https://example.com'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/zh-CN',
      'en-US': '/en-US',
    },
  },
  
  // Open Graph（社交分享）
  openGraph: {
    title: '我的网站',
    description: '网站描述',
    url: 'https://example.com',
    siteName: '网站名称',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '图片描述',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  
  // Twitter 卡片
  twitter: {
    card: 'summary_large_image',
    title: '我的网站',
    description: '网站描述',
    images: ['/twitter-image.png'],
    creator: '@twitter_handle',
  },
  
  // 其他元数据
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // 图标
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  // manifest（PWA）
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN">{children}</html>;
}
```

### 动态元数据

```typescript
// ============================================
// app/blog/[id]/page.tsx
// ============================================

import type { Metadata, ResolvingMetadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 动态生成元数据
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  
  // 获取文章数据
  const post = await fetch(`/api/posts/${id}`).then(r => r.json());
  
  // 获取父级元数据
  const previousImages = (await parent).openGraph?.images || [];
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage, ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await fetch(`/api/posts/${id}`).then(r => r.json());
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### Sitemap 和 Robots

```typescript
// ============================================
// app/sitemap.ts - 动态生成 sitemap
// ============================================

import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 获取动态路由
  const posts = await fetch('/api/posts').then(r => r.json());
  
  // 文章页面
  const postUrls = posts.map((post: any) => ({
    url: `https://example.com/blog/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // 静态页面
  const staticUrls = [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://example.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];
  
  return [...staticUrls, ...postUrls];
}

// ============================================
// app/robots.ts - 生成 robots.txt
// ============================================

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

### 结构化数据

```typescript
// ============================================
// 添加 JSON-LD 结构化数据
// ============================================

// app/blog/[id]/page.tsx
export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await fetch(`/api/posts/${id}`).then(r => r.json());
  
  // 结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: '我的网站',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    },
  };
  
  return (
    <>
      {/* 添加 JSON-LD 脚本 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </>
  );
}
```

---

## 四、性能优化

### 图片优化

```typescript
// ============================================
// 使用 Next.js Image 组件
// ============================================

import Image from 'next/image';

export function OptimizedImage() {
  return (
    <div>
      {/* 静态图片 */}
      <Image
        src="/hero.png"
        alt="Hero image"
        width={1200}
        height={630}
        priority  // 预加载
      />
      
      {/* 远程图片 */}
      <Image
        src="https://example.com/image.jpg"
        alt="Remote image"
        width={800}
        height={600}
        // 懒加载（默认）
        loading="lazy"
        // 模糊占位符
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />
      
      {/* 响应式图片 */}
      <Image
        src="/responsive.jpg"
        alt="Responsive image"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}

// next.config.ts - 配置远程图片域名
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};
```

### 字体优化

```typescript
// ============================================
// 使用 next/font 优化字体加载
// ============================================

// app/layout.tsx
import { Inter, Noto_Sans_SC } from 'next/font/google';

// 配置 Google 字体
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // 字体加载策略
  variable: '--font-inter',  // CSS 变量
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}

// 使用本地字体
import localFont from 'next/font/local';

const myFont = localFont({
  src: [
    {
      path: './fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-my-font',
});
```

### 脚本优化

```typescript
// ============================================
// 使用 next/script 优化脚本加载
// ============================================

import Script from 'next/script';

export function Analytics() {
  return (
    <>
      {/* 页面交互后加载 */}
      <Script
        src="https://example.com/analytics.js"
        strategy="lazyOnload"
      />
      
      {/* 页面空闲时加载 */}
      <Script
        src="https://example.com/widget.js"
        strategy="afterInteractive"
      />
      
      {/* 阻塞加载（谨慎使用） */}
      <Script
        src="https://example.com/critical.js"
        strategy="beforeInteractive"
      />
      
      {/* 内联脚本 */}
      <Script id="inline-script">
        {`console.log('Inline script');`}
      </Script>
    </>
  );
}
```

### 代码分割和懒加载

```typescript
// ============================================
// 动态导入组件
// ============================================

import dynamic from 'next/dynamic';

// 动态导入（代码分割）
const DynamicChart = dynamic(() => import('@/components/Chart'), {
  loading: () => <p>加载中...</p>,
  ssr: false,  // 禁用服务端渲染
});

// 动态导入模态框
const DynamicModal = dynamic(() => import('@/components/Modal'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-200" />,
});

export default function Dashboard() {
  return (
    <div>
      <h1>仪表盘</h1>
      
      {/* 图表组件懒加载 */}
      <DynamicChart />
      
      {/* 模态框按需加载 */}
      <DynamicModal />
    </div>
  );
}

// 使用 React.lazy（客户端组件）
'use client';

import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

export function ClientComponent() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 缓存策略

```typescript
// ============================================
// 合理使用缓存
// ============================================

// 静态数据 - 永久缓存
export async function getStaticData() {
  return fetch('/api/static', { cache: 'force-cache' });
}

// 动态数据 - 定期更新
export async function getDynamicData() {
  return fetch('/api/dynamic', {
    next: { revalidate: 3600 },  // 1 小时
  });
}

// 实时数据 - 不缓存
export async function getRealtimeData() {
  return fetch('/api/realtime', { cache: 'no-store' });
}

// 使用 unstable_cache 缓存函数结果
import { unstable_cache } from 'next/cache';

export const getCachedPosts = unstable_cache(
  async () => {
    return db.post.findMany();
  },
  ['posts'],
  { revalidate: 3600, tags: ['posts'] }
);
```

---

## 五、部署

### 构建和部署

```bash
# 构建生产版本
npm run build

# 输出示例：
# Route (app)                              Size     First Load JS
# ┌ ○ /                                    5.2 kB         89 kB
# ├ ○ /about                               2.1 kB         86 kB
# └ ○ /blog                                3.5 kB         87 kB

# 本地预览生产版本
npm run start

# 导出静态站点
# next.config.ts
const nextConfig = {
  output: 'export',
};
```

### Docker 部署

```dockerfile
# Dockerfile
# 阶段 1：安装依赖
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 阶段 2：构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 阶段 3：运行
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### 环境变量

```typescript
// .env.local（开发环境）
DATABASE_URL=postgresql://localhost:5432/mydb
NEXT_PUBLIC_API_URL=https://api.example.com

// .env.production（生产环境）
DATABASE_URL=postgresql://prod-db:5432/mydb
NEXT_PUBLIC_API_URL=https://api.production.com

// 使用环境变量
const dbUrl = process.env.DATABASE_URL;  // 服务端
const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // 客户端
```

---

## 总结

恭喜你完成了 Next.js 15 高级用法的学习！

### 你已经掌握了：

1. **中间件** - 请求拦截、身份验证、URL 重写
2. **API Routes** - RESTful API、流式响应、错误处理
3. **SEO 优化** - 元数据、Sitemap、结构化数据
4. **性能优化** - 图片、字体、脚本、代码分割
5. **部署** - 构建、Docker、环境变量

### 下一步学习建议：

1. 实践项目：构建一个完整的全栈应用
2. 深入学习：React Server Components 原理
3. 探索生态：Prisma、NextAuth.js、Tailwind CSS
4. 关注更新：Next.js 官方博客和更新日志

祝你学习愉快！
