# Next.js 15 服务端组件

## 一、Server Components 概述

Server Components 是 React 18 引入的新特性，Next.js 15 默认所有组件都是 Server Components。

### 什么是 Server Components？

```typescript
// ============================================
// Server Components vs Client Components
// ============================================

// Server Components（服务端组件）
// - 在服务器上渲染
// - 不包含客户端 JavaScript
// - 可以直接访问后端资源（数据库、文件系统等）
// - 不能使用 React hooks（useState, useEffect 等）
// - 不能使用浏览器 API（window, localStorage 等）

// Client Components（客户端组件）
// - 在浏览器中渲染（也可以在服务器预渲染）
// - 包含客户端 JavaScript
// - 可以使用 React hooks
// - 可以使用浏览器 API
// - 需要使用 'use client' 指令声明
```

### 为什么默认使用 Server Components？

```typescript
// Server Components 的优势：

// 1. 性能更好
//    - JavaScript 包更小（不包含服务端代码）
//    - 首屏加载更快（HTML 直出）

// 2. 安全性更高
//    - 敏感代码不会暴露给客户端
//    - API 密钥、数据库连接等只在服务端

// 3. 开发体验更好
//    - 可以直接访问数据库
//    - 无需创建额外的 API 端点

// 4. SEO 更友好
//    - 搜索引擎可以直接抓取完整内容
//    - 无需等待 JavaScript 执行
```

---

## 二、Server Components

### 基本用法

```typescript
// ============================================
// app/products/page.tsx
// ============================================
// 默认就是 Server Component，无需任何声明

// Server Component 可以直接访问数据库
import { db } from '@/lib/db';

// Server Component 可以使用 async/await
export default async function ProductsPage() {
  // 直接查询数据库
  const products = await db.product.findMany();
  
  // 或者使用 fetch 获取数据
  // const response = await fetch('https://api.example.com/products');
  // const products = await response.json();
  
  return (
    <div>
      <h1>产品列表</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <span>¥{product.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 注意：
// 1. Server Component 必须是 async 函数才能使用 await
// 2. 可以直接导入服务端模块（数据库客户端等）
// 3. 这些代码不会被打包到客户端
```

### Server Component 的限制

```typescript
// ============================================
// Server Component 不能做的事情
// ============================================

// ❌ 错误：不能使用 React hooks
export default function ServerComponent() {
  const [count, setCount] = useState(0);  // 错误！
  const router = useRouter();              // 错误！
  
  return <div>{count}</div>;
}

// ❌ 错误：不能使用浏览器 API
export default function ServerComponent() {
  console.log(window.location);  // 错误！window 不存在
  localStorage.getItem('key');    // 错误！localStorage 不存在
  
  return <div>...</div>;
}

// ❌ 错误：不能使用事件处理函数
export default function ServerComponent() {
  const handleClick = () => {    // 这个函数会在服务端执行
    console.log('clicked');
  };
  
  return <button onClick={handleClick}>点击</button>;  // 不会工作
}

// ✅ 正确：Server Component 只负责渲染数据
export default async function ServerComponent() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </div>
  );
}
```

### 读取文件系统

```typescript
// ============================================
// app/blog/page.tsx
// ============================================
// Server Component 可以直接读取文件

import { readdir, readFile } from 'fs/promises';
import path from 'path';

export default async function BlogPage() {
  // 读取博客文章目录
  const postsDirectory = path.join(process.cwd(), 'content/posts');
  const filenames = await readdir(postsDirectory);
  
  // 读取所有文章内容
  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename);
      const content = await readFile(filePath, 'utf-8');
      
      return {
        slug: filename.replace('.md', ''),
        content,
      };
    })
  );
  
  return (
    <div>
      <h1>博客文章</h1>
      {posts.map((post) => (
        <article key={post.slug}>
          <h2>{post.slug}</h2>
          <pre>{post.content}</pre>
        </article>
      ))}
    </div>
  );
}
```

