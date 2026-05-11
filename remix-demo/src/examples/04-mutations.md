# Remix 数据变更详解

本文档详细介绍 Remix 的数据变更机制，包括表单处理、useActionData、乐观 UI 等内容。

---

## 一、表单处理

### 1.1 Form 组件基础

```tsx
// Remix 的 Form 组件是处理数据变更的核心

import { Form } from "@remix-run/react";

export default function ContactPage() {
  return (
    <div>
      <h1>联系我们</h1>
      
      {/* 基本表单 */}
      <Form method="post">
        {/* method 可以是 "post", "put", "patch", "delete" */}
        
        <div>
          <label htmlFor="name">姓名</label>
          <input 
            id="name"
            name="name"  // name 属性是必须的
            type="text"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email">邮箱</label>
          <input 
            id="email"
            name="email"
            type="email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="message">消息</label>
          <textarea 
            id="message"
            name="message"
            rows={4}
            required
          />
        </div>
        
        <button type="submit">发送</button>
      </Form>
    </div>
  );
}
```

### 1.2 Action 处理表单

```tsx
// action 处理表单提交

import { json, redirect, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

// 定义表单数据类型
type ActionData = {
  errors?: {
    name?: string;
    email?: string;
    message?: string;
  };
  success?: boolean;
};

// Action 处理函数
export const action = async ({ request }: ActionFunctionArgs) => {
  // 获取表单数据
  const formData = await request.formData();
  
  // 提取字段
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");
  
  // 验证
  const errors: ActionData["errors"] = {};
  
  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.name = "请输入姓名";
  }
  
  if (!email || typeof email !== "string" || !email.includes("@")) {
    errors.email = "请输入有效的邮箱地址";
  }
  
  if (!message || typeof message !== "string" || message.length < 10) {
    errors.message = "消息至少需要 10 个字符";
  }
  
  // 如果有错误，返回错误信息
  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors }, { status: 400 });
  }
  
  // 处理数据（发送邮件、保存数据库等）
  await sendEmail({ name, email, message });
  
  // 成功后重定向
  return redirect("/contact/success");
};

// 页面组件
export default function ContactPage() {
  // 获取 action 返回的数据
  const actionData = useActionData<ActionData>();
  
  return (
    <Form method="post">
      <div>
        <label htmlFor="name">姓名</label>
        <input 
          id="name"
          name="name"
          type="text"
          defaultValue={actionData?.errors?.name ? "" : undefined}
        />
        {actionData?.errors?.name && (
          <p className="error">{actionData.errors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email">邮箱</label>
        <input id="email" name="email" type="email" />
        {actionData?.errors?.email && (
          <p className="error">{actionData.errors.email}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="message">消息</label>
        <textarea id="message" name="message" />
        {actionData?.errors?.message && (
          <p className="error">{actionData.errors.message}</p>
        )}
      </div>
      
      <button type="submit">发送</button>
    </Form>
  );
}
```

### 1.3 多个 Action 处理

```tsx
// 使用 intent 区分不同的操作

import { json, ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent"); // 获取操作意图
  
  switch (intent) {
    case "create": {
      const title = formData.get("title");
      const post = await db.post.create({
        data: { title },
      });
      return redirect(`/posts/${post.id}`);
    }
    
    case "update": {
      const id = formData.get("id");
      const title = formData.get("title");
      await db.post.update({
        where: { id },
        data: { title },
      });
      return json({ success: true });
    }
    
    case "delete": {
      const id = formData.get("id");
      await db.post.delete({
        where: { id },
      });
      return redirect("/posts");
    }
    
    default:
      return json({ error: "未知操作" }, { status: 400 });
  }
};

export default function PostEditor() {
  const post = useLoaderData<typeof loader>();
  
  return (
    <div>
      {/* 更新表单 */}
      <Form method="post">
        <input type="hidden" name="intent" value="update" />
        <input type="hidden" name="id" value={post.id} />
        <input name="title" defaultValue={post.title} />
        <button type="submit">保存</button>
      </Form>
      
      {/* 删除表单 */}
      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="id" value={post.id} />
        <button type="submit" className="danger">删除</button>
      </Form>
    </div>
  );
}
```

### 1.4 文件上传

