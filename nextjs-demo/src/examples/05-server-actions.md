# Next.js 15 Server Actions

## 一、Server Actions 概述

Server Actions 是 Next.js 13 引入的特性，允许在服务端直接执行函数，无需手动创建 API 路由。

### 什么是 Server Actions？

```typescript
// ============================================
// Server Actions 是在服务端执行的异步函数
// ============================================

// 传统方式：需要创建 API 路由
// 1. 创建 API 路由 /api/users
// 2. 客户端调用 fetch('/api/users', { method: 'POST', body: ... })
// 3. API 路由处理请求

// Server Actions 方式：直接在服务端执行
// 1. 创建 async function 并标记 'use server'
// 2. 客户端直接调用该函数
// 3. 函数在服务端执行

// 优势：
// - 更少的代码
// - 类型安全（TypeScript）
// - 自动处理表单提交
// - 无需手动序列化/反序列化
```

---

## 二、基本用法

### 定义 Server Action

```typescript
// ============================================
// 方式 1：在单独文件中定义（推荐）
// ============================================

// app/actions.ts
'use server';  // 必须在文件顶部声明

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 创建用户
export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  // 直接操作数据库
  const user = await db.user.create({
    data: { name, email },
  });
  
  // 重新验证缓存
  revalidatePath('/users');
  
  return user;
}

// 删除用户
export async function deleteUser(id: string) {
  await db.user.delete({ where: { id } });
  revalidatePath('/users');
}

// 更新用户
export async function updateUser(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  const user = await db.user.update({
    where: { id },
    data: { name, email },
  });
  
  revalidatePath('/users');
  revalidatePath(`/users/${id}`);
  
  return user;
}

// 注意：
// 1. 'use server' 必须在文件最顶部
// 2. 导出的函数必须是 async
// 3. 函数会在服务端执行
```

```typescript
// ============================================
// 方式 2：在组件内部定义
// ============================================

// app/users/page.tsx
import { revalidatePath } from 'next/cache';

export default function UsersPage() {
  // 在组件内部定义 Server Action
  async function createUser(formData: FormData) {
    'use server';  // 必须在函数内部声明
    
    const name = formData.get('name') as string;
    // ... 处理逻辑
    
    revalidatePath('/users');
  }
  
  return (
    <form action={createUser}>
      <input name="name" required />
      <button type="submit">创建</button>
    </form>
  );
}

// 注意：
// 这种方式适合简单的操作
// 复杂操作建议放在单独文件中
```

---

## 三、表单处理

### 基本表单

```typescript
// ============================================
// 使用 Server Action 处理表单提交
// ============================================

// app/contact/actions.ts
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

// 定义验证规则
const contactSchema = z.object({
  name: z.string().min(2, '姓名至少 2 个字符'),
  email: z.string().email('请输入有效的邮箱'),
  message: z.string().min(10, '消息至少 10 个字符'),
});

export async function submitContact(formData: FormData) {
  // 解析表单数据
  const data = contactSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });
  
  // 保存到数据库
  await db.contact.create({
    data,
  });
  
  // 发送邮件通知
  await sendEmail({
    to: 'admin@example.com',
    subject: `新消息来自 ${data.name}`,
    body: data.message,
  });
  
  // 重定向到成功页面
  redirect('/contact/success');
}

// app/contact/page.tsx
import { submitContact } from './actions';

export default function ContactPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">联系我们</h1>
      
      {/* 使用 action 属性绑定 Server Action */}
      <form action={submitContact} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">姓名</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block mb-1">邮箱</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block mb-1">消息</label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          提交
        </button>
      </form>
    </div>
  );
}

// 特点：
// 1. 表单提交时自动调用 Server Action
// 2. 即使 JavaScript 被禁用也能工作
// 3. 自动处理表单数据解析
```

### 表单状态管理