---

## 三、Client Components

### 使用 'use client' 指令

```typescript
// ============================================
// components/Counter.tsx
// ============================================
// 使用 'use client' 声明客户端组件

'use client';  // 必须在文件顶部

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}

// 'use client' 的作用：
// 1. 告诉 Next.js 这是一个客户端组件
// 2. 该组件会在客户端进行 hydration
// 3. 可以使用 React hooks 和浏览器 API
```

### 何时使用 Client Components

```typescript
// ============================================
// 需要使用 Client Components 的场景
// ============================================

// 1. 使用 React hooks
'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export function UseHooksExample() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}

// 2. 使用浏览器 API
'use client';
export function BrowserAPIExample() {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    setWidth(window.innerWidth);
    
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <p>窗口宽度: {width}px</p>;
}

// 3. 使用事件处理
'use client';
export function EventExample() {
  const handleClick = (e: React.MouseEvent) => {
    console.log('点击坐标:', e.clientX, e.clientY);
  };
  
  return <button onClick={handleClick}>点击我</button>;
}

// 4. 使用第三方交互库
'use client';
import { motion } from 'framer-motion';

export function AnimationExample() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      动画内容
    </motion.div>
  );
}

// 5. 使用 Context
'use client';
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

### Client Component 的边界

```typescript
// ============================================
// 'use client' 指令的作用范围
// ============================================

// 目录结构：
// app/
// ├── page.tsx           (Server Component)
// └── components/
//     ├── Counter.tsx    (Client Component - 有 'use client')
//     └── Card.tsx       (Server Component - 无 'use client')

// ============================================
// app/components/Counter.tsx
// ============================================
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      点击次数: {count}
    </button>
  );
}

// ============================================
// app/components/Card.tsx
// ============================================
// 没有 'use client'，所以是 Server Component

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold">{title}</h3>
      {children}
    </div>
  );
}

// ============================================
// app/page.tsx
// ============================================
// Server Component 可以导入 Client Component

import { Counter } from './components/Counter';
import { Card } from './components/Card';

export default function Page() {
  return (
    <div>
      <Card title="计数器示例">
        <Counter />  {/* Client Component */}
      </Card>
    </div>
  );
}
```

---

## 四、组合模式

### Server Component 导入 Client Component

```typescript
// ============================================
// 最常见的模式：Server Component 包裹 Client Component
// ============================================

// app/products/ProductsList.tsx (Client Component)
'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductsListProps {
  products: Product[];
}

export function ProductsList({ products }: ProductsListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  return (
    <div>
      <ul>
        {products.map((product) => (
          <li 
            key={product.id}
            onClick={() => setSelectedId(product.id)}
            className={selectedId === product.id ? 'bg-blue-100' : ''}
          >
            {product.name} - ¥{product.price}
          </li>
        ))}
      </ul>
      {selectedId && <p>已选择: {selectedId}</p>}
    </div>
  );
}

// app/products/page.tsx (Server Component)
import { ProductsList } from './ProductsList';
import { db } from '@/lib/db';

export default async function ProductsPage() {
  // Server Component 获取数据
  const products = await db.product.findMany();
  
  // 将数据传递给 Client Component
  return <ProductsList products={products} />;
}

// 这种模式的好处：
// 1. 数据获取在服务端完成（安全、快速）
// 2. 交互逻辑在客户端完成（响应式）
// 3. 最佳实践：尽可能在服务端获取数据
```

### 不能将函数从 Server 传到 Client

```typescript
// ============================================
// 错误示例：不能将服务端函数传递给客户端组件
// ============================================

// ❌ 错误！
// app/page.tsx
import { ClientComponent } from './ClientComponent';

async function fetchData() {
  // 服务端函数
  const data = await db.query();
  return data;
}

export default function Page() {
  return <ClientComponent onFetch={fetchData} />;  // 错误！
}

