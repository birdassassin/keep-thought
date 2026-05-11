# Next.js 15 基础概念

## 一、什么是 Next.js？

Next.js 是一个基于 React 的全栈 Web 开发框架，由 Vercel 公司开发和维护。

### 为什么选择 Next.js？

```typescript
// 传统 React SPA（单页应用）的问题：
// 1. 首屏加载慢 - 需要下载所有 JS 后才能渲染
// 2. SEO 不友好 - 搜索引擎爬虫难以抓取内容
// 3. 性能问题 - 大型应用打包体积大

// Next.js 解决了这些问题：
// 1. 服务端渲染（SSR）- 首屏直出，加载快
// 2. 静态生成（SSG）- 构建时生成静态页面
// 3. 自动代码分割 - 按需加载，减小体积
// 4. 内置优化 - 图片、字体、脚本自动优化
```

---

## 二、创建项目

### 使用 create-next-app 创建项目

```bash
# 交互式创建项目（会有提示选项）
npx create-next-app@latest my-app

# 推荐命令（直接指定选项，跳过交互）
npx create-next-app@latest my-app \
  --typescript \    # 使用 TypeScript
  --tailwind \      # 使用 Tailwind CSS
  --eslint \        # 启用 ESLint
  --app \           # 使用 App Router（推荐）
  --src-dir \       # 使用 src 目录
  --import-alias "@/*"  # 设置导入别名
  --turbopack       # 使用 Turbopack（更快的开发服务器）
```

### 创建选项说明

```typescript
// 项目创建时的选项解释：

// 1. TypeScript - 是否使用 TypeScript
//    推荐：是
//    原因：类型安全，更好的开发体验

// 2. ESLint - 是否启用 ESLint
//    推荐：是
//    原因：代码规范，避免常见错误

// 3. Tailwind CSS - 是否使用 Tailwind
//    推荐：是
//    原因：快速开发，无需写单独的 CSS 文件

// 4. `src/` directory - 是否使用 src 目录
//    推荐：是
//    原因：项目结构更清晰，根目录更整洁

// 5. App Router - 是否使用 App Router
//    推荐：是（Next.js 15 默认）
//    原因：新特性，更好的开发体验

// 6. Turbopack - 是否使用 Turbopack
//    推荐：是
//    原因：比 Webpack 快 700 倍
```

---

## 三、项目目录结构

### 标准目录结构

```
my-app/
├── node_modules/        # 依赖包
├── public/              # 静态资源目录
│   ├── favicon.ico      # 网站图标
│   └── images/          # 图片资源
├── src/                 # 源代码目录
│   └── app/             # App Router 核心目录
│       ├── favicon.ico
│       ├── globals.css  # 全局样式
│       ├── layout.tsx   # 根布局组件
│       ├── page.tsx     # 首页组件
│       └── ...          # 其他页面和路由
├── .eslintrc.json       # ESLint 配置
├── .gitignore           # Git 忽略文件
├── next.config.ts       # Next.js 配置
├── package.json         # 项目依赖
├── postcss.config.mjs   # PostCSS 配置
├── README.md            # 项目说明
├── tailwind.config.ts   # Tailwind 配置
└── tsconfig.json        # TypeScript 配置
```

### 关键文件详解

```typescript
// ============================================
// src/app/layout.tsx - 根布局组件
// ============================================
// 这是所有页面的公共布局，必须包含 <html> 和 <body> 标签

import type { Metadata } from "next";
import "./globals.css";

// 元数据配置 - 用于 SEO
export const metadata: Metadata = {
  title: "我的 Next.js 应用",
  description: "这是一个 Next.js 15 教程示例",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {/* children 会被替换为具体的页面内容 */}
        {children}
      </body>
    </html>
  );
}

// 注意：
// 1. layout.tsx 是必需的，每个 app 目录下都可以有
// 2. 根布局必须包含 <html> 和 <body>
// 3. 子布局不需要这些标签
// 4. 布局可以嵌套，形成层级结构
```

```typescript
// ============================================
// src/app/page.tsx - 首页组件
// ============================================
// 访问 "/" 路径时显示的页面

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">
        欢迎来到 Next.js 15！
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        这是你的第一个 Next.js 页面
      </p>
    </main>
  );
}

// 注意：
// 1. page.tsx 是路由页面组件
// 2. 默认导出一个 React 组件
// 3. 组件名可以自定义，但推荐使用语义化命名
// 4. Next.js 15 中，组件默认是 Server Component
```

```typescript
// ============================================
// next.config.ts - Next.js 配置文件
// ============================================

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 配置选项 */
};

export default nextConfig;

// 常用配置示例：
const nextConfig: NextConfig = {
  // 输出模式：'standalone' 适合 Docker 部署
  output: 'standalone',
  
  // 图片优化配置
  images: {
    // 允许的图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  
  // 自定义环境变量前缀
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // 严格模式（推荐开启）
  reactStrictMode: true,
};
```

---

## 四、第一个页面