```typescript
// ============================================
// 使用 useFormState 和 useFormStatus
// ============================================

// app/posts/actions.ts
'use server';

import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
});

// 返回类型
export type State = {
  errors?: {
    title?: string[];
    content?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createPost(
  prevState: State | undefined,
  formData: FormData
): Promise<State> {
  // 验证数据
  const validatedFields = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });
  
  // 验证失败
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '验证失败，请检查输入',
    };
  }
  
  try {
    // 创建文章
    await db.post.create({
      data: validatedFields.data,
    });
    
    revalidatePath('/posts');
    
    return {
      success: true,
      message: '文章创建成功！',
    };
  } catch (error) {
    return {
      message: '创建失败，请稍后重试',
    };
  }
}

// app/posts/create/page.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createPost } from './actions';

// 提交按钮组件
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
    >
      {pending ? '提交中...' : '发布文章'}
    </button>
  );
}

export default function CreatePostPage() {
  // useFormState 用于管理表单状态
  const [state, formAction] = useFormState(createPost, undefined);
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">创建文章</h1>
      
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">标题</label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full px-3 py-2 border rounded"
            aria-describedby="title-error"
          />
          {state?.errors?.title && (
            <p id="title-error" className="text-red-500 text-sm mt-1">
              {state.errors.title.join(', ')}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="content" className="block mb-1">内容</label>
          <textarea
            id="content"
            name="content"
            rows={4}
            className="w-full px-3 py-2 border rounded"
            aria-describedby="content-error"
          />
          {state?.errors?.content && (
            <p id="content-error" className="text-red-500 text-sm mt-1">
              {state.errors.content.join(', ')}
            </p>
          )}
        </div>
        
        <SubmitButton />
        
        {state?.message && (
          <p className={state.success ? 'text-green-500' : 'text-red-500'}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
```

---

## 四、数据变更

### CRUD 操作

```typescript
// ============================================
// 完整的 CRUD 示例
// ============================================

// app/todos/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// 获取当前用户
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('未授权');
  }
  return session.user;
}

// 创建 Todo
export async function createTodo(formData: FormData) {
  const user = await getCurrentUser();
  
  const title = formData.get('title') as string;
  
  await db.todo.create({
    data: {
      title,
      userId: user.id,
    },
  });
  
  revalidatePath('/todos');
}

// 更新 Todo
export async function updateTodo(id: string, formData: FormData) {
  const user = await getCurrentUser();
  
  const title = formData.get('title') as string;
  const completed = formData.get('completed') === 'true';
  
  await db.todo.update({
    where: { id, userId: user.id },
    data: { title, completed },
  });
  
  revalidatePath('/todos');
}

// 切换完成状态
export async function toggleTodo(id: string) {
  const user = await getCurrentUser();
  
  const todo = await db.todo.findUnique({
    where: { id, userId: user.id },
  });
  
  if (!todo) {
    throw new Error('Todo 不存在');
  }
  
  await db.todo.update({
    where: { id },
    data: { completed: !todo.completed },
  });
  
  revalidatePath('/todos');
}

// 删除 Todo
export async function deleteTodo(id: string) {
  const user = await getCurrentUser();
  
  await db.todo.delete({
    where: { id, userId: user.id },
  });
  
  revalidatePath('/todos');
}
```

### 在组件中使用

```typescript
// ============================================
// app/todos/page.tsx
// ============================================

import { db } from '@/lib/db';
import { createTodo, toggleTodo, deleteTodo } from './actions';
import { TodoItem } from './TodoItem';

export default async function TodosPage() {
  // 获取 Todo 列表
  const todos = await db.todo.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">待办事项</h1>
      
      {/* 创建表单 */}
      <form action={createTodo} className="flex gap-2 mb-6">
        <input
          name="title"
          type="text"
          placeholder="添加新待办..."
          required
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          添加
        </button>
      </form>
      
      {/* Todo 列表 */}
      <ul className="space-y-2">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}

// app/todos/TodoItem.tsx
'use client';

import { toggleTodo, deleteTodo } from './actions';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <li className="flex items-center gap-2 p-2 border rounded">
      {/* 切换完成状态 */}
      <form action={() => toggleTodo(todo.id)}>
        <button
          type="submit"
          className={`w-5 h-5 rounded border ${
            todo.completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300'
          }`}
        >
          {todo.completed && '✓'}
        </button>
      </form>
      
      {/* 标题 */}
      <span className={todo.completed ? 'line-through text-gray-400' : ''}>
        {todo.title}
      </span>
      
      {/* 删除按钮 */}
      <form action={() => deleteTodo(todo.id)} className="ml-auto">
        <button
          type="submit"
          className="text-red-500 hover:text-red-700"
        >
          删除
        </button>
      </form>
    </li>
  );
}
```

---