// app/ClientComponent.tsx
'use client';

interface Props {
  onFetch: () => Promise<Data>;  // 函数不能从服务端传递
}

export function ClientComponent({ onFetch }: Props) {
  // ...
}

// ============================================
// 正确做法：使用 Server Actions
// ============================================

// app/actions.ts
'use server';  // 声明为 Server Action

import { db } from '@/lib/db';

export async function fetchData() {
  const data = await db.query();
  return data;
}

// app/ClientComponent.tsx
'use client';

import { fetchData } from './actions';

export function ClientComponent() {
  const handleFetch = async () => {
    const data = await fetchData();  // 调用 Server Action
    console.log(data);
  };
  
  return <button onClick={handleFetch}>获取数据</button>;
}
```

### 传递序列化数据

```typescript
// ============================================
// Server Component 和 Client Component 之间传递的数据必须是可序列化的
// ============================================

// ✅ 可以传递的数据类型：
// - 字符串、数字、布尔值、null
// - 数组、对象（只包含可序列化值）
// - Date 对象
// - 函数（作为 Server Actions）

// ❌ 不能传递的数据类型：
// - 函数（普通函数）
// - Class 实例
// - Symbol
// - DOM 元素

// ============================================
// 正确示例
// ============================================

// app/page.tsx (Server Component)
import { UserCard } from './UserCard';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;  // Date 是可序列化的
}

export default async function Page() {
  const users: User[] = await db.user.findMany();
  
  // ✅ 正确：传递可序列化的数据
  return <UserCard users={users} />;
}

// app/UserCard.tsx (Client Component)
'use client';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UserCardProps {
  users: User[];
}

export function UserCard({ users }: UserCardProps) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} - {user.email}
          <br />
          注册时间: {user.createdAt.toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
}
```

### 条件渲染 Client Component

```typescript
// ============================================
// 根据条件渲染不同的 Client Component
// ============================================

// app/page.tsx (Server Component)
import { LoginForm } from './LoginForm';
import { Dashboard } from './Dashboard';
import { getSession } from '@/lib/auth';

export default async function Page() {
  const session = await getSession();
  
  // 根据登录状态渲染不同的组件
  if (!session) {
    return <LoginForm />;
  }
  
  return <Dashboard user={session.user} />;
}

// app/LoginForm.tsx (Client Component)
'use client';

import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 登录逻辑
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">登录</button>
    </form>
  );
}

// app/Dashboard.tsx (Client Component)
'use client';

interface DashboardProps {
  user: { id: string; name: string };
}

export function Dashboard({ user }: DashboardProps) {
  return (
    <div>
      <h1>欢迎回来, {user.name}</h1>
      {/* Dashboard 内容 */}
    </div>
  );
}
```

---

## 五、最佳实践

### 1. 尽可能使用 Server Components

```typescript
// ============================================
// 推荐模式
// ============================================

// ✅ 推荐：数据获取在 Server Component
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await fetchProducts();  // 服务端获取
  
  return <ProductGrid products={products} />;
}

// ❌ 不推荐：数据获取在 Client Component
// app/products/page.tsx
'use client';
import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);
  
  return <ProductGrid products={products} />;
}

// Server Component 获取数据的优势：
// 1. 更快的首屏加载
// 2. 更好的 SEO
// 3. 可以直接访问数据库
// 4. 减少 API 调用
```

### 2. 将 Client Components 放在叶子节点

```typescript
// ============================================
// 组件树结构优化
// ============================================

// ❌ 不推荐：整个页面都是 Client Component
// app/page.tsx
'use client';

