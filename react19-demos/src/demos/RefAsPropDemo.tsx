/**
 * React 19 ref 作为 prop 演示
 * 在 React 19 中，ref 可以直接作为 prop 传递，不再需要 forwardRef
 */

import { useRef, useState } from 'react';

// ========== React 19 新写法：ref 直接作为 prop ==========
// 不再需要 forwardRef 包裹！
interface InputProps {
  placeholder?: string;
  ref?: React.Ref<HTMLInputElement>;
  onChange?: (value: string) => void;
}

function ModernInput({ placeholder, ref, onChange }: InputProps) {
  return (
    <input
      ref={ref}
      type="text"
      placeholder={placeholder}
      className="modern-input"
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}

// ========== 带自定义方法的组件 ==========
interface CounterRef {
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  getValue: () => number;
}

interface CounterProps {
  ref?: React.Ref<CounterRef>;
  initialValue?: number;
}

function Counter({ ref, initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  // 使用 useImperativeHandle 的简化模式
  // 在 React 19 中，ref 直接作为 prop 可用
  if (ref && 'current' in ref) {
    (ref as React.MutableRefObject<CounterRef>).current = {
      increment: () => setCount(c => c + 1),
      decrement: () => setCount(c => c - 1),
      reset: () => setCount(initialValue),
      getValue: () => count
    };
  }

  return (
    <div className="counter-display">
      <span className="count-value">{count}</span>
    </div>
  );
}

// ========== 旧写法对比（使用 forwardRef）==========
import { forwardRef } from 'react';

const OldStyleInput = forwardRef<HTMLInputElement, { placeholder?: string }>(
  ({ placeholder }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        className="old-input"
      />
    );
  }
);
OldStyleInput.displayName = 'OldStyleInput';

// ========== 主组件 ==========
export default function RefAsPropDemo() {
  const modernInputRef = useRef<HTMLInputElement>(null);
  const counterRef = useRef<CounterRef>(null);
  const [inputValue, setInputValue] = useState('');

  const focusModernInput = () => {
    modernInputRef.current?.focus();
  };

  return (
    <div className="demo-container">
      <h2>React 19 ref 作为 prop 演示</h2>
      <p className="intro">
        React 19 最大的简化之一：<strong>ref 可以直接作为 prop 传递</strong>，
        不再需要 forwardRef 包裹。这让代码更简洁，类型定义更清晰。
      </p>

      {/* 示例 1: 现代写法 */}
      <div className="demo-section">
        <h3>1. React 19 新写法（推荐）</h3>
        <p className="description">
          直接将 ref 作为 prop 传递，代码更简洁
        </p>

        <div className="code-block">
          <pre>{`// React 19 - 不再需要 forwardRef
function Input({ placeholder, ref }) {
  return <input ref={ref} placeholder={placeholder} />;
}

// 使用
<Input ref={inputRef} placeholder="输入内容" />`}</pre>
        </div>

        <div className="demo-area">
          <ModernInput
            ref={modernInputRef}
            placeholder="这是一个现代风格的输入框"
            onChange={setInputValue}
          />
          <button onClick={focusModernInput} className="action-btn">
            聚焦输入框
          </button>
          <p className="value-display">输入值: {inputValue || '(空)'}</p>
        </div>
      </div>

      {/* 示例 2: 命令式句柄 */}
      <div className="demo-section">
        <h3>2. 配合命令式句柄使用</h3>
        <p className="description">
          ref 配合自定义方法，实现命令式 API
        </p>

        <div className="demo-area">
          <Counter ref={counterRef} initialValue={10} />
          <div className="button-group">
            <button
              onClick={() => counterRef.current?.decrement()}
              className="action-btn"
            >
              -1
            </button>
            <button
              onClick={() => counterRef.current?.increment()}
              className="action-btn"
            >
              +1
            </button>
            <button
              onClick={() => counterRef.current?.reset()}
              className="action-btn"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 示例 3: 旧写法对比 */}
      <div className="demo-section">
        <h3>3. 旧写法对比（forwardRef）</h3>
        <p className="description">
          以前需要使用 forwardRef，代码更冗长
        </p>

        <div className="code-block old-code">
          <pre>{`// React 18 及以前 - 需要 forwardRef
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});
Input.displayName = 'Input'; // 还需要手动设置 displayName`}</pre>
        </div>

        <OldStyleInput placeholder="旧写法输入框" />
      </div>

      <div className="migration-guide">
        <h4>迁移指南：</h4>
        <ul>
          <li>
            <strong>新组件</strong> - 直接使用 ref prop，无需 forwardRef
          </li>
          <li>
            <strong>现有组件</strong> - React 团队将提供 codemod 自动迁移
          </li>
          <li>
            <strong>类组件</strong> - 类组件的 ref 仍然引用组件实例，不受影响
          </li>
        </ul>
        <p className="note">
          注意：forwardRef 仍然可用，但未来版本将被弃用并移除。
        </p>
      </div>
    </div>
  );
}