## 五、乐观更新

### 使用 useOptimistic

```typescript
// ============================================
// 乐观更新：在服务器响应前先更新 UI
// ============================================

// app/todos/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function addTodo(title: string) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const todo = await db.todo.create({
    data: { title },
  });
  
  revalidatePath('/todos');
  
  return todo;
}

export async function toggleTodoOptimistic(id: string, completed: boolean) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await db.todo.update({
    where: { id },
    data: { completed },
  });
  
  revalidatePath('/todos');
}

// app/todos/TodoList.tsx
'use client';

import { useOptimistic } from 'react';
import { addTodo, toggleTodoOptimistic } from './actions';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  initialTodos: Todo[];
}

export function TodoList({ initialTodos }: TodoListProps) {
  // useOptimistic 用于乐观更新
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (state, newTodo: Todo) => [...state, newTodo]
  );
  
  // 添加 Todo
  async function handleAddTodo(formData: FormData) {
    const title = formData.get('title') as string;
    
    // 乐观更新：立即添加到列表
    addOptimisticTodo({
      id: 'temp-' + Date.now(),
      title,
      completed: false,
    });
    
    // 实际服务器操作
    await addTodo(title);
  }
  
  // 切换状态
  async function handleToggle(id: string, completed: boolean) {
    // 乐观更新
    addOptimisticTodo({
      id,
      title: optimisticTodos.find(t => t.id === id)?.title || '',
      completed: !completed,
    });
    
    await toggleTodoOptimistic(id, !completed);
  }
  
  return (
    <div>
      {/* 添加表单 */}
      <form action={handleAddTodo} className="flex gap-2 mb-4">
        <input name="title" type="text" required className="flex-1 px-3 py-2 border rounded" />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          添加
        </button>
      </form>
      
      {/* 列表 */}
      <ul className="space-y-2">
        {optimisticTodos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-2 p-2 border rounded"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id, todo.completed)}
            />
            <span className={todo.completed ? 'line-through' : ''}>
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 点赞功能示例

```typescript
// ============================================
// 点赞功能的乐观更新
// ============================================

// app/posts/actions.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function likePost(postId: string) {
  await db.like.create({
    data: { postId },
  });
  
  revalidatePath(`/posts/${postId}`);
}

export async function unlikePost(postId: string) {
  await db.like.deleteMany({
    where: { postId },
  });
  
  revalidatePath(`/posts/${postId}`);
}

// app/posts/LikeButton.tsx
'use client';

import { useOptimistic } from 'react';
import { likePost, unlikePost } from './actions';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [optimisticState, setOptimisticState] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: newLiked ? state.count + 1 : state.count - 1,
    })
  );
  
  async function handleClick() {
    const newLiked = !optimisticState.liked;
    
    // 乐观更新
    setOptimisticState(newLiked);
    
    // 服务器操作
    if (newLiked) {
      await likePost(postId);
    } else {
      await unlikePost(postId);
    }
  }
  
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 px-3 py-1 rounded ${
        optimisticState.liked
          ? 'bg-red-100 text-red-600'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      <span>{optimisticState.liked ? '❤️' : '🤍'}</span>
      <span>{optimisticState.count}</span>
    </button>
  );
}
```

---

## 六、错误处理

### 基本错误处理

```typescript
// ============================================
// Server Actions 中的错误处理
// ============================================

// app/actions.ts
'use server';

import { redirect } from 'next/navigation';

export async function createUser(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // 验证
    if (!email || !password) {
      return { error: '请填写所有字段' };
    }
    
    // 检查用户是否存在
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return { error: '该邮箱已被注册' };
    }
    
    // 创建用户
    await db.user.create({
      data: {
        email,
        password: await hashPassword(password),
      },
    });
    
    // 成功后重定向
    redirect('/login');
    
  } catch (error) {
    console.error('创建用户失败:', error);
    return { error: '注册失败，请稍后重试' };
  }
}

// app/register/page.tsx
'use client';

import { useFormState } from 'react-dom';
import { createUser } from './actions';

export default function RegisterPage() {
  const [state, formAction] = useFormState(createUser, undefined);
  
  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">注册</button>
      
      {state?.error && (
        <p className="text-red-500">{state.error}</p>
      )}
    </form>
  );
}
```

### 使用 try-catch 和 redirect

```typescript
// ============================================
// 注意：redirect 会抛出错误
// ============================================

