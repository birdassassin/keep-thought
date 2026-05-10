/**
 * React 19 use() API 演示
 * use() 是一个新的 API，用于在渲染时读取资源（Promise 或 Context）
 * 与 Hooks 不同，use() 可以在条件语句中使用
 */

import { use, Suspense, useState, createContext } from 'react';

// ========== 示例 1: use() 读取 Promise ==========

// 模拟异步获取数据
function fetchUserData(userId: number): Promise<{ id: number; name: string; email: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        name: `用户 ${userId}`,
        email: `user${userId}@example.com`
      });
    }, 1500);
  });
}

// 使用 use() 读取 Promise 的组件
function UserCard({ userPromise }: { userPromise: Promise<{ id: number; name: string; email: string }> }) {
  // use() 会暂停组件渲染，直到 Promise resolve
  // 这必须在 Suspense 边界内使用
  const user = use(userPromise);

  return (
    <div className="user-card">
      <h4>{user.name}</h4>
      <p>ID: {user.id}</p>
      <p>邮箱: {user.email}</p>
    </div>
  );
}

// ========== 示例 2: use() 读取 Context（支持条件渲染） ==========

const ThemeContext = createContext<'light' | 'dark'>('light');

function ConditionalThemeDisplay({ show }: { show: boolean }) {
  // 如果不显示，提前返回
  if (!show) {
    return <p>主题显示已关闭</p>;
  }

  // use() 可以在条件语句后使用！
  // 这是 useContext 做不到的
  const theme = use(ThemeContext);

  return (
    <div className={`theme-box ${theme}`}>
      <p>当前主题: {theme === 'light' ? '☀️ 亮色' : '🌙 暗色'}</p>
    </div>
  );
}

// ========== 主组件 ==========
export default function UseDemo() {
  const [userId, setUserId] = useState(1);
  const [showTheme, setShowTheme] = useState(true);

  // 创建 Promise - 注意：实际项目中应该使用缓存或框架提供的方案
  const userPromise = fetchUserData(userId);

  return (
    <div className="demo-container">
      <h2>React 19 use() API 演示</h2>
      <p className="intro">
        use() 是 React 19 引入的新 API，用于在渲染时读取资源。
        与 Hooks 最大的不同是：<strong>use() 可以在条件语句中使用！</strong>
      </p>

      {/* 示例 1: use() 读取 Promise */}
      <div className="demo-section">
        <h3>1. use() 读取 Promise</h3>
        <p className="description">
          use() 可以读取 Promise，组件会暂停直到 Promise 完成。
          需要配合 Suspense 使用。
        </p>

        <div className="controls">
          <button
            onClick={() => setUserId(prev => prev + 1)}
            className="submit-btn"
          >
            加载下一个用户
          </button>
        </div>

        <Suspense fallback={<div className="loading">加载用户数据中...</div>}>
          <UserCard userPromise={userPromise} />
        </Suspense>
      </div>

      {/* 示例 2: use() 读取 Context */}
      <div className="demo-section">
        <h3>2. use() 读取 Context（支持条件渲染）</h3>
        <p className="description">
          use() 可以替代 useContext，而且可以在条件语句后使用，
          打破了 "Hooks 必须在顶层调用" 的限制。
        </p>

        <div className="controls">
          <button
            onClick={() => setShowTheme(prev => !prev)}
            className="submit-btn"
          >
            {showTheme ? '隐藏主题' : '显示主题'}
          </button>
        </div>

        <ThemeContext.Provider value="dark">
          <ConditionalThemeDisplay show={showTheme} />
        </ThemeContext.Provider>
      </div>

      <div className="comparison-table">
        <h4>use() vs useContext 对比：</h4>
        <table>
          <thead>
            <tr>
              <th>特性</th>
              <th>use()</th>
              <th>useContext</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>读取 Promise</td>
              <td>✅ 支持</td>
              <td>❌ 不支持</td>
            </tr>
            <tr>
              <td>读取 Context</td>
              <td>✅ 支持</td>
              <td>✅ 支持</td>
            </tr>
            <tr>
              <td>条件使用</td>
              <td>✅ 可以</td>
              <td>❌ 不可以</td>
            </tr>
            <tr>
              <td>循环中使用</td>
              <td>✅ 可以</td>
              <td>❌ 不可以</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="note">
        <strong>注意：</strong>
        use() 读取的 Promise 必须由 Suspense 兼容的库或框架提供缓存支持。
        在组件中直接创建的 Promise 会导致无限循环。
      </div>
    </div>
  );
}