### 创建简单的首页

```typescript
// src/app/page.tsx
// 这是一个完整的首页示例，展示了常用功能

// 导入类型（用于类型提示）
import type { Metadata } from "next";

// 页面级元数据（会覆盖 layout 中的配置）
export const metadata: Metadata = {
  title: "首页 - 我的 Next.js 应用",
  description: "这是首页描述",
};

// 页面组件
// 注意：这是 Server Component，可以直接访问数据库、文件系统等
export default function Home() {
  // Server Component 中可以直接写服务端代码
  // 例如：读取文件、访问数据库、调用私有 API
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* 头部区域 */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Logo</h1>
          <ul className="flex gap-6">
            <li><a href="/" className="text-white hover:text-blue-400">首页</a></li>
            <li><a href="/about" className="text-white hover:text-blue-400">关于</a></li>
            <li><a href="/contact" className="text-white hover:text-blue-400">联系</a></li>
          </ul>
        </nav>
      </header>

      {/* 主要内容区域 */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          欢迎来到 Next.js 15
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          构建现代化 Web 应用的最佳选择
        </p>
        
        {/* 按钮组件 */}
        <div className="flex gap-4 justify-center">
          <a 
            href="/docs" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            开始学习
          </a>
          <a 
            href="https://nextjs.org/docs" 
            className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            官方文档
          </a>
        </div>
      </section>

      {/* 特性展示区域 */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 特性卡片 1 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">服务端渲染</h3>
            <p className="text-gray-400">
              默认服务端渲染，首屏加载快，SEO 友好
            </p>
          </div>
          
          {/* 特性卡片 2 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">文件系统路由</h3>
            <p className="text-gray-400">
              基于文件结构自动生成路由，无需手动配置
            </p>
          </div>
          
          {/* 特性卡片 3 */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">API 路由</h3>
            <p className="text-gray-400">
              内置 API 路由，轻松构建全栈应用
            </p>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-700">
        <p className="text-center text-gray-400">
          © 2024 我的 Next.js 应用. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
```

### 启动开发服务器

```bash
# 在项目根目录执行
npm run dev

# 输出示例：
#   ▲ Next.js 15.0.0
#   - Local:        http://localhost:3000
#   - Environments: .env.local
# 
# ✓ Starting...
# ✓ Ready in 2.3s

# 打开浏览器访问 http://localhost:3000 即可看到页面
```

---

## 五、常用命令

```bash
# 开发模式 - 启动开发服务器，支持热重载
npm run dev

# 构建生产版本 - 优化、压缩、生成静态页面
npm run build

# 启动生产服务器 - 需要先 build
npm run start

# 代码检查 - 运行 ESLint
npm run lint

# 类型检查 - 运行 TypeScript 编译检查
npx tsc --noEmit
```

---

## 六、开发技巧

### 1. 使用 TypeScript 类型

```typescript
// 为页面 props 定义类型
interface PageProps {
  params: Promise<{ id: string }>;      // 动态路由参数
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;  // 查询参数
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { color } = await searchParams;
  
  return (
    <div>
      <h1>产品 ID: {id}</h1>
      <p>颜色: {color}</p>
    </div>
  );
}
```

### 2. 环境变量

```bash
# .env.local 文件（不会提交到 Git）

# 公共变量（以 NEXT_PUBLIC_ 开头，可在客户端访问）
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=我的应用

# 私有变量（只能在服务端访问）
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
SECRET_KEY=your-secret-key
```

```typescript
// 使用环境变量

// 服务端组件中（可以访问所有变量）
const dbUrl = process.env.DATABASE_URL;

// 客户端组件中（只能访问 NEXT_PUBLIC_ 开头的变量）
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### 3. 导入别名

```typescript
// tsconfig.json 中配置的路径别名
// "importAlias": "@/*"

// 不使用别名（相对路径）
import Button from '../../components/Button';
import { formatDate } from '../../../utils/date';

// 使用别名（推荐）
import Button from '@/components/Button';
import { formatDate } from '@/utils/date';

// 好处：
// 1. 路径更简洁
// 2. 移动文件时不需要修改导入路径
// 3. 更容易理解文件位置
```

---

## 七、常见问题

### Q1: 页面修改后没有更新？

```bash
# 清除缓存并重新构建
rm -rf .next
npm run dev
```

### Q2: 如何添加全局样式？

```typescript
// 在 src/app/globals.css 中添加全局样式
// 或者在 layout.tsx 中导入其他 CSS 文件

import './globals.css';
import '../styles/custom.css';
```

### Q3: 如何调试？

```typescript
// 1. 使用 console.log
console.log('调试信息:', data);

// 2. 使用 React Developer Tools 浏览器扩展

// 3. 使用 VS Code 调试器
// 创建 .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

---

## 下一步

恭喜你完成了 Next.js 15 基础概念的学习！

接下来，我们将深入学习 [App Router 路由系统](./02-app-router.md)，了解如何使用文件系统构建强大的路由功能。
