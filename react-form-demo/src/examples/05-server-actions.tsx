/**
 * React 表单教程 - 第五章：React 19 Server Actions
 *
 * 本章节介绍 React 19 中的 Form Actions 新特性
 * 包括 useActionState、useFormStatus、useOptimistic 等
 */

import { 
  useActionState, 
  useFormStatus, 
  useOptimistic,
  useRef,
  useState,
  useEffect,
  ActionState,
} from 'react';

// ============================================================================
// 一、React 19 Form Actions 简介
// ============================================================================

/**
 * React 19 引入了原生的表单处理能力：
 * 
 * 1. 表单 action 属性
 *    - 可以直接在 form 上使用 action 属性
 *    - action 可以是函数，接收 FormData 参数
 * 
 * 2. useActionState
 *    - 管理 action 的状态（pending、result、error）
 *    - 替代之前的 useReducer + action 模式
 * 
 * 3. useFormStatus
 *    - 获取父级 form 的提交状态
 *    - 用于禁用按钮、显示加载状态
 * 
 * 4. useOptimistic
 *    - 实现乐观更新
 *    - 在服务器响应前更新 UI
 */

// ============================================================================
// 二、基础表单 Action
// ============================================================================

/**
 * 最基础的表单 action 示例
 * 直接在 form 上使用 action 属性
 */

/**
 * 模拟服务器端注册函数
 * 在实际应用中，这通常是一个 Server Action
 */
async function registerUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  const username = formData.get('username') as string;
  const email = formData.get('email') as string;

  // 模拟验证
  if (!username || username.length < 3) {
    return { success: false, message: '用户名至少需要 3 个字符' };
  }

  if (!email || !email.includes('@')) {
    return { success: false, message: '请输入有效的邮箱地址' };
  }

  // 模拟用户名已存在
  if (username === 'admin') {
    return { success: false, message: '用户名已被占用' };
  }

  return { success: true, message: `注册成功！欢迎 ${username}` };
}

/**
 * 基础表单 Action 示例
 */
function BasicFormActionExample() {
  /**
   * useActionState Hook
   * 
   * 参数：
   * - action: 异步函数，接收 previousState 和 formData
   * - initialState: 初始状态
   * - permalink: 可选，用于渐进增强的 URL
   * 
   * 返回：
   * - state: action 返回的状态
   * - formAction: 传递给 form action 的函数
   * - isPending: 是否正在处理
   */
  const [state, formAction, isPending] = useActionState(
    async (previousState: { success: boolean; message: string } | null, formData: FormData) => {
      return await registerUser(formData);
    },
    null
  );

  return (
    <form action={formAction} className="basic-form-action">
      <h3>基础表单 Action</h3>
      <p className="hint">
        React 19 允许直接在 form 上使用 action 属性，
        无需手动处理 onSubmit
      </p>

      <div className="form-group">
        <label htmlFor="username">用户名：</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          placeholder="请输入用户名"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">邮箱：</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="请输入邮箱"
        />
      </div>

      {/* 使用 useFormStatus 获取状态的按钮 */}
      <SubmitButton />

      {/* 显示结果 */}
      {state && (
        <div className={`result ${state.success ? 'success' : 'error'}`}>
          {state.message}
        </div>
      )}
    </form>
  );
}

/**
 * 提交按钮组件
 * 使用 useFormStatus 获取表单提交状态
 */
function SubmitButton() {
  /**
   * useFormStatus Hook
   * 
   * 返回表单的提交状态：
   * - pending: 是否正在提交
   * - data: 提交的 FormData
   * - method: 表单方法（get/post）
   * - action: 表单 action 函数
   * 
   * 注意：必须在 form 内部使用
   */
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '注册'}
    </button>
  );
}

// ============================================================================
// 三、useActionState 完整示例
// ============================================================================

/**
 * 用户资料表单数据类型
 */
interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
}

/**
 * Action 状态类型
 */
interface ProfileActionState {
  success: boolean;
  message: string;
  data?: UserProfile;
  errors?: Record<string, string>;
}

/**
 * 模拟服务器端保存用户资料
 */
