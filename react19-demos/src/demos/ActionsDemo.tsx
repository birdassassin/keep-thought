/**
 * React 19 Actions 演示
 * Actions 是 React 19 中处理异步操作的新范式
 * 它可以自动处理 pending 状态、错误处理和乐观更新
 */

import { useActionState, useTransition, useState } from 'react';

// 模拟 API 调用
async function updateName(name: string): Promise<string | null> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (name.length < 2) {
    return '名称至少需要2个字符';
  }
  return null; // 成功时返回 null
}

// ========== 示例 1: 使用 useActionState (推荐方式) ==========
function UseActionStateDemo() {
  // useActionState 接收一个 action 函数和初始状态
  // 返回 [state, action, isPending]
  const [error, submitAction, isPending] = useActionState(
    async (_previousState: string | null, formData: FormData) => {
      const name = formData.get('name') as string;
      const error = await updateName(name);
      if (error) {
        return error; // 返回错误信息
      }
      // 成功处理
      alert(`名称已更新为: ${name}`);
      return null;
    },
    null // 初始状态
  );

  return (
    <div className="demo-section">
      <h3>1. useActionState Hook</h3>
      <p className="description">
        useActionState 是 React 19 新增的 Hook，用于简化表单操作。
        它自动处理 pending 状态和错误返回。
      </p>

      <form action={submitAction} className="form-demo">
        <input
          type="text"
          name="name"
          placeholder="输入新名称"
          className="input-field"
        />
        <button
          type="submit"
          disabled={isPending}
          className="submit-btn"
        >
          {isPending ? '更新中...' : '更新名称'}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}

// ========== 示例 2: 使用 useTransition ==========
function UseTransitionDemo() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    // startTransition 现在支持异步函数
    startTransition(async () => {
      const error = await updateName(name);
      if (error) {
        setError(error);
        return;
      }
      setError(null);
      alert(`名称已更新为: ${name}`);
      setName('');
    });
  };

  return (
    <div className="demo-section">
      <h3>2. useTransition 支持异步函数</h3>
      <p className="description">
        React 19 中 useTransition 的 startTransition 可以直接包裹异步函数，
        自动追踪异步操作的 pending 状态。
      </p>

      <div className="form-demo">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入新名称"
          className="input-field"
        />
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="submit-btn"
        >
          {isPending ? '更新中...' : '更新名称'}
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

// ========== 主组件 ==========
export default function ActionsDemo() {
  return (
    <div className="demo-container">
      <h2>React 19 Actions 演示</h2>
      <p className="intro">
        Actions 是 React 19 中处理异步数据变更的新方式。
        它可以自动管理 pending 状态、错误处理和乐观更新。
      </p>

      <UseActionStateDemo />
      <UseTransitionDemo />

      <div className="feature-list">
        <h4>Actions 的核心特性：</h4>
        <ul>
          <li><strong>Pending 状态</strong> - 自动追踪异步操作的进行状态</li>
          <li><strong>错误处理</strong> - 内置错误边界支持</li>
          <li><strong>乐观更新</strong> - 配合 useOptimistic 实现即时反馈</li>
          <li><strong>表单集成</strong> - 原生支持 form action 属性</li>
        </ul>
      </div>
    </div>
  );
}
