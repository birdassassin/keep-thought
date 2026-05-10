/**
 * React 19 Form Actions 演示
 * 表单现在支持直接传递函数给 action 属性
 */

import { useFormStatus } from 'react-dom';
import { useActionState, useState } from 'react';

// ========== 使用 useFormStatus 的子组件 ==========
// useFormStatus 可以读取父表单的状态，无需 prop drilling
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="submit-btn"
    >
      {pending ? (
        <>
          <span className="spinner"></span>
          提交中...
        </>
      ) : (
        '提交表单'
      )}
    </button>
  );
}

// ========== 表单状态显示组件 ==========
function FormStatusDisplay() {
  const { pending, data } = useFormStatus();

  if (!pending && !data) return null;

  return (
    <div className="form-status">
      {pending && <p>🔄 正在处理表单数据...</p>}
      {data && (
        <div className="form-data-preview">
          <p>📦 表单数据预览：</p>
          <pre>{JSON.stringify(Object.fromEntries(data.entries()), null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// ========== 模拟服务器操作 ==========
async function submitToServer(formData: FormData): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // 模拟验证
  if (!name || name.length < 2) {
    return { success: false, message: '姓名至少需要2个字符' };
  }

  if (!email?.includes('@')) {
    return { success: false, message: '请输入有效的邮箱地址' };
  }

  return {
    success: true,
    message: `欢迎, ${name}! 注册成功，确认邮件已发送至 ${email}`
  };
}

// ========== 示例 1: 基础表单 Action ==========
function BasicFormDemo() {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleAction(formData: FormData) {
    const response = await submitToServer(formData);
    setResult(response);

    // 如果成功，重置表单
    if (response.success) {
      const form = document.getElementById('basic-form') as HTMLFormElement;
      form?.reset();
    }
  }

  return (
    <div className="demo-section">
      <h3>1. 基础表单 Action</h3>
      <p className="description">
        直接将异步函数传递给 form 的 action 属性
      </p>

      <form id="basic-form" action={handleAction} className="form-demo">
        <div className="form-group">
          <label htmlFor="name">姓名：</label>
          <input type="text" name="name" id="name" required className="input-field" />
        </div>

        <div className="form-group">
          <label htmlFor="email">邮箱：</label>
          <input type="email" name="email" id="email" required className="input-field" />
        </div>

        <SubmitButton />
        <FormStatusDisplay />

        {result && (
          <div className={`result-message ${result.success ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}
      </form>
    </div>
  );
}

// ========== 示例 2: 使用 useActionState ==========
function ActionStateFormDemo() {
  const [result, submitAction, isPending] = useActionState(
    async (_prevState: { success: boolean; message: string } | null, formData: FormData) => {
      return await submitToServer(formData);
    },
    null
  );

  return (
    <div className="demo-section">
      <h3>2. useActionState + Form Action</h3>
      <p className="description">
        结合 useActionState 管理表单状态和错误
      </p>

      <form action={submitAction} className="form-demo">
        <div className="form-group">
          <label htmlFor="name2">姓名：</label>
          <input type="text" name="name" id="name2" required className="input-field" />
        </div>

        <div className="form-group">
          <label htmlFor="email2">邮箱：</label>
          <input type="email" name="email" id="email2" required className="input-field" />
        </div>

        <button type="submit" disabled={isPending} className="submit-btn">
          {isPending ? '提交中...' : '提交表单'}
        </button>

        {result && (
          <div className={`result-message ${result.success ? 'success' : 'error'}`}>
            {result.message}
          </div>
        )}
      </form>
    </div>
  );
}

// ========== 示例 3: 多按钮表单 ==========
function MultiButtonFormDemo() {
  const [actionType, setActionType] = useState<string>('');

  async function handleMultiAction(formData: FormData) {
    const action = formData.get('action') as string;
    setActionType(action);

    await new Promise(resolve => setTimeout(resolve, 1000));

    alert(`执行了操作: ${action === 'save' ? '保存草稿' : '发布文章'}`);
  }

  return (
    <div className="demo-section">
      <h3>3. 多按钮表单（formAction）</h3>
      <p className="description">
        不同按钮可以触发不同的 action
      </p>

      <form action={handleMultiAction} className="form-demo">
        <div className="form-group">
          <label htmlFor="title">文章标题：</label>
          <input type="text" name="title" id="title" className="input-field" />
        </div>

        <div className="form-group">
          <label htmlFor="content">文章内容：</label>
          <textarea name="content" id="content" rows={4} className="input-field" />
        </div>

        <div className="button-group">
          <button
            type="submit"
            name="action"
            value="save"
            className="action-btn secondary"
          >
            💾 保存草稿
          </button>
          <button
            type="submit"
            name="action"
            value="publish"
            className="action-btn primary"
          >
            🚀 发布文章
          </button>
        </div>

        {actionType && (
          <p className="action-type-display">
            上次操作: {actionType === 'save' ? '保存草稿' : '发布文章'}
          </p>
        )}
      </form>
    </div>
  );
}

// ========== 主组件 ==========
export default function FormActionsDemo() {
  return (
    <div className="demo-container">
      <h2>React 19 Form Actions 演示</h2>
      <p className="intro">
        React 19 让表单处理变得前所未有的简单。
        表单元素现在支持直接传递函数给 action 和 formAction 属性，
        自动处理 pending 状态和表单重置。
      </p>

      <BasicFormDemo />
      <ActionStateFormDemo />
      <MultiButtonFormDemo />

      <div className="feature-summary">
        <h4>Form Actions 的核心特性：</h4>
        <ul>
          <li>
            <strong>自动重置</strong> - 表单提交成功后，非受控组件自动重置
          </li>
          <li>
            <strong>useFormStatus</strong> - 子组件轻松获取表单状态，告别 prop drilling
          </li>
          <li>
            <strong>渐进增强</strong> - 即使 JavaScript 禁用，表单仍可正常工作
          </li>
          <li>
            <strong>类型安全</strong> - 与 TypeScript 完美配合
          </li>
        </ul>
      </div>
    </div>
  );
}