'use server';

import { redirect } from 'next/navigation';

export async function submitForm(formData: FormData) {
  let success = false;
  
  try {
    // 处理表单
    await processData(formData);
    success = true;
    
    // redirect 会抛出一个特殊的错误
    // 不要在 try 块内调用 redirect
  } catch (error) {
    // redirect 的错误不应该被捕获
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;  // 重新抛出
    }
    
    return { error: '处理失败' };
  }
  
  // 在 try-catch 外调用 redirect
  if (success) {
    redirect('/success');
  }
}

// 或者使用 isRedirectError 检查
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export async function submitFormV2(formData: FormData) {
  try {
    await processData(formData);
    redirect('/success');
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;  // 重新抛出 redirect 错误
    }
    return { error: '处理失败' };
  }
}
```

---

## 七、安全最佳实践

### 1. 输入验证

```typescript
// ============================================
// 使用 Zod 进行输入验证
// ============================================

'use server';

import { z } from 'zod';

// 定义验证 schema
const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(0).max(150).optional(),
});

export async function createUser(formData: FormData) {
  // 解析并验证数据
  const result = userSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    age: formData.get('age') ? Number(formData.get('age')) : undefined,
  });
  
  if (!result.success) {
    return {
      error: '验证失败',
      details: result.error.flatten().fieldErrors,
    };
  }
  
  // 使用验证后的数据
  const user = await db.user.create({
    data: result.data,
  });
  
  return { success: true, user };
}
```

### 2. 权限检查

```typescript
// ============================================
// 在 Server Action 中检查权限
// ============================================

'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

// 检查用户是否登录
async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return session.user;
}

// 检查用户是否是管理员
async function requireAdmin() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('需要管理员权限');
  }
  
  return user;
}

// 创建文章（需要登录）
export async function createPost(formData: FormData) {
  const user = await requireAuth();
  
  return db.post.create({
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      authorId: user.id,
    },
  });
}

// 删除用户（需要管理员权限）
export async function deleteUser(id: string) {
  await requireAdmin();
  
  return db.user.delete({ where: { id } });
}
```

### 3. CSRF 保护

```typescript
// ============================================
// Next.js 自动处理 CSRF 保护
// ============================================

// Server Actions 自动包含 CSRF 保护：
// 1. 每个请求都包含一个加密的签名
// 2. 服务器验证签名确保请求来自你的应用
// 3. 不需要手动添加 CSRF token

// 额外保护措施：

// 1. 使用 Origin 检查（可选）
export async function sensitiveAction(formData: FormData) {
  const origin = headers().get('origin');
  const host = headers().get('host');
  
  if (origin && !origin.includes(host || '')) {
    throw new Error('无效的请求来源');
  }
  
  // 处理请求
}

// 2. 使用 Rate Limiting（推荐）
import { rateLimit } from '@/lib/rate-limit';

export async function loginAction(formData: FormData) {
  const ip = headers().get('x-forwarded-for') || 'unknown';
  
  // 检查是否超过限制
  const { success } = await rateLimit.check(ip);
  
  if (!success) {
    return { error: '请求过于频繁，请稍后重试' };
  }
  
  // 处理登录
}
```

---

## 八、最佳实践总结

```typescript
// ============================================
// Server Actions 最佳实践
// ============================================

// 1. 将 Server Actions 放在单独文件中
// app/actions/
//   ├── users.ts
//   ├── posts.ts
//   └── auth.ts

// 2. 使用 TypeScript 类型
export type ActionState = {
  success?: boolean;
  error?: string;
  data?: any;
};

export async function myAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ...
}

// 3. 验证所有输入
import { z } from 'zod';

const schema = z.object({ /* ... */ });

// 4. 检查权限
await requireAuth();

// 5. 处理错误
try {
  // ...
} catch (error) {
  return { error: '操作失败' };
}

// 6. 重新验证缓存
revalidatePath('/path');
revalidateTag('tag');

// 7. 使用乐观更新提升用户体验
const [optimistic, setOptimistic] = useOptimistic(/* ... */);
```

---

## 下一步

恭喜你完成了 Server Actions 的学习！

接下来，我们将深入学习 [高级用法](./06-advanced.md)，了解中间件、API Routes、SEO 优化等进阶主题。