async function saveUserProfile(
  previousState: ProfileActionState | null,
  formData: FormData
): Promise<ProfileActionState> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500));

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const bio = formData.get('bio') as string;

  // 验证
  const errors: Record<string, string> = {};

  if (!name || name.length < 2) {
    errors.name = '姓名至少需要 2 个字符';
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = '请输入有效的邮箱地址';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: '请修正表单中的错误',
      errors,
    };
  }

  // 模拟保存成功
  return {
    success: true,
    message: '资料保存成功！',
    data: { name, email, bio, avatar: '' },
  };
}

/**
 * 完整的 useActionState 示例
 */
function UseActionStateExample() {
  const [state, formAction, isPending] = useActionState(saveUserProfile, null);

  // 表单引用，用于重置
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="use-action-state-form">
      <h3>useActionState 完整示例</h3>
      <p className="hint">
        useActionState 管理 action 的状态，包括成功/失败结果和错误信息
      </p>

      {/* 全局消息 */}
      {state?.message && (
        <div className={`message ${state.success ? 'success' : 'error'}`}>
          {state.message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">姓名：</label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={state?.data?.name || ''}
          className={state?.errors?.name ? 'input-error' : ''}
        />
        {state?.errors?.name && (
          <span className="error">{state.errors.name}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">邮箱：</label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={state?.data?.email || ''}
          className={state?.errors?.email ? 'input-error' : ''}
        />
        {state?.errors?.email && (
          <span className="error">{state.errors.email}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="bio">个人简介：</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={state?.data?.bio || ''}
          placeholder="介绍一下你自己..."
        />
      </div>

      <div className="form-actions">
        <SubmitButtonWithStatus />
        <button type="button" onClick={() => formRef.current?.reset()}>
          重置
        </button>
      </div>
    </form>
  );
}

/**
 * 带状态的提交按钮
 */
function SubmitButtonWithStatus() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={pending ? 'loading' : ''}>
      {pending ? (
        <>
          <span className="spinner"></span>
          保存中...
        </>
      ) : (
        '保存资料'
      )}
    </button>
  );
}

// ============================================================================
// 四、乐观更新 (useOptimistic)
// ============================================================================

/**
 * 乐观更新示例
 * 在服务器响应前先更新 UI，提升用户体验
 */

/**
 * 评论数据类型
 */
interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

/**
 * 模拟添加评论的服务器函数
 */
async function addComment(comment: { text: string; author: string }): Promise<Comment> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    id: Date.now().toString(),
    text: comment.text,
    author: comment.author,
    createdAt: new Date(),
  };
}

/**
 * 乐观更新评论列表示例
 */
function OptimisticCommentsExample() {
  // 实际评论列表
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', text: '这是一条示例评论', author: '用户A', createdAt: new Date() },
  ]);

  /**
   * useOptimistic Hook
   * 
   * 参数：
   * - actualState: 实际状态
   * - reducer: 处理乐观更新的函数
   * 
   * 返回：
   * - optimisticState: 乐观状态（包含待确认的更新）
   * - addOptimistic: 添加乐观更新的函数
   */
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: { text: string; author: string }) => [
      ...state,
      {
        id: 'pending-' + Date.now(),
        text: newComment.text,
        author: newComment.author,
        createdAt: new Date(),
        pending: true, // 标记为待确认
      } as Comment & { pending: boolean },
    ]
  );

  // 表单状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 处理评论提交
   */
  const handleSubmit = async (formData: FormData) => {
    const text = formData.get('comment') as string;
    const author = '当前用户'; // 实际应用中从登录状态获取

    if (!text.trim()) return;

    // 清空输入框
    setIsSubmitting(true);

    // 添加乐观更新
    addOptimisticComment({ text, author });

    try {
      // 发送实际请求
      const newComment = await addComment({ text, author });

      // 更新实际状态
      setComments(prev => [...prev, newComment]);
    } catch (error) {
      // 失败时移除乐观更新（通过重新设置实际状态）
      console.error('评论发送失败', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="optimistic-comments">
      <h3>乐观更新示例</h3>
      <p className="hint">
        评论会在发送请求前立即显示，提升用户体验。
        注意观察"发送中"状态的评论。
      </p>

      {/* 评论列表 */}
      <div className="comments-list">
        {optimisticComments.map((comment) => (
          <div
            key={comment.id}
            className={`comment ${(comment as any).pending ? 'pending' : ''}`}
          >
            <div className="comment-header">
              <span className="author">{comment.author}</span>
              <span className="time">
                {comment.createdAt.toLocaleTimeString()}
              </span>
            </div>
            <p className="comment-text">{comment.text}</p>
            {(comment as any).pending && (
              <span className="pending-badge">发送中...</span>
            )}
          </div>
        ))}
      </div>

      {/* 评论表单 */}
      <form action={handleSubmit} className="comment-form">
        <textarea
          name="comment"
          placeholder="写下你的评论..."
          rows={3}
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '发送中...' : '发送评论'}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// 五、点赞功能的乐观更新
// ============================================================================

/**
 * 点赞数据类型
 */
interface LikeState {
  count: number;
  isLiked: boolean;
}

/**
 * 模拟点赞/取消点赞的服务器函数
 */
async function toggleLikeApi(currentlyLiked: boolean): Promise<{ liked: boolean; count: number }> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // 模拟返回新的点赞状态
  return {
    liked: !currentlyLiked,
    count: currentlyLiked ? 99 : 101,
  };
}

/**
 * 点赞按钮组件（带乐观更新）
 */
function LikeButton() {
  // 实际状态
  const [actualState, setActualState] = useState<LikeState>({
    count: 100,
    isLiked: false,
  });

  /**
   * useOptimistic 管理乐观状态
   */
  const [optimisticState, addOptimisticUpdate] = useOptimistic(
    actualState,
    (state, newLiked: boolean) => ({
      count: newLiked ? state.count + 1 : state.count - 1,
      isLiked: newLiked,
    })
  );

  /**
   * 处理点赞点击
   */
  const handleLike = async () => {
    // 立即应用乐观更新
    const newLiked = !optimisticState.isLiked;
    addOptimisticUpdate(newLiked);

    try {
      // 发送请求
      const result = await toggleLikeApi(optimisticState.isLiked);
      
      // 更新实际状态
      setActualState({
        count: result.count,
        isLiked: result.liked,
      });
    } catch (error) {
      // 失败时恢复原状态（通过设置实际状态）
      console.error('操作失败', error);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`like-button ${optimisticState.isLiked ? 'liked' : ''}`}
    >
      <span className="heart">{optimisticState.isLiked ? '❤️' : '🤍'}</span>
      <span className="count">{optimisticState.count}</span>
    </button>
  );
}

/**
 * 点赞功能示例
 */
function OptimisticLikeExample() {
  return (
    <div className="optimistic-like">
      <h3>点赞乐观更新</h3>
      <p className="hint">
        点击点赞按钮，观察乐观更新的效果。
        数字会立即变化，无需等待服务器响应。
      </p>

      <div className="like-demo">
        <LikeButton />
        <p>点击按钮测试乐观更新（模拟 1 秒延迟）</p>
      </div>
    </div>
  );
}

// ============================================================================
// 六、表单状态管理最佳实践
// ============================================================================

/**
 * 结合 React Hook Form 和 Form Actions 的示例
 * 展示如何在客户端验证后使用 Server Action
 */

/**
 * 订单数据类型
 */
interface OrderData {
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: 'alipay' | 'wechat' | 'card';
}

/**
 * 订单状态类型
 */
interface OrderState {
  success: boolean;
  message: string;
  orderId?: string;
  errors?: Record<string, string>;
}

/**
 * 模拟创建订单的服务器函数
 */
async function createOrderAction(
  previousState: OrderState | null,
  formData: FormData
): Promise<OrderState> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 从 FormData 解析数据
  const name = formData.get('shippingName') as string;
  const phone = formData.get('shippingPhone') as string;
  const address = formData.get('shippingAddress') as string;
  const paymentMethod = formData.get('paymentMethod') as OrderData['paymentMethod'];

  // 验证
  const errors: Record<string, string> = {};

  if (!name || name.length < 2) {
    errors.shippingName = '请输入收货人姓名';
  }

  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    errors.shippingPhone = '请输入有效的手机号';
  }

  if (!address || address.length < 10) {
    errors.shippingAddress = '请输入详细的收货地址';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: '请检查表单信息',
      errors,
    };
  }

  // 模拟创建订单
  return {
    success: true,
    message: '订单创建成功！',
    orderId: 'ORD-' + Date.now(),
  };
}