```tsx
// 处理文件上传

import { unstable_parseMultipartFormData } from "@remix-run/node";
import { Form } from "@remix-run/react";

// 自定义文件上传处理
async function uploadHandler({ name, filename, data, contentType }) {
  // 将文件保存到云存储或本地
  const chunks = [];
  for await (const chunk of data) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  
  // 上传到云存储
  const url = await uploadToCloud(buffer, filename);
  
  return url;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  // 解析 multipart 表单数据
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );
  
  const title = formData.get("title");
  const imageUrl = formData.get("image"); // 上传后的 URL
  
  const post = await db.post.create({
    data: { title, imageUrl },
  });
  
  return redirect(`/posts/${post.id}`);
};

export default function UploadForm() {
  return (
    <Form method="post" encType="multipart/form-data">
      <div>
        <label htmlFor="title">标题</label>
        <input id="title" name="title" type="text" required />
      </div>
      
      <div>
        <label htmlFor="image">图片</label>
        <input 
          id="image"
          name="image"
          type="file"
          accept="image/*"
          required
        />
      </div>
      
      <button type="submit">上传</button>
    </Form>
  );
}
```

---

## 二、useActionData

### 2.1 获取 Action 返回数据

```tsx
// useActionData 获取 action 返回的数据

import { json, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

type ActionData = {
  errors?: Record<string, string>;
  message?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  
  // 验证
  const errors: Record<string, string> = {};
  
  if (!email) errors.email = "请输入邮箱";
  if (!password) errors.password = "请输入密码";
  
  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors }, { status: 400 });
  }
  
  // 登录
  const user = await authenticate(email, password);
  
  if (!user) {
    return json<ActionData>({ 
      message: "邮箱或密码错误" 
    }, { status: 401 });
  }
  
  // 创建 session 并重定向
  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await createSession(user.id),
    },
  });
};

export default function LoginPage() {
  const actionData = useActionData<ActionData>();
  
  return (
    <Form method="post">
      <div>
        <input name="email" type="email" />
        {actionData?.errors?.email && (
          <p className="error">{actionData.errors.email}</p>
        )}
      </div>
      
      <div>
        <input name="password" type="password" />
        {actionData?.errors?.password && (
          <p className="error">{actionData.errors.password}</p>
        )}
      </div>
      
      {/* 表单级错误 */}
      {actionData?.message && (
        <p className="error">{actionData.message}</p>
      )}
      
      <button type="submit">登录</button>
    </Form>
  );
}
```

### 2.2 类型安全的 useActionData

```tsx
// 使用 TypeScript 实现类型安全

import { json, ActionFunctionArgs } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

// 定义返回类型
type ActionResult = 
  | { success: true; post: Post }
  | { success: false; errors: Record<string, string> };

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  
  // 验证
  const errors: Record<string, string> = {};
  
  if (title.length < 5) {
    errors.title = "标题至少 5 个字符";
  }
  
  if (content.length < 20) {
    errors.content = "内容至少 20 个字符";
  }
  
  if (Object.keys(errors).length > 0) {
    return json<ActionResult>({ 
      success: false, 
      errors 
    }, { status: 400 });
  }
  
  // 创建文章
  const post = await db.post.create({
    data: { title, content },
  });
  
  return json<ActionResult>({ success: true, post });
};

export default function NewPostPage() {
  const actionData = useActionData<typeof action>();
  
  // TypeScript 知道 actionData 的类型
  if (actionData?.success) {
    return (
      <div className="success">
        <h2>文章创建成功！</h2>
        <Link to={`/posts/${actionData.post.id}`}>查看文章</Link>
      </div>
    );
  }
  
  return (
    <Form method="post">
      <div>
        <input name="title" />
        {actionData && !actionData.success && actionData.errors.title && (
          <p className="error">{actionData.errors.title}</p>
        )}
      </div>
      
      <div>
        <textarea name="content" />
        {actionData && !actionData.success && actionData.errors.content && (
          <p className="error">{actionData.errors.content}</p>
        )}
      </div>
      
      <button type="submit">发布</button>
    </Form>
  );
}
```

---

## 三、useNavigation

### 3.1 监控导航状态