export default function Page() {
  const [state, setState] = useState();
  
  return (
    <div>
      <Header />      {/* 不需要交互 */}
      <MainContent /> {/* 需要交互 */
      <Footer />      {/* 不需要交互 */}
    </div>
  );
}

// ✅ 推荐：只有需要交互的部分是 Client Component
// app/page.tsx (Server Component)
import { Header } from './Header';
import { MainContent } from './MainContent';
import { Footer } from './Footer';

export default function Page() {
  return (
    <div>
      <Header />      {/* Server Component */}
      <MainContent /> {/* Client Component */}
      <Footer />      {/* Server Component */}
    </div>
  );
}

// app/MainContent.tsx (Client Component)
'use client';

export function MainContent() {
  const [state, setState] = useState();
  
  return <div>...</div>;
}
```

### 3. 使用 Server Actions 处理表单

```typescript
// ============================================
// 表单处理最佳实践
// ============================================

// app/actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';

// 定义验证 schema
const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function submitContact(formData: FormData) {
  // 验证数据
  const data = contactSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });
  
  // 保存到数据库
  await db.contact.create({
    data,
  });
  
  return { success: true };
}

// app/contact/page.tsx
import { submitContact } from './actions';

export default function ContactPage() {
  return (
    <form action={submitContact}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 4. 共享组件策略

```typescript
// ============================================
// 组件目录结构
// ============================================

// 推荐的目录结构：
// app/
// ├── components/
// │   ├── ui/              # UI 组件（通常是 Client Components）
// │   │   ├── Button.tsx
// │   │   ├── Input.tsx
// │   │   └── Modal.tsx
// │   └── layout/          # 布局组件（通常是 Server Components）
// │       ├── Header.tsx
// │       ├── Footer.tsx
// │       └── Sidebar.tsx
// └── (routes)/
//     └── page.tsx

// ============================================
// 共享 UI 组件示例
// ============================================

// app/components/ui/Button.tsx
// 这个组件不需要 'use client'，因为它只是展示组件
// 但如果需要处理点击事件，就需要添加 'use client'

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-medium';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 如果 Button 需要被 Server Component 使用，且不需要交互：
// - 移除 onClick prop
// - 不需要 'use client'

// 如果 Button 需要交互：
// - 添加 'use client'
// - 可以在 Server Component 中导入使用
```

---

## 六、常见问题

### Q1: 如何判断组件应该是 Server 还是 Client Component？

```typescript
// 决策流程：

// 1. 组件需要使用 hooks 吗？
//    是 → Client Component

// 2. 组件需要使用浏览器 API 吗？
//    是 → Client Component

// 3. 组件需要事件处理吗？
//    是 → Client Component

// 4. 组件需要访问后端资源吗？
//    是 → Server Component

// 5. 组件只是展示数据吗？
//    是 → Server Component（默认）

// 简单规则：默认使用 Server Component，只有在需要交互时才使用 Client Component
```

### Q2: 为什么我的 Server Component 报错了？

```typescript
// 常见错误：

// 错误 1：在 Server Component 中使用了 hooks
// 解决：将组件改为 Client Component（添加 'use client'）

// 错误 2：在 Server Component 中使用了 window
// 解决：将相关逻辑移到 Client Component

// 错误 3：将函数作为 props 传递给 Client Component
// 解决：使用 Server Actions 或将逻辑移到 Client Component

// 错误 4：导入了仅客户端的库
// 解决：使用动态导入 { ssr: false } 或将组件改为 Client Component
```

### Q3: 如何调试 Server Components？

```typescript
// Server Components 的调试方法：

// 1. 使用 console.log（输出在服务器终端）
export default async function Page() {
  console.log('服务端日志');  // 查看 npm run dev 的终端输出
  return <div>...</div>;
}

// 2. 使用调试器
// 在 VS Code 中设置断点，使用 Node.js 调试器

// 3. 检查网络请求
// 在浏览器开发者工具中查看 HTML 响应
```

---

## 下一步

恭喜你完成了服务端组件的学习！

接下来，我们将深入学习 [数据获取](./04-data-fetching.md)，了解 Next.js 15 中的数据获取和缓存策略。