/**
 * 订单表单示例
 */
function OrderFormExample() {
  const [state, formAction, isPending] = useActionState(createOrderAction, null);

  // 模拟购物车数据
  const cartItems = [
    { name: 'React 进阶教程', quantity: 1, price: 99 },
    { name: 'TypeScript 实战', quantity: 2, price: 79 },
  ];

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <form action={formAction} className="order-form">
      <h3>订单提交示例</h3>
      <p className="hint">
        结合客户端验证和服务器端处理，展示完整的订单提交流程
      </p>

      {/* 购物车摘要 */}
      <div className="cart-summary">
        <h4>购物车</h4>
        {cartItems.map((item, index) => (
          <div key={index} className="cart-item">
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
            <span>¥{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="cart-total">
          <strong>总计：¥{total}</strong>
        </div>
      </div>

      {/* 收货信息 */}
      <fieldset>
        <legend>收货信息</legend>

        <div className="form-group">
          <label htmlFor="shippingName">收货人：</label>
          <input
            type="text"
            id="shippingName"
            name="shippingName"
            className={state?.errors?.shippingName ? 'input-error' : ''}
          />
          {state?.errors?.shippingName && (
            <span className="error">{state.errors.shippingName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="shippingPhone">手机号：</label>
          <input
            type="tel"
            id="shippingPhone"
            name="shippingPhone"
            className={state?.errors?.shippingPhone ? 'input-error' : ''}
          />
          {state?.errors?.shippingPhone && (
            <span className="error">{state.errors.shippingPhone}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="shippingAddress">收货地址：</label>
          <textarea
            id="shippingAddress"
            name="shippingAddress"
            rows={3}
            className={state?.errors?.shippingAddress ? 'input-error' : ''}
          />
          {state?.errors?.shippingAddress && (
            <span className="error">{state.errors.shippingAddress}</span>
          )}
        </div>
      </fieldset>

      {/* 支付方式 */}
      <fieldset>
        <legend>支付方式</legend>
        <div className="payment-options">
          <label>
            <input type="radio" name="paymentMethod" value="alipay" defaultChecked />
            支付宝
          </label>
          <label>
            <input type="radio" name="paymentMethod" value="wechat" />
            微信支付
          </label>
          <label>
            <input type="radio" name="paymentMethod" value="card" />
            银行卡
          </label>
        </div>
      </fieldset>

      {/* 结果消息 */}
      {state?.message && (
        <div className={`message ${state.success ? 'success' : 'error'}`}>
          {state.message}
          {state.orderId && <p>订单号：{state.orderId}</p>}
        </div>
      )}

      {/* 提交按钮 */}
      <button type="submit" disabled={isPending} className="submit-order">
        {isPending ? '处理中...' : `提交订单 ¥${total}`}
      </button>
    </form>
  );
}

// ============================================================================
// 七、Server Actions 集成示例（Next.js 风格）
// ============================================================================

/**
 * 展示如何在 Next.js 中使用 Server Actions
 * 注意：这部分代码在纯客户端环境中无法直接运行
 * 仅作为示例展示 Server Actions 的使用模式
 */

/**
 * Server Action 示例（通常放在单独的 actions.ts 文件中）
 * 
 * 'use server' 指令标记这是一个服务器端函数
 * 
 * // actions.ts
 * 'use server'
 * 
 * export async function submitContactForm(formData: FormData) {
 *   const name = formData.get('name');
 *   const email = formData.get('email');
 *   const message = formData.get('message');
 * 
 *   // 服务器端验证
 *   if (!name || !email || !message) {
 *     return { success: false, error: '所有字段都是必填的' };
 *   }
 * 
 *   // 保存到数据库
 *   await db.contacts.create({
 *     data: { name, email, message }
 *   });
 * 
 *   // 发送邮件通知
 *   await sendEmail({ to: 'admin@example.com', subject: '新联系表单', body: message });
 * 
 *   return { success: true, message: '感谢您的留言！' };
 * }
 */

/**
 * Next.js 风格的 Server Actions 使用示例
 */
function ServerActionsExample() {
  /**
   * 在 Next.js 中，可以直接导入 Server Action
   * import { submitContactForm } from './actions';
   */

  // 这里使用模拟的 action
  const [state, formAction, isPending] = useActionState(
    async (prev: any, formData: FormData) => {
      // 模拟 Server Action
      await new Promise(resolve => setTimeout(resolve, 1500));

      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const message = formData.get('message') as string;

      if (!name || !email || !message) {
        return { success: false, error: '所有字段都是必填的' };
      }

      return { success: true, message: '感谢您的留言！我们会尽快回复。' };
    },
    null
  );

  return (
    <div className="server-actions-example">
      <h3>Server Actions 集成示例</h3>
      <p className="hint">
        在 Next.js 中，Server Actions 可以直接在服务器端执行，
        无需创建 API 路由。
      </p>

      <div className="code-block">
        <pre>{`// 在 Next.js 中使用 Server Actions

// actions.ts (服务器端)
'use server'

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name');
  // ... 服务器端处理
  return { success: true };
}

// ContactForm.tsx (客户端)
import { submitContactForm } from './actions';

function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, null);
  
  return (
    <form action={formAction}>
      {/* 表单字段 */}
    </form>
  );
}`}</pre>
      </div>

      <form action={formAction} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">姓名：</label>
          <input type="text" id="name" name="name" required />
        </div>

        <div className="form-group">
          <label htmlFor="email">邮箱：</label>
          <input type="email" id="email" name="email" required />
        </div>

        <div className="form-group">
          <label htmlFor="message">留言：</label>
          <textarea id="message" name="message" rows={4} required />
        </div>

        {state?.error && <div className="error">{state.error}</div>}
        {state?.success && <div className="success">{state.message}</div>}

        <button type="submit" disabled={isPending}>
          {isPending ? '发送中...' : '发送留言'}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// 八、主组件导出
// ============================================================================

export default function ServerActionsDemo() {
  return (
    <div className="server-actions-demo">
      <h1>第五章：React 19 Server Actions</h1>
      <p className="intro">
        React 19 引入了原生的表单处理能力，包括 useActionState、
        useFormStatus、useOptimistic 等新 Hook，让表单处理更加简洁。
      </p>

      <BasicFormActionExample />
      <hr />
      <UseActionStateExample />
      <hr />
      <OptimisticCommentsExample />
      <hr />
      <OptimisticLikeExample />
      <hr />
      <OrderFormExample />
      <hr />
      <ServerActionsExample />

      <div className="navigation">
        <p>上一章：<a href="./04-advanced.tsx">高级用法</a></p>
      </div>

      <div className="summary">
        <h2>本章总结</h2>
        <p>
          React 19 的 Form Actions 提供了一种更简洁的表单处理方式，
          特别适合与 Server Actions 配合使用。主要特点包括：
        </p>
        <ul>
          <li>直接在 form 上使用 action 属性</li>
          <li>useActionState 管理 action 状态</li>
          <li>useFormStatus 获取表单提交状态</li>
          <li>useOptimistic 实现乐观更新</li>
          <li>与 Next.js Server Actions 无缝集成</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * 本章要点总结：
 * 
 * 1. Form Actions 基础
 *    - form 的 action 属性可以直接接收函数
 *    - 函数接收 FormData 参数
 *    - 无需手动处理 onSubmit
 * 
 * 2. useActionState
 *    - 管理 action 的状态
 *    - 返回 [state, formAction, isPending]
 *    - 适合处理表单提交结果
 * 
 * 3. useFormStatus
 *    - 获取父级 form 的提交状态
 *    - 必须在 form 内部使用
 *    - 用于禁用按钮、显示加载状态
 * 
 * 4. useOptimistic
 *    - 实现乐观更新
 *    - 在服务器响应前更新 UI
 *    - 提升用户体验
 * 
 * 5. Server Actions 集成
 *    - Next.js 中使用 'use server' 指令
 *    - 服务器端直接处理表单数据
 *    - 无需创建 API 路由
 * 
 * 恭喜你完成了 React Form 完整教程！
 * 现在你已经掌握了从基础到高级的 React 表单开发技能。
 */