```tsx
// useNavigation 监控页面导航和表单提交状态

import { useNavigation } from "@remix-run/react";

export default function PostPage() {
  const navigation = useNavigation();
  
  // navigation.state 可能的值：
  // - "idle": 空闲状态
  // - "loading": 正在加载下一个页面
  // - "submitting": 正在提交表单
  
  // navigation.type 可能的值：
  // - "normal": 普通页面导航
  // - "load": 加载页面
  // - "actionRedirect": action 后重定向
  // - "actionReload": action 后重新加载
  
  // navigation.formMethod: 表单方法
  // navigation.formAction: 表单 action
  // navigation.formData: 表单数据
  // navigation.location: 目标位置
  
  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";
  
  return (
    <div>
      {/* 全局加载指示器 */}
      {(isSubmitting || isLoading) && (
        <div className="loading-bar">
          {isSubmitting ? "提交中..." : "加载中..."}
        </div>
      )}
      
      <Form method="post">
        <input name="title" />
        <button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "保存中..." : "保存"}
        </button>
      </Form>
    </div>
  );
}
```

### 3.2 使用 useNavigation 实现加载状态

```tsx
// 实现按钮加载状态

import { useNavigation, Form } from "@remix-run/react";

function SubmitButton() {
  const navigation = useNavigation();
  
  // 检查是否是当前表单提交
  const isSubmitting = 
    navigation.state === "submitting" &&
    navigation.formAction === "/posts/new" &&
    navigation.formMethod === "POST";
  
  return (
    <button 
      type="submit" 
      disabled={isSubmitting}
      className={isSubmitting ? "loading" : ""}
    >
      {isSubmitting ? (
        <>
          <span className="spinner" />
          提交中...
        </>
      ) : (
        "提交"
      )}
    </button>
  );
}

export default function NewPostPage() {
  return (
    <Form method="post" action="/posts/new">
      <input name="title" />
      <SubmitButton />
    </Form>
  );
}

// 全局加载进度条

import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export function GlobalLoading() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (navigation.state === "idle") {
      setProgress(100);
      setTimeout(() => setProgress(0), 200);
    } else {
      // 模拟进度
      const timer = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [navigation.state]);
  
  if (progress === 0) return null;
  
  return (
    <div className="global-loading">
      <div 
        className="progress-bar" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

### 3.3 使用 useFetcher

```tsx
// useFetcher 用于不导航的表单提交

import { useFetcher } from "@remix-run/react";

// 场景：点赞、收藏等不需要导航的操作

export default function PostPage() {
  const post = useLoaderData<typeof loader>();
  const likeFetcher = useFetcher();
  const bookmarkFetcher = useFetcher();
  
  // 获取 fetcher 返回的数据
  const likeData = likeFetcher.data;
  
  // 检查状态
  const isLiking = likeFetcher.state === "submitting";
  const isBookmarking = bookmarkFetcher.state === "submitting";
  
  return (
    <div>
      <h1>{post.title}</h1>
      
      {/* 点赞按钮 */}
      <likeFetcher.Form method="post" action="/api/like">
        <input type="hidden" name="postId" value={post.id} />
        <input type="hidden" name="intent" value="like" />
        <button 
          type="submit"
          disabled={isLiking}
        >
          {isLiking ? "处理中..." : (
            <>
              ❤️ {likeData?.likes ?? post.likes}
            </>
          )}
        </button>
      </likeFetcher.Form>
      
      {/* 收藏按钮 */}
      <bookmarkFetcher.Form method="post" action="/api/bookmark">
        <input type="hidden" name="postId" value={post.id} />
        <button 
          type="submit"
          disabled={isBookmarking}
        >
          {post.isBookmarked ? "已收藏" : "收藏"}
        </button>
      </bookmarkFetcher.Form>
    </div>
  );
}

// API 路由处理
// app/routes/api.like.ts
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const postId = formData.get("postId");
  
  const post = await db.post.update({
    where: { id: postId },
    data: { likes: { increment: 1 } },
  });
  
  return json({ likes: post.likes });
};
```

---

## 四、乐观 UI

### 4.1 什么是乐观 UI？

```tsx
// 乐观 UI（Optimistic UI）是一种用户体验优化技术
// 在服务器响应之前，先假设操作成功，更新 UI

