/**
 * React 19.1 & 19.2 新特性补充示例
 *
 * 本文件展示 React 19.1（2025年3月）和 React 19.2（2025年10月）中引入的新特性。
 * 面向新手教学，每个特性都附有详细的中文注释和使用场景说明。
 *
 * 目录：
 *   一、React 19.1 新特性
 *     1. Owner Stack —— 组件所有者链追踪
 *     2. Suspense 修复 —— 改进 Suspense 边界行为
 *
 *   二、React 19.2 新特性
 *     1. <Activity> 组件 —— 可控制和优先级的活动切换
 *     2. useEffectEvent —— 提取非响应式逻辑
 *     3. cacheSignal —— RSC 中检测 cache() 生命周期结束
 *     4. Performance Tracks —— Chrome DevTools 性能分析集成
 *     5. Partial Pre-rendering (PPR) —— 部分预渲染
 *     6. useId 前缀更新 —— 从 `:r:` 改为 `_r_`
 *     7. eslint-plugin-react-hooks v6 —— 支持 flat config
 *     8. SSR Suspense 批量显示 —— 优化流式渲染体验
 */

import { useState, useEffect, useId, Suspense, createContext, useContext, useCallback } from 'react';

// ============================================================================
// 第一部分：React 19.1 新特性（2025年3月）
// ============================================================================

// --------------------------------------------------------------------------
// 1. Owner Stack —— 组件所有者链追踪
// --------------------------------------------------------------------------
// Owner Stack 是 React 19.1 在内部引入的调试能力改进。
// React 现在可以追踪组件的"所有者"（Owner）链，即"是谁渲染了这个组件"。
// 这在 React DevTools 中提供了更好的调试信息，帮助开发者理解组件的渲染来源。
//
// 【什么是 Owner Stack？】
// 在 React 中，每个组件都有一个"所有者"，即渲染它的父组件。
// Owner Stack 就是这条所有者链的完整记录。
// 例如：App -> Page -> UserCard -> Avatar
// 当 Avatar 出现问题时，你可以通过 Owner Stack 快速定位是哪个父组件触发了渲染。
//
// 【使用场景】
// - 调试不必要的重渲染
// - 追踪组件的渲染来源
// - 在大型项目中快速定位问题组件
//
// 【注意】Owner Stack 不需要你编写任何额外代码，它是 React 内部的改进，
// 你只需要更新到 React 19.1 并在 React DevTools 中查看即可。

/**
 * Owner Stack 演示组件
 *
 * 这个组件演示了 Owner Stack 的概念。
 * 在 React DevTools 中，你可以看到每个组件的所有者链。
 */
function OwnerStackDemo() {
  return (
    <div className="demo-section">
      <h3>1. Owner Stack —— 组件所有者链追踪</h3>
      <p className="description">
        Owner Stack 是 React 19.1 引入的内部改进，让 React 能够追踪组件的"所有者"链。
        这在 React DevTools 中提供了更好的调试信息，帮助你理解组件的渲染来源。
      </p>

      <div className="code-block">
        <p className="code-comment">// Owner Stack 示例组件树：</p>
        <p className="code-comment">// App → OwnerStackDemo → ParentComponent → ChildComponent</p>
        <p className="code-comment">// </p>
        <p className="code-comment">// 在 React DevTools 中，你可以看到每个组件的完整所有者链，</p>
        <p className="code-comment">// 帮助你快速定位"是谁渲染了这个组件"。</p>
        <p className="code-comment">// </p>
        <p className="code-comment">// 无需编写额外代码，更新到 React 19.1 后自动生效。</p>
      </div>

      {/* 模拟一个深层嵌套的组件树，用于演示 Owner Stack */}
      <div className="nested-demo">
        <ParentComponent />
      </div>

      <div className="note">
        <strong>提示：</strong>
        Owner Stack 是 React 内部的调试改进，不需要你编写任何额外代码。
        更新到 React 19.1 后，在 React DevTools 中即可查看组件的所有者链信息。
      </div>
    </div>
  );
}

/** 父组件 —— 在 Owner Stack 中会显示为 ChildComponent 的所有者 */
function ParentComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="owner-parent">
      <p>父组件 (Owner Stack 中会显示为子组件的所有者)</p>
      <button className="submit-btn" onClick={() => setCount(c => c + 1)}>
        点击触发重渲染 (次数: {count})
      </button>
      <ChildComponent />
    </div>
  );
}

/** 子组件 —— 在 Owner Stack 中可以看到它的所有者是 ParentComponent */
function ChildComponent() {
  return (
    <div className="owner-child">
      <p>子组件 —— 查看 React DevTools 中的 Owner Stack 信息</p>
      <p className="code-comment">在 DevTools 中，你会看到此组件的所有者链：</p>
      <p className="code-comment">OwnerStackDemo → ParentComponent → ChildComponent</p>
    </div>
  );
}

// --------------------------------------------------------------------------
// 2. Suspense 修复 —— 改进 Suspense 边界行为
// --------------------------------------------------------------------------
// React 19.1 修复了 Suspense 的多个已知问题，改进了 Suspense 边界的行为：
//
// 【修复内容】
// - 修复了 Suspense 边界在特定条件下的闪烁问题
// - 改进了嵌套 Suspense 边界的 fallback 显示逻辑
// - 修复了 Suspense 与 use() 配合使用时的边界情况
// - 优化了 Suspense 在并发模式下的恢复行为
//
// 【使用场景】
// 当你在应用中使用多个嵌套的 Suspense 边界时，
// React 19.1 的修复确保了 fallback 的显示和恢复更加稳定和可预测。

/**
 * Suspense 修复演示组件
 *
 * 展示 React 19.1 中 Suspense 边界行为的改进。
 */
function SuspenseFixDemo() {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="demo-section">
      <h3>2. Suspense 修复 —— 改进 Suspense 边界行为</h3>
      <p className="description">
        React 19.1 修复了多个 Suspense 相关问题，包括嵌套 Suspense 边界的
        fallback 显示逻辑、闪烁问题，以及与 use() 配合使用时的边界情况。
      </p>

      <div className="controls">
        <button
          className="submit-btn"
          onClick={() => setShowContent(prev => !prev)}
        >
          {showContent ? '隐藏内容（触发 Suspense）' : '显示内容'}
        </button>
      </div>

      {/* 外层 Suspense 边界 */}
      <Suspense fallback={<div className="loading">外层加载中...</div>}>
        {showContent ? (
          <div className="suspense-content">
            <p>外层内容已加载！</p>

            {/* 内层 Suspense 边界 —— 19.1 改进了嵌套 Suspense 的行为 */}
            <Suspense fallback={<div className="loading">内层加载中...</div>}>
              <InnerSuspenseContent />
            </Suspense>
          </div>
        ) : (
          <p className="hint-text">点击按钮加载内容，观察 Suspense 行为</p>
        )}
      </Suspense>

      <div className="note">
        <strong>改进点：</strong>
        在 React 19.1 中，嵌套的 Suspense 边界在恢复时更加稳定，
        不会出现 fallback 闪烁的问题。内层 Suspense 的 fallback
        会在外层内容准备好后正确显示和隐藏。
      </div>
    </div>
  );
}

/** 内层 Suspense 内容组件 */
function InnerSuspenseContent() {
  return (
    <div className="inner-content">
      <p>内层内容也加载完成了！</p>
      <p className="code-comment">
        在 React 19.1 之前，嵌套 Suspense 可能会出现闪烁问题。
        19.1 修复了这些问题，使行为更加可预测。
      </p>
    </div>
  );
}


// ============================================================================
// 第二部分：React 19.2 新特性（2025年10月）
// ============================================================================

// --------------------------------------------------------------------------
// 1. <Activity> 组件 —— 可控制和优先级的活动切换
// --------------------------------------------------------------------------
// <Activity> 是 React 19.2 引入的新组件，用于将应用拆分为可控制和优先级的"活动"。
// 它是条件渲染的替代方案，提供了更好的性能和用户体验。
//
// 【核心概念】
// - mode="visible"：正常显示子组件，所有 effects 正常运行
// - mode="hidden"：隐藏子组件，卸载所有 effects，延迟状态更新
//
// 【与条件渲染的区别】
// 条件渲染 {isVisible && <Page />} 在隐藏时会完全卸载组件，丢失所有状态。
// <Activity> 在 hidden 模式下会保留组件状态，只是暂停 effects 和更新。
//
// 【使用场景】
// - Tab 切换：切换标签页时保留其他标签的状态
// - 模态框：隐藏模态框时保留其内部状态
// - 路由切换：在页面间切换时保留未激活页面的状态

/**
 * Activity 组件演示
 *
 * 注意：<Activity> 是 React 19.2 中新增的实验性 API。
 * 以下代码展示了其预期用法。如果你的 React 版本不支持，
 * 可以使用条件渲染作为替代方案。
 */