// 传统流程：
// 1. 用户点击按钮
// 2. 显示加载状态
// 3. 等待服务器响应
// 4. 更新 UI

// 乐观 UI 流程：
// 1. 用户点击按钮
// 2. 立即更新 UI（假设成功）
// 3. 后台发送请求
// 4. 如果失败，回滚 UI
```

### 4.2 使用 useOptimistic

```tsx
// React 19 的 useOptimistic 或 Remix 的实现

import { useOptimistic } from "react"; // React 19
import { useFetcher } from "@remix-run/react";

// 示例：点赞功能

type Like = {
  id: string;
  userId: string;
  postId: string;
};

export function LikeButton({ 
  postId, 
  initialLikes, 
  initialLiked 
}: { 
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
}) {
  const fetcher = useFetcher();
  
  // 使用乐观状态
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    initialLiked,
    (_, newValue: boolean) => newValue
  );
  
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    initialLikes,
    (currentLikes, liked: boolean) => 
      liked ? currentLikes + 1 : currentLikes - 1
  );
  
  const isSubmitting = fetcher.state === "submitting";
  
  const handleLike = () => {
    // 立即更新 UI
    setOptimisticLiked(!optimisticLiked);
    setOptimisticLikes(!optimisticLiked);
    
    // 发送请求
    fetcher.submit(
      { 
        postId, 
        intent: optimisticLiked ? "unlike" : "like" 
      },
      { method: "post", action: "/api/like" }
    );
  };
  
  return (
    <button 
      onClick={handleLike}
      disabled={isSubmitting}
      className={optimisticLiked ? "liked" : ""}
    >
      {optimisticLiked ? "❤️" : "🤍"} {optimisticLikes}
    </button>
  );
}
```

### 4.3 自定义乐观 UI Hook

```tsx
// 创建自定义 Hook 处理乐观更新

import { useFetcher } from "@remix-run/react";
import { useState, useCallback } from "react";

type OptimisticOptions<T, R> = {
  // 乐观更新函数
  optimisticValue: (current: T) => T;
  // 成功回调
  onSuccess?: (result: R) => void;
  // 失败回调
  onError?: (error: Error) => void;
};

export function useOptimisticAction<T, R>(
  initialValue: T,
  action: string,
  options: OptimisticOptions<T, R>
) {
  const fetcher = useFetcher<R>();
  const [optimisticState, setOptimisticState] = useState<T>(initialValue);
  
  const submit = useCallback(
    (data: Record<string, string>) => {
      // 立即更新乐观状态
      setOptimisticState(options.optimisticValue(optimisticState));
      
      // 发送请求
      fetcher.submit(data, { method: "post", action });
    },
    [fetcher, action, optimisticState, options]
  );
  
  // 处理结果
  useEffect(() => {
    if (fetcher.data) {
      options.onSuccess?.(fetcher.data);
    }
    
    if (fetcher.state === "idle" && fetcher.data === undefined) {
      // 可能失败了，回滚
      setOptimisticState(initialValue);
      options.onError?.(new Error("请求失败"));
    }
  }, [fetcher.data, fetcher.state, initialValue, options]);
  
  return {
    state: optimisticState,
    submit,
    isSubmitting: fetcher.state === "submitting",
    result: fetcher.data,
  };
}

// 使用示例
function TodoList() {
  const { todos } = useLoaderData<typeof loader>();
  
  const [optimisticTodos, setOptimisticTodos] = useState(todos);
  
  const addTodo = useOptimisticAction(optimisticTodos, "/api/todos", {
    optimisticValue: (current) => [
      ...current,
      { id: "temp", title: "新待办", completed: false },
    ],
    onSuccess: (result) => {
      // 替换临时项
      setOptimisticTodos(result.todos);
    },
  });
  
  return (
    <div>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
      
      <Form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        addTodo.submit({ title: formData.get("title") as string });
      }}>
        <input name="title" />
        <button type="submit">添加</button>
      </Form>
    </div>
  );
}
```

### 4.4 乐观 UI 最佳实践

```tsx
// 乐观 UI 最佳实践

// 1. 只对高成功率操作使用乐观 UI
// ✅ 点赞、收藏、简单表单
// ❌ 支付、重要数据提交