function ActivityDemo() {
  // 控制两个"活动"页面的可见性
  const [activeTab, setActiveTab] = useState<'pageA' | 'pageB'>('pageA');

  return (
    <div className="demo-section">
      <h3>1. &lt;Activity&gt; 组件 —— 可控制和优先级的活动切换</h3>
      <p className="description">
        &lt;Activity&gt; 是 React 19.2 引入的新组件，用于替代条件渲染。
        它可以在隐藏子组件时保留状态、卸载 effects、延迟更新，
        从而提供更好的性能和用户体验。
      </p>

      <div className="code-block">
        <p className="code-comment">{'// 之前：条件渲染（隐藏时组件会被卸载，状态丢失）'}</p>
        <p className="code">{'{isVisible && <Page />}'}</p>
        <br />
        <p className="code-comment">{'// 之后：使用 Activity（隐藏时保留状态，暂停 effects）'}</p>
        <p className="code">{'<Activity mode={isVisible ? "visible" : "hidden"}>'}</p>
        <p className="code">{'  <Page />'}</p>
        <p className="code">{'</Activity>'}</p>
      </div>

      {/* Tab 切换按钮 */}
      <div className="tab-buttons">
        <button
          className={`submit-btn ${activeTab === 'pageA' ? 'active' : ''}`}
          onClick={() => setActiveTab('pageA')}
        >
          页面 A
        </button>
        <button
          className={`submit-btn ${activeTab === 'pageB' ? 'active' : ''}`}
          onClick={() => setActiveTab('pageB')}
        >
          页面 B
        </button>
      </div>

      <div className="activity-demo-area">
        {/* ============================================================
         * 实际使用 <Activity> 的写法（React 19.2+）：
         * ============================================================
         *
         * <Activity mode={activeTab === 'pageA' ? 'visible' : 'hidden'}>
         *   <PageA />
         * </Activity>
         * <Activity mode={activeTab === 'pageB' ? 'visible' : 'hidden'}>
         *   <PageB />
         * </Activity>
         *
         * ============================================================
         * 以下使用条件渲染模拟 Activity 的行为，以便在当前版本运行：
         * ============================================================ */}
        <ActivitySimulationPageA isActive={activeTab === 'pageA'} />
        <ActivitySimulationPageB isActive={activeTab === 'pageB'} />
      </div>

      <div className="comparison-table">
        <h4>条件渲染 vs Activity 对比：</h4>
        <table>
          <thead>
            <tr>
              <th>特性</th>
              <th>条件渲染 {'{condition && <Comp />'}'}</th>
              <th>{'<Activity mode="hidden">'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>隐藏时组件状态</td>
              <td>丢失（组件被卸载）</td>
              <td>保留</td>
            </tr>
            <tr>
              <td>隐藏时 Effects</td>
              <td>被清理</td>
              <td>被卸载（暂停）</td>
            </tr>
            <tr>
              <td>隐藏时状态更新</td>
              <td>不适用</td>
              <td>延迟处理</td>
            </tr>
            <tr>
              <td>重新显示时</td>
              <td>重新挂载，重新初始化</td>
              <td>恢复，保留之前状态</td>
            </tr>
            <tr>
              <td>性能开销</td>
              <td>卸载/重新挂载开销大</td>
              <td>切换开销小</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 模拟 Activity 行为的页面 A
 *
 * 在真实的 React 19.2 环境中，这会被 <Activity> 包裹。
 * 当 mode="hidden" 时，组件状态保留但 effects 被卸载。
 */
function ActivitySimulationPageA({ isActive }: { isActive: boolean }) {
  const [inputValue, setInputValue] = useState('');
  const [effectLog, setEffectLog] = useState<string[]>([]);

  useEffect(() => {
    if (isActive) {
      setEffectLog(prev => [...prev, `Effect 运行于: ${new Date().toLocaleTimeString()}`]);
    }
    // 当 isActive 变为 false 时，清理 effect（模拟 Activity hidden 模式）
    return () => {
      if (!isActive) {
        setEffectLog(prev => [...prev, `Effect 清理于: ${new Date().toLocaleTimeString()}`]);
      }
    };
  }, [isActive]);

  return (
    <div className={`activity-page ${isActive ? 'visible' : 'hidden'}`}>
      <h4>页面 A {isActive ? '(可见)' : '(隐藏 - Activity hidden 模式)'}</h4>
      <p className="description">
        {isActive
          ? '当前为 visible 模式：组件正常显示，effects 正常运行。'
          : '当前为 hidden 模式：组件隐藏，effects 已卸载，但输入框的状态被保留。'}
      </p>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="输入一些文字..."
        className="input-field"
        disabled={!isActive}
      />
      <p className="hint-text">
        输入框内容: "{inputValue}" —— 切换到页面 B 再切回来，状态仍然保留！
      </p>
      <div className="effect-log">
        <p><strong>Effect 日志：</strong></p>
        {effectLog.map((log, i) => (
          <p key={i} className="log-entry">{log}</p>
        ))}
      </div>
    </div>
  );
}

/**
 * 模拟 Activity 行为的页面 B
 */
function ActivitySimulationPageB({ isActive }: { isActive: boolean }) {
  const [count, setCount] = useState(0);

  return (
    <div className={`activity-page ${isActive ? 'visible' : 'hidden'}`}>
      <h4>页面 B {isActive ? '(可见)' : '(隐藏 - Activity hidden 模式)'}</h4>
      <p className="description">
        {isActive
          ? '当前为 visible 模式：组件正常显示。'
          : '当前为 hidden 模式：组件隐藏，但计数器状态被保留。'}
      </p>
      <div className="controls">
        <button
          className="submit-btn"
          onClick={() => setCount(c => c + 1)}
          disabled={!isActive}
        >
          计数 +1
        </button>
        <span className="count-display">当前计数: {count}</span>
      </div>
      <p className="hint-text">
        切换到页面 A 再切回来，计数器不会被重置！
      </p>
    </div>
  );
}

// --------------------------------------------------------------------------
// 2. useEffectEvent —— 提取非响应式逻辑
// --------------------------------------------------------------------------
// useEffectEvent 是 React 19.2 引入的新 Hook，用于从 useEffect 中
// 提取"非响应式"的逻辑。它返回一个稳定的函数引用，该函数总是能访问
// 最新的 props 和 state，但不会导致 effect 重新执行。
//
// 【核心概念】
// - useEffectEvent 返回的函数可以读取最新的 props/state
// - 但它不是 effect 的依赖，不会触发 effect 重新运行
// - 这解决了"想要在 effect 中使用最新值，但不想 effect 重新执行"的矛盾
//
// 【使用场景】
// - 在 effect 中调用使用了最新 props 的回调函数
// - 事件处理函数中需要访问最新状态，但不希望触发 effect
// - 订阅/取消订阅模式中，回调需要访问最新的 props

/**
 * useEffectEvent 演示组件
 *
 * 注意：useEffectEvent 是 React 19.2 中新增的 API。
 * 以下代码展示了其预期用法。
 */
function UseEffectEventDemo() {
  const [roomId, setRoomId] = useState('general');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notificationLog, setNotificationLog] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // 模拟显示通知的函数
  const showNotification = useCallback((message: string, currentTheme: string) => {
    const logEntry = `[${currentTheme}] ${message} (${new Date().toLocaleTimeString()})`;
    setNotificationLog(prev => [logEntry, ...prev].slice(0, 10));
  }, []);

  // ============================================================
  // useEffectEvent 的预期用法（React 19.2+）：
  // ============================================================
  //
  // // 使用 useEffectEvent 创建一个"事件函数"
  // // 这个函数总是能访问最新的 theme，但不会触发 effect 重新执行
  // const onConnected = useEffectEvent(() => {
  //   showNotification('已连接到房间!', theme);
  // });
  //
  // useEffect(() => {
  //   const connection = createConnection(serverUrl, roomId);
  //   connection.on('connected', () => onConnected());  // 使用事件函数
  //   connection.connect();
  //   return () => connection.disconnect();
  // }, [roomId]);  // 注意：theme 不再是依赖！
  //
  // ============================================================
  // 以下使用模拟代码展示 useEffectEvent 的行为：
  // ============================================================

  // 模拟连接/断开房间
  useEffect(() => {
    if (!isConnected) return;

    // 模拟连接事件
    const logEntry = `[${theme}] 已连接到房间: ${roomId} (${new Date().toLocaleTimeString()})`;
    setNotificationLog(prev => [logEntry, ...prev].slice(0, 10));

    // 模拟定时发送消息（使用最新的 theme）
    const timer = setInterval(() => {
      const msg = `[${theme}] 房间 ${roomId} 的心跳消息 (${new Date().toLocaleTimeString()})`;
      setNotificationLog(prev => [msg, ...prev].slice(0, 10));
    }, 3000);

    return () => clearInterval(timer);
    // 注意：在真实的 useEffectEvent 用法中，theme 不需要作为依赖
    // 这里为了在模拟环境中正确显示 theme，暂时保留
  }, [roomId, theme, isConnected]);

  const handleConnect = () => {
    setIsConnected(prev => !prev);
    if (isConnected) {
      setNotificationLog(prev => [`已断开连接 (${new Date().toLocaleTimeString()})`, ...prev].slice(0, 10));
    }
  };

  return (
    <div className="demo-section">
      <h3>2. useEffectEvent —— 提取非响应式逻辑</h3>
      <p className="description">
        useEffectEvent 用于从 useEffect 中提取"非响应式"的逻辑。
        它返回一个稳定的函数引用，总是能访问最新的 props/state，
        但不会导致 effect 重新执行。
      </p>

      <div className="code-block">
        <p className="code-comment">{'// 使用 useEffectEvent 提取非响应式逻辑'}</p>
        <p className="code">{'const onConnected = useEffectEvent(() => {'}</p>
        <p className="code">{'  showNotification(\'已连接!\', theme);'}</p>
        <p className="code">{'});'}</p>
        <br />
        <p className="code">{'useEffect(() => {'}</p>
        <p className="code">{'  const connection = createConnection(url, roomId);'}</p>
        <p className="code">{'  connection.on(\'connected\', () => onConnected());'}</p>
        <p className="code">{'  connection.connect();'}</p>
        <p className="code">{'  return () => connection.disconnect();'}</p>
        <p className="code">{'}}, [roomId]); // theme 不再是依赖！'}</p>
      </div>

      <div className="controls">
        <div className="control-row">
          <label>房间 ID：</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="input-field"
          >
            <option value="general">general</option>
            <option value="random">random</option>
            <option value="music">music</option>
          </select>
        </div>
        <div className="control-row">
          <label>主题：</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            className="input-field"
          >
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </div>
        <button className="submit-btn" onClick={handleConnect}>
          {isConnected ? '断开连接' : '连接'}
        </button>
      </div>

      <div className="effect-log">
        <p><strong>通知日志（注意切换主题后新消息的主题变化）：</strong></p>
        {notificationLog.length === 0 ? (
          <p className="hint-text">暂无通知</p>
        ) : (
          notificationLog.map((log, i) => (
            <p key={i} className="log-entry">{log}</p>
          ))
        )}
      </div>

      <div className="comparison-table">
        <h4>useEffectEvent vs 传统方式对比：</h4>
        <table>
          <thead>
            <tr>
              <th>方式</th>
              <th>访问最新值</th>
              <th>触发 effect</th>
              <th>代码复杂度</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>直接在依赖中添加</td>
              <td>是</td>
              <td>是（每次值变化都触发）</td>
              <td>简单</td>
            </tr>
            <tr>
              <td>useRef 保存最新值</td>
              <td>是（通过 ref）</td>
              <td>否</td>
              <td>较复杂</td>
            </tr>
            <tr>
              <td>useEffectEvent</td>
              <td>是（自动）</td>
              <td>否</td>
              <td>简单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 3. cacheSignal —— RSC 中检测 cache() 生命周期结束
// --------------------------------------------------------------------------
// cacheSignal 是 React 19.2 为 React Server Components (RSC) 引入的 API，
// 用于检测 cache() 函数创建的缓存何时过期或被清除。
//
// 【核心概念】
// - 在 RSC 中，cache() 用于在服务器端缓存数据获取的结果
// - cacheSignal 允许你监听缓存的生命周期事件
// - 当缓存被清除（例如因为重新验证）时，cacheSignal 会通知你
//
// 【使用场景】
// - 在服务器组件中检测缓存是否仍然有效
// - 在缓存过期时执行清理操作
// - 与 Incremental Static Regeneration (ISR) 配合使用
//
// 【注意】此 API 仅在 React Server Components 环境中可用。

/**
 * cacheSignal 演示组件
 *
 * 注意：cacheSignal 是 React 19.2 中仅在 RSC 环境下可用的 API。
 * 以下代码展示了其预期用法，无法在客户端组件中直接运行。
 */
function CacheSignalDemo() {
  return (
    <div className="demo-section">
      <h3>3. cacheSignal —— RSC 中检测 cache() 生命周期结束</h3>
      <p className="description">
        cacheSignal 是 React 19.2 为 React Server Components (RSC) 引入的 API，
        用于检测 cache() 函数创建的缓存何时过期或被清除。
        此 API 仅在服务器端可用。
      </p>

      <div className="code-block">
        <p className="code-comment">{'// 在 React Server Component 中使用 cacheSignal'}</p>
        <p className="code">{'import { cache, cacheSignal } from "react";'}</p>
        <br />
        <p className="code-comment">{'// 创建一个缓存的数据获取函数'}</p>
        <p className="code">{'const getUser = cache(async (id: string) => {'}</p>
        <p className="code">{'  const res = await fetch(`/api/users/${id}`);'}</p>
        <p className="code">{'  return res.json();'}</p>
        <p className="code">{'});'}</p>
        <br />
        <p className="code-comment">{'// 使用 cacheSignal 检测缓存生命周期'}</p>
        <p className="code">{'async function UserProfile({ userId }: { userId: string }) {'}</p>
        <p className="code">{'  const signal = cacheSignal(getUser);'}</p>
        <p className="code">{'  const user = await getUser(userId);'}</p>
        <br />
        <p className="code-comment">{'  // 当缓存被清除时，signal 会通知'}</p>
        <p className="code">{'  signal.addEventListener("expire", () => {'}</p>
        <p className="code">{'    console.log("用户数据缓存已过期");'}</p>
        <p className="code">{'  });'}</p>
        <br />
        <p className="code">{'  return <div>{user.name}</div>;'}</p>
        <p className="code">{'}'}</p>
      </div>

      <div className="note">
        <strong>注意：</strong>
        cacheSignal 仅在 React Server Components (RSC) 环境中可用，
        不能在客户端组件中使用。它需要配合 Next.js 或其他支持 RSC 的框架。
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 4. Performance Tracks —— Chrome DevTools 性能分析集成
// --------------------------------------------------------------------------
// Performance Tracks 是 React 19.2 与 Chrome DevTools 的集成功能，
// 它允许在 Chrome DevTools 的 Performance 面板中查看 React 组件的
// 渲染性能数据，以"轨道"（Track）的形式展示。
//
// 【核心概念】
// - 在 Chrome DevTools Performance 面板中新增 React 专用轨道
// - 可以看到每个组件的渲染时间、原因和频率
// - 支持按组件类型、渲染原因等维度筛选
//
// 【使用场景】
// - 分析页面加载性能
// - 找出导致不必要重渲染的组件
// - 优化大型应用的渲染性能
//
// 【如何使用】
// 1. 打开 Chrome DevTools
// 2. 切换到 Performance 面板
// 3. 点击录制按钮
// 4. 在应用中执行操作
// 5. 停止录制，查看 React Performance Tracks

/**
 * Performance Tracks 演示组件
 *
 * 此组件提供了一个可以用来测试 Performance Tracks 的交互界面。
 */
function PerformanceTracksDemo() {
  const [items, setItems] = useState<string[]>([]);
  const [renderCount, setRenderCount] = useState(0);

  // 每次渲染时增加计数（用于在 Performance Tracks 中观察重渲染）
  useEffect(() => {
    setRenderCount(c => c + 1);
  });

  const addItem = () => {
    setItems(prev => [...prev, `项目 ${prev.length + 1}`]);
  };

  const removeItem = () => {
    setItems(prev => prev.slice(0, -1));
  };

  const shuffleItems = () => {
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="demo-section">
      <h3>4. Performance Tracks —— Chrome DevTools 性能分析集成</h3>
      <p className="description">
        Performance Tracks 是 React 19.2 与 Chrome DevTools 的集成功能。
        在 Chrome DevTools Performance 面板中，你可以看到 React 组件的
        渲染性能数据，以"轨道"的形式展示每个组件的渲染时间和原因。
      </p>

      <div className="code-block">
        <p className="code-comment">{'// 使用步骤：'}</p>
        <p className="code">{'// 1. 打开 Chrome DevTools'}</p>
        <p className="code">{'// 2. 切换到 Performance 面板'}</p>
        <p className="code">{'// 3. 点击录制按钮'}</p>
        <p className="code">{'// 4. 在应用中执行操作（如点击下方按钮）'}</p>
        <p className="code">{'// 5. 停止录制，查看 React Performance Tracks'}</p>
      </div>

      <div className="controls">
        <button className="submit-btn" onClick={addItem}>添加项目</button>
        <button className="submit-btn" onClick={removeItem}>移除项目</button>
        <button className="submit-btn" onClick={shuffleItems}>随机排序</button>
      </div>

      <p className="hint-text">
        组件渲染次数: {renderCount} —— 在 Performance Tracks 中可以观察每次渲染的详情
      </p>

      <div className="item-list">
        {items.length === 0 ? (
          <p className="hint-text">暂无项目，点击"添加项目"按钮</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="list-item">
              {item}
            </div>
          ))
        )}
      </div>

      <div className="note">
        <strong>提示：</strong>
        要使用 Performance Tracks，请确保你使用的是支持此功能的 Chrome 版本，
        并且 React 已更新到 19.2。在 Performance 面板中录制操作后，
        查看 "React" 轨道以获取详细的渲染信息。
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 5. Partial Pre-rendering (PPR) —— 部分预渲染
// --------------------------------------------------------------------------
// Partial Pre-rendering (PPR) 是 React 19.2 引入的服务端渲染优化技术。
// 它允许你将页面的一部分静态预渲染，另一部分动态流式渲染。
//
// 【核心概念】
// - prerender()：预渲染函数，返回预渲染的静态部分和推迟渲染的动态部分
// - resume()：恢复渲染函数，继续渲染被推迟的动态部分
// - signal：AbortController 的 signal，用于取消预渲染
//
// 【使用场景】
// - 页面有静态 shell 和动态内容（如导航栏是静态的，用户信息是动态的）
// - 需要快速显示静态内容，同时异步加载动态内容
// - 结合 Suspense 实现细粒度的流式渲染
//
// 【注意】PPR 是服务端 API，仅在 RSC 环境中可用。

/**
 * Partial Pre-rendering (PPR) 演示组件
 *
 * 注意：PPR 是 React 19.2 中仅在服务端可用的 API。
 * 以下代码展示了其预期用法。
 */
function PartialPreRenderingDemo() {
  return (
    <div className="demo-section">
      <h3>5. Partial Pre-rendering (PPR) —— 部分预渲染</h3>
      <p className="description">
        Partial Pre-rendering 是 React 19.2 引入的服务端渲染优化技术。
        它允许你将页面的一部分静态预渲染（快速响应），另一部分动态流式渲染。
        这结合了静态生成 (SSG) 和服务器渲染 (SSR) 的优势。
      </p>

      <div className="code-block">
        <p className="code-comment">{'// Partial Pre-rendering 示例（服务端代码）'}</p>
        <p className="code">{'import { prerender, resume } from "react/server";'}</p>
        <br />
        <p className="code-comment">{'// 第一步：预渲染，分离静态和动态部分'}</p>
        <p className="code">{'const controller = new AbortController();'}</p>
        <p className="code">{'const { prelude, postponed } = await prerender(<App />, {'}</p>
        <p className="code">{'  signal: controller.signal,'}</p>
        <p className="code">{'});'}</p>
        <br />
        <p className="code-comment">{'// prelude: 预渲染的静态 HTML（可以立即发送给客户端）'}</p>
        <p className="code-comment">{'// postponed: 被推迟的动态部分的信息'}</p>
        <br />
        <p className="code-comment">{'// 第二步：将 prelude 立即发送给客户端'}</p>
        <p className="code">{'res.write(prelude);'}</p>
        <br />
        <p className="code-comment">{'// 第三步：恢复渲染动态部分（流式传输）'}</p>
        <p className="code">{'const resumeStream = await resume(<App />, postponed);'}</p>
        <p className="code">{'// 将 resumeStream 以流的形式发送给客户端'}</p>
      </div>

      <div className="comparison-table">
        <h4>SSG vs SSR vs PPR 对比：</h4>
        <table>
          <thead>
            <tr>
              <th>特性</th>
              <th>SSG (静态生成)</th>
              <th>SSR (服务器渲染)</th>
              <th>PPR (部分预渲染)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>首次响应速度</td>
              <td>极快（CDN 缓存）</td>
              <td>较慢（每次都计算）</td>
              <td>快（静态部分立即返回）</td>
            </tr>
            <tr>
              <td>数据新鲜度</td>
              <td>低（构建时确定）</td>
              <td>高（每次请求计算）</td>
              <td>高（动态部分实时计算）</td>
            </tr>
            <tr>
              <td>适用场景</td>
              <td>纯静态页面</td>
              <td>高度动态页面</td>
              <td>混合静态/动态页面</td>
            </tr>
            <tr>
              <td>交互性</td>
              <td>需要客户端注水</td>
              <td>需要客户端注水</td>
              <td>渐进式注水</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="note">
        <strong>注意：</strong>
        PPR 是服务端 API，仅在 React Server Components 环境中可用。
        它需要配合 Next.js 或其他支持 RSC 的框架使用。
        在客户端组件中无法直接使用 prerender() 和 resume()。
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 6. useId 前缀更新 —— 从 `:r:` 改为 `_r_`
// --------------------------------------------------------------------------
// React 19.2 更新了 useId 生成的 ID 前缀，从 `:r:` 改为 `_r_`。
//
// 【变更原因】
// - 旧前缀 `:r:` 在某些场景下会导致 CSS 选择器问题
// - 冒号字符在某些 CSS 上下文中需要转义
// - 新前缀 `_r_` 更安全，不需要转义
//
// 【影响范围】
// - 如果你依赖 useId 生成的 ID 的具体格式，需要注意此变更
// - 大多数情况下，这个变更是透明的，不影响正常使用
// - ID 的唯一性保证不变

/**
 * useId 前缀更新演示组件
 *
 * 展示 React 19.2 中 useId 前缀的变化。
 */
function UseIdPrefixDemo() {
  // useId() 生成一个唯一 ID
  // React 19.2 之前: ":r0:", ":r1:", ":r2:" ...
  // React 19.2 之后: "_r0_", "_r1_", "_r2_" ...
  const inputId = useId();
  const labelId = useId();
  const descriptionId = useId();

  return (
    <div className="demo-section">
      <h3>6. useId 前缀更新 —— 从 `:r:` 改为 `_r_`</h3>
      <p className="description">
        React 19.2 将 useId 生成的 ID 前缀从 <code>:r:</code> 改为
        <code>_r_</code>。新前缀更安全，在 CSS 选择器中不需要转义。
      </p>

      <div className="code-block">
        <p className="code-comment">{'// React 19.2 之前生成的 ID 格式：'}</p>
        <p className="code">{'// :r0:, :r1:, :r2:, ...'}</p>
        <br />
        <p className="code-comment">{'// React 19.2 之后生成的 ID 格式：'}</p>
        <p className="code">{'// _r0_, _r1_, _r2_, ...'}</p>
      </div>

      {/* 实际使用 useId 的表单 */}
      <div className="form-demo">
        <div className="form-group">
          <label htmlFor={inputId} id={labelId}>
            用户名（使用 useId 关联 label 和 input）
          </label>
          <input
            id={inputId}
            type="text"
            placeholder="输入用户名"
            className="input-field"
            aria-describedby={descriptionId}
          />
          <p id={descriptionId} className="hint-text">
            这个输入框使用了 useId() 生成的 ID: <code>{inputId}</code>
          </p>
        </div>
      </div>

      <div className="comparison-table">
        <h4>前缀变更对比：</h4>
        <table>
          <thead>
            <tr>
              <th>特性</th>
              <th>旧前缀 (:r:)</th>
              <th>新前缀 (_r_)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>示例 ID</td>
              <td><code>:r0:</code></td>
              <td><code>_r0_</code></td>
            </tr>
            <tr>
              <td>CSS 选择器兼容性</td>
              <td>需要转义: <code>#\:r0\:</code></td>
              <td>直接使用: <code>#_r0_</code></td>
            </tr>
            <tr>
              <td>URL 安全</td>
              <td>需要编码</td>
              <td>安全</td>
            </tr>
            <tr>
              <td>唯一性保证</td>
              <td>是</td>
              <td>是（不变）</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="note">
        <strong>提示：</strong>
        如果你之前在 CSS 中硬编码了 <code>:r:</code> 前缀的选择器，
        需要更新为 <code>_r_</code>。但通常不应该依赖 ID 的具体格式，
        而是应该通过 JavaScript 变量来引用 ID。
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 7. eslint-plugin-react-hooks v6 —— 支持 flat config
// --------------------------------------------------------------------------
// eslint-plugin-react-hooks v6 是配合 React 19.2 发布的 ESLint 插件更新，
// 主要新增了对 ESLint flat config 的支持。
//
// 【什么是 ESLint flat config？】
// ESLint flat config 是 ESLint 的新配置格式（ESLint v9+），
// 使用 eslint.config.js 文件替代传统的 .eslintrc 文件。
//
// 【变更内容】
// - 支持 ESLint flat config 格式
// - 新增对 useEffectEvent 的规则支持
// - 新增对 Activity 组件的规则支持
// - 改进了对 React 19 新 API 的 lint 规则

/**
 * eslint-plugin-react-hooks v6 演示组件
 *
 * 展示 ESLint flat config 的配置方式。
 */
function EslintFlatConfigDemo() {
  return (
    <div className="demo-section">
      <h3>7. eslint-plugin-react-hooks v6 —— 支持 flat config</h3>
      <p className="description">
        eslint-plugin-react-hooks v6 新增了对 ESLint flat config 的支持，
        并添加了对 React 19.2 新 API（useEffectEvent、Activity 等）的 lint 规则。
      </p>

      <div className="code-block">
        <p className="code-comment">{'// ESLint flat config 配置 (eslint.config.js)'}</p>
        <br />
        <p className="code">{'import reactHooks from "eslint-plugin-react-hooks";'}</p>
        <br />
        <p className="code">{'export default ['}</p>
        <p className="code">{'  {'}</p>
        <p className="code">{'    files: ["**/*.{js,jsx,ts,tsx}"],'}</p>
        <p className="code">{'    plugins: {'}</p>
        <p className="code">{'      "react-hooks": reactHooks,'}</p>
        <p className="code">{'    },'}</p>
        <p className="code">{'    rules: {'}</p>
        <p className="code">{'      // React Hooks 规则'}</p>
        <p className="code">{'      "react-hooks/rules-of-hooks": "error",'}</p>
        <p className="code">{'      "react-hooks/exhaustive-deps": "warn",'}</p>
        <br />
        <p className="code">{'      // v6 新增规则'}</p>
        <p className="code">{'      // 自动检测 useEffectEvent 的正确使用'}</p>
        <p className="code">{'      // 自动检测 Activity 的正确使用'}</p>
        <p className="code">{'    },'}</p>
        <p className="code">{'  },'}</p>
        <p className="code">{'];'}</p>
      </div>

      <div className="comparison-table">
        <h4>传统配置 vs Flat Config 对比：</h4>
        <table>
          <thead>
            <tr>
              <th>特性</th>
              <th>传统 .eslintrc</th>
              <th>Flat Config (eslint.config.js)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>配置格式</td>
              <td>JSON / YAML / JS</td>
              <td>ES Module (JS/TS)</td>
            </tr>
            <tr>
              <td>插件加载</td>
              <td>字符串名称 (自动解析)</td>
              <td>显式 import</td>
            </tr>
            <tr>
              <td>配置合并</td>
              <td>extends 链</td>
              <td>数组展开</td>
            </tr>
            <tr>
              <td>ESLint 版本要求</td>
              <td>v8 及以下</td>
              <td>v9+</td>
            </tr>
            <tr>
              <td>TypeScript 支持</td>
              <td>需要额外配置</td>
              <td>原生支持</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// 8. SSR Suspense 批量显示 —— 优化流式渲染体验
// --------------------------------------------------------------------------
// SSR Suspense 批量显示是 React 19.2 对服务端渲染 Suspense 的优化。
// 在之前的版本中，当多个 Suspense 边界同时 resolve 时，
// 它们会逐个显示，导致页面"跳动"。
// React 19.2 会将同时 resolve 的 Suspense 边界批量显示，
// 减少页面跳动，提供更流畅的用户体验。
//
// 【核心概念】
// - 当多个 Suspense fallback 同时完成时，批量替换为实际内容
// - 减少流式渲染过程中的页面跳动（layout shift）
// - 提供更流畅的视觉体验
//
// 【使用场景】
// - 页面有多个异步数据区域
// - 使用流式 SSR 渲染的页面
// - 需要优化 Core Web Vitals 中的 CLS (Cumulative Layout Shift) 指标

/**
 * SSR Suspense 批量显示演示组件
 *
 * 展示 React 19.2 中 SSR Suspense 批量显示的优化效果。
 */
function SsrSuspenseBatchDemo() {
  const [showAll, setShowAll] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleShowAll = () => {
    setShowAll(true);
    setLoadingStep(1);

    // 模拟批量加载：所有内容同时完成
    // 在 React 19.2 的 SSR 中，这些会批量显示而不是逐个显示
    setTimeout(() => setLoadingStep(2), 500);
    setTimeout(() => setLoadingStep(3), 1000);
  };

  return (
    <div className="demo-section">
      <h3>8. SSR Suspense 批量显示 —— 优化流式渲染体验</h3>
      <p className="description">
        React 19.2 优化了 SSR 中 Suspense 边界的显示行为。
        当多个 Suspense 边界同时 resolve 时，它们会被批量显示，
        而不是逐个显示，从而减少页面跳动，提供更流畅的体验。
      </p>

      <div className="code-block">
        <p className="code-comment">{'// React 19.2 之前：'}</p>
        <p className="code-comment">{'// Suspense A resolve → 显示 A → 页面跳动'}</p>
        <p className="code-comment">{'// Suspense B resolve → 显示 B → 页面跳动'}</p>
        <p className="code-comment">{'// Suspense C resolve → 显示 C → 页面跳动'}</p>
        <br />
        <p className="code-comment">{'// React 19.2 之后：'}</p>
        <p className="code-comment">{'// Suspense A, B, C 同时 resolve → 批量显示 → 页面不跳动'}</p>
      </div>

      <div className="controls">
        <button className="submit-btn" onClick={handleShowAll}>
          {showAll ? '重新加载' : '加载所有内容'}
        </button>
      </div>

      {showAll && (
        <div className="ssr-suspense-grid">
          {/* 模拟三个同时加载的 Suspense 边界 */}
          <div className="suspense-card">
            <Suspense fallback={<div className="loading">加载卡片 A...</div>}>
              {loadingStep >= 1 ? (
                <div className="card-content">
                  <h4>卡片 A</h4>
                  <p>内容已加载</p>
                </div>
              ) : (
                <div className="loading">加载卡片 A...</div>
              )}
            </Suspense>
          </div>

          <div className="suspense-card">
            <Suspense fallback={<div className="loading">加载卡片 B...</div>}>
              {loadingStep >= 1 ? (
                <div className="card-content">
                  <h4>卡片 B</h4>
                  <p>内容已加载</p>
                </div>
              ) : (
                <div className="loading">加载卡片 B...</div>
              )}
            </Suspense>
          </div>

          <div className="suspense-card">
            <Suspense fallback={<div className="loading">加载卡片 C...</div>}>
              {loadingStep >= 1 ? (
                <div className="card-content">
                  <h4>卡片 C</h4>
                  <p>内容已加载</p>
                </div>
              ) : (
                <div className="loading">加载卡片 C...</div>
              )}
            </Suspense>
          </div>
        </div>
      )}

      <div className="note">
        <strong>优化效果：</strong>
        在 React 19.2 的 SSR 环境中，当多个 Suspense 边界的数据同时返回时，
        它们的内容会被批量插入到 HTML 中，而不是逐个插入。
        这显著减少了 CLS (Cumulative Layout Shift) 指标，
        提供了更流畅的页面加载体验。
      </div>
    </div>
  );
}


// ============================================================================
// 主组件 —— 整合所有演示
// ============================================================================

/**
 * React19Updates 主组件
 *
 * 整合了 React 19.1 和 19.2 的所有新特性演示。
 * 可以通过下方的导航快速跳转到各个特性的演示区域。
 */
export default function React19Updates() {
  // 控制当前显示的特性部分（用于导航）
  const [activeSection, setActiveSection] = useState<string>('all');

  // 所有特性部分的配置
  const sections = [
    { id: '191-owner-stack', label: '19.1 - Owner Stack', version: '19.1' },
    { id: '191-suspense-fix', label: '19.1 - Suspense 修复', version: '19.1' },
    { id: '192-activity', label: '19.2 - Activity', version: '19.2' },
    { id: '192-use-effect-event', label: '19.2 - useEffectEvent', version: '19.2' },
    { id: '192-cache-signal', label: '19.2 - cacheSignal', version: '19.2' },
    { id: '192-performance-tracks', label: '19.2 - Performance Tracks', version: '19.2' },
    { id: '192-ppr', label: '19.2 - Partial Pre-rendering', version: '19.2' },
    { id: '192-use-id', label: '19.2 - useId 前缀更新', version: '19.2' },
    { id: '192-eslint', label: '19.2 - ESLint flat config', version: '19.2' },
    { id: '192-ssr-suspense', label: '19.2 - SSR Suspense 批量显示', version: '19.2' },
  ];

  // 根据选中的部分过滤显示
  const showSection = (sectionId: string) => {
    return activeSection === 'all' || activeSection === sectionId;
  };

  return (
    <div className="demo-container">
      <h2>React 19.1 & 19.2 新特性补充示例</h2>
      <p className="intro">
        本页面展示了 React 19.1（2025年3月）和 React 19.2（2025年10月）中引入的新特性。
        每个特性都附有详细的中文注释和使用场景说明，面向新手教学。
      </p>

      {/* 导航按钮 */}
      <div className="section-nav">
        <button
          className={`submit-btn ${activeSection === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSection('all')}
        >
          显示全部
        </button>
        <button
          className={`submit-btn ${activeSection === '19.1' ? 'active' : ''}`}
          onClick={() => setActiveSection('19.1')}
        >
          仅 19.1
        </button>
        <button
          className={`submit-btn ${activeSection === '19.2' ? 'active' : ''}`}
          onClick={() => setActiveSection('19.2')}
        >
          仅 19.2
        </button>
      </div>

      {/* 快速导航链接 */}
      <div className="quick-nav">
        <p><strong>快速跳转：</strong></p>
        <div className="nav-links">
          {sections.map(section => (
            <button
              key={section.id}
              className="nav-link"
              onClick={() => {
                setActiveSection(section.id);
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* React 19.1 新特性 */}
      {/* ============================================================ */}
      <div className="version-header">
        <h2>React 19.1 新特性（2025年3月）</h2>
      </div>

      {showSection('191-owner-stack') && (
        <div id="191-owner-stack">
          <OwnerStackDemo />
        </div>
      )}

      {showSection('191-suspense-fix') && (
        <div id="191-suspense-fix">
          <SuspenseFixDemo />
        </div>
      )}

      {/* ============================================================ */}
      {/* React 19.2 新特性 */}
      {/* ============================================================ */}
      <div className="version-header">
        <h2>React 19.2 新特性（2025年10月）</h2>
      </div>

      {showSection('192-activity') && (
        <div id="192-activity">
          <ActivityDemo />
        </div>
      )}

      {showSection('192-use-effect-event') && (
        <div id="192-use-effect-event">
          <UseEffectEventDemo />
        </div>
      )}

      {showSection('192-cache-signal') && (
        <div id="192-cache-signal">
          <CacheSignalDemo />
        </div>
      )}

      {showSection('192-performance-tracks') && (
        <div id="192-performance-tracks">
          <PerformanceTracksDemo />
        </div>
      )}

      {showSection('192-ppr') && (
        <div id="192-ppr">
          <PartialPreRenderingDemo />
        </div>
      )}

      {showSection('192-use-id') && (
        <div id="192-use-id">
          <UseIdPrefixDemo />
        </div>
      )}

      {showSection('192-eslint') && (
        <div id="192-eslint">
          <EslintFlatConfigDemo />
        </div>
      )}

      {showSection('192-ssr-suspense') && (
        <div id="192-ssr-suspense">
          <SsrSuspenseBatchDemo />
        </div>
      )}

      {/* 总结 */}
      <div className="summary-section">
        <h3>总结</h3>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>版本</th>
                <th>特性</th>
                <th>类型</th>
                <th>环境</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>19.1</td>
                <td>Owner Stack</td>
                <td>调试改进</td>
                <td>全部</td>
              </tr>
              <tr>
                <td>19.1</td>
                <td>Suspense 修复</td>
                <td>Bug 修复</td>
                <td>全部</td>
              </tr>
              <tr>
                <td>19.2</td>
                <td>Activity</td>
                <td>新组件</td>
                <td>全部</td>
              </tr>
              <tr>
                <td>19.2</td>
                <td>useEffectEvent</td>
                <td>新 Hook</td>
                <td>全部</td>
              </tr>
              <tr>
                <td>19.2</td>
                <td>cacheSignal</td>
                <td>新 API</td>
                <td>RSC</td>
              </tr>
              <tr>
                <td>19.2</td>
                <td>Performance Tracks</td>
                <td>DevTools 集成</td>
                <td>开发环境</td>
              </tr>
              <tr>
                <td>19.2</td>
                <td>Partial Pre-rendering</td>
                <td>新 API</td>
                <td>RSC</td>
              </tr>
              <tr>
                <td>19.2</td>
                <td>useId 前缀更新</td>
                <td>Breaking Change</td>
                <td>全部</td>
              </tr>
              <tr>
                <td>19.2</td>
                <td>ESLint flat config</td>
                <td>工具更新</td>
                <td>开发环境</td>
              </tr>
              <tr>
                <td>19.2</td>
                <td>SSR Suspense 批量显示</td>
                <td>性能优化</td>
                <td>SSR</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