// 2. 提供回滚机制
function useOptimisticWithRollback<T>(
  initialValue: T,
  submitFn: (value: T) => Promise<T>
) {
  const [value, setValue] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);
  const [previousValue, setPreviousValue] = useState<T | null>(null);
  
  const submit = async (newValue: T) => {
    // 保存旧值以便回滚
    setPreviousValue(value);
    setValue(newValue);
    setIsPending(true);
    
    try {
      const result = await submitFn(newValue);
      setValue(result);
    } catch (error) {
      // 回滚
      if (previousValue !== null) {
        setValue(previousValue);
      }
      throw error;
    } finally {
      setIsPending(false);
      setPreviousValue(null);
    }
  };
  
  return { value, submit, isPending };
}

// 3. 显示同步状态
function SyncIndicator({ isPending, isOptimistic }) {
  if (!isPending && !isOptimistic) return null;
  
  return (
    <span className="sync-status">
      {isOptimistic ? "🔄 同步中..." : "✅ 已保存"}
    </span>
  );
}

// 4. 处理冲突
function useConflictResolution<T>(
  localValue: T,
  serverValue: T,
  onConflict: (local: T, server: T) => T
) {
  const [hasConflict, setHasConflict] = useState(false);
  
  useEffect(() => {
    if (!isEqual(localValue, serverValue)) {
      setHasConflict(true);
    }
  }, [localValue, serverValue]);
  
  const resolve = () => {
    const resolved = onConflict(localValue, serverValue);
    setHasConflict(false);
    return resolved;
  };
  
  return { hasConflict, resolve };
}
```

---

## 五、重定向

### 5.1 基本重定向

```tsx
// 使用 redirect 进行页面跳转

import { redirect } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  
  // 创建文章
  const post = await db.post.create({
    data: {
      title: formData.get("title"),
      content: formData.get("content"),
    },
  });
  
  // 重定向到文章详情页
  return redirect(`/posts/${post.id}`);
};

// 重定向到外部 URL
return redirect("https://example.com");

// 带状态码的重定向
return redirect("/login", 302); // 临时重定向
return redirect("/new-url", 301); // 永久重定向
```

### 5.2 带数据的重定向

```tsx
// 使用 session 传递重定向消息

import { redirect } from "@remix-run/node";
import { getSession, commitSession } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  
  // 处理数据
  await db.post.create({
    data: { title: formData.get("title") },
  });
  
  // 设置 flash 消息
  session.flash("success", "文章创建成功！");
  
  // 重定向并设置 cookie
  return redirect("/posts", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

// 在目标页面显示消息
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const success = session.get("success") || null;
  
  return json(
    { success },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export default function PostsPage() {
  const { success } = useLoaderData<typeof loader>();
  
  return (
    <div>
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      {/* ... */}
    </div>
  );
}
```

### 5.3 条件重定向

```tsx
// 根据条件进行重定向

import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const url = new URL(request.url);
  
  // 未登录重定向到登录页
  if (!user) {
    const redirectTo = url.pathname + url.search;
    return redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  
  // 未完成设置重定向到设置页
  if (!user.hasCompletedSetup) {
    return redirect("/setup");
  }
  
  // 非管理员访问管理页
  if (url.pathname.startsWith("/admin") && user.role !== "admin") {
    return redirect("/403");
  }
  
  return json({ user });
};

// 登录后返回原页面
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const user = await authenticate(
    formData.get("email"),
    formData.get("password")
  );
  
  if (user) {
    const redirectTo = formData.get("redirectTo") || "/dashboard";
    return redirect(redirectTo as string, {
      headers: {
        "Set-Cookie": await createSession(user.id),
      },
    });
  }
  
  return json({ error: "登录失败" }, { status: 401 });
};
```

---

## 六、小结

通过本节学习，你应该掌握了：

1. **表单处理**: 使用 Form 组件和 action 处理表单提交
2. **useActionData**: 获取 action 返回的数据和错误
3. **useNavigation**: 监控导航和提交状态
4. **乐观 UI**: 在服务器响应前更新 UI
5. **重定向**: 使用 redirect 进行页面跳转

下一节我们将学习 Remix 的高级特性。
