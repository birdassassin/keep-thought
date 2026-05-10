//**
 * ============================================================================
 * 示例 4: 在 React 组件中使用 Redux Hooks
 * ============================================================================
 * 
 * 【三个核心 Hooks】
 * 1. useSelector - 从 Store 中读取状态
 * 2. useDispatch - 获取 dispatch 函数，用于发送 action
 * 3. Provider - 组件（不是 hook），用于将 Store 注入应用
 * 
 * 【使用步骤】
 * 1. 用 Provider 包裹应用
 * 2. 在子组件中使用 useSelector 读取状态
 * 3. 使用 useDispatch 获取 dispatch 函数
 * 4. 调用 dispatch(action) 修改状态
 */

import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================================================
// 第一步：创建 Slice（和之前一样）
// ============================================================================

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

const { increment, decrement, incrementByAmount } = counterSlice.actions;
const counterReducer = counterSlice.reducer;

// ============================================================================
// 第二步：创建 Store
// ============================================================================

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// 导出类型（TypeScript 需要）
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

// ============================================================================
// 第三步：创建使用 Redux 的组件
// ============================================================================

/**
 * 【useSelector 详解】
 * 
 * useSelector 用于从 Store 中读取状态。
 * 它接收一个函数作为参数，这个函数接收整个 state，返回你需要的部分。
 * 
 * 特点：
 * - 组件会自动订阅你选择的状态
 * - 当选择的状态变化时，组件会重新渲染
 * - 使用严格比较（===）判断是否变化
 */

// 简单计数器组件
function SimpleCounter() {
  // useSelector 接收一个函数，参数是整个 state
  // 返回 state.counter.value
  const count = useSelector((state: RootState) => state.counter.value);
  
  // useDispatch 返回 dispatch 函数
  const dispatch = useDispatch<AppDispatch>();
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h3>简单计数器</h3>
      <p>当前计数: {count}</p>
      
      {/* 调用 dispatch 发送 action */}
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  );
}

/**
 * 【useSelector 的高级用法】
 * 
 * 1. 选择多个状态
 * 2. 计算派生状态
 * 3. 使用记忆化选择器（优化性能）
 */

// 假设有更复杂的状态
interface ComplexState {
  counter: { value: number };
  user: { name: string; isLoggedIn: boolean };
  todos: { items: { id: number; text: string; completed: boolean }[] };
}

function ComplexExample() {
  // 1. 选择多个状态
  const { count, userName, todoCount } = useSelector((state: ComplexState) => ({
    count: state.counter.value,
    userName: state.user.name,
    todoCount: state.todos.items.length,
  }));
  
  // 2. 计算派生状态
  const completedTodos = useSelector((state: ComplexState) => 
    state.todos.items.filter(todo => todo.completed).length
  );
  
  // 3. 条件选择
  const isLoggedIn = useSelector((state: ComplexState) => state.user.isLoggedIn);
  
  return (
    <div>
      <p>计数: {count}</p>
      <p>用户: {userName}</p>
      <p>待办总数: {todoCount}</p>
      <p>已完成: {completedTodos}</p>
      <p>登录状态: {isLoggedIn ? '已登录' : '未登录'}</p>
    </div>
  );
}

/**
 * 【性能优化：避免不必要的重渲染】
 * 
 * useSelector 使用 === 比较返回值
 * 如果返回对象，每次都会创建新对象，导致不必要的重渲染
 * 解决方案：
 * 1. 分别选择原始值
 * 2. 使用 shallowEqual
 * 3. 使用 createSelector（reselect 库）
 */

import { shallowEqual } from 'react-redux';

// ❌ 不好的做法：每次返回新对象
function BadExample() {
  const { value } = useSelector((state: RootState) => ({
    value: state.counter.value,
  }));
  // 每次渲染都创建新对象，导致组件总是重渲染
  return <div>{value}</div>;
}

// ✅ 好的做法 1：直接选择原始值
function GoodExample1() {
  const value = useSelector((state: RootState) => state.counter.value);
  return <div>{value}</div>;
}

// ✅ 好的做法 2：使用 shallowEqual
function GoodExample2() {
  const counter = useSelector(
    (state: RootState) => state.counter,
    shallowEqual  // 浅比较，只比较第一层属性
  );
  return <div>{counter.value}</div>;
}

// ============================================================================
// 第四步：用 Provider 包裹应用
// ============================================================================

/**
 * Provider 是 react-redux 提供的组件
 * 它接收一个 store 属性，将 Redux Store 注入整个应用
 * 所有子组件都可以通过 hooks 访问 Store
 */

function App() {
  return (
    // 用 Provider 包裹整个应用
    // 传入我们创建的 store
    <Provider store={store}>
      <div style={{ padding: '20px' }}>
        <h1>Redux Hooks 示例</h1>
        <SimpleCounter />
      </div>
    </Provider>
  );
}

// ============================================================================
// 第五步：自定义 Hooks（最佳实践）
// ============================================================================

/**
 * 为应用创建自定义 hooks，提供类型安全和使用便利
 */

// 使用类型化的 hooks（推荐做法）
import { TypedUseSelectorHook } from 'react-redux';

// 创建类型化的 useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 创建类型化的 useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// 使用自定义 hooks
function TypedCounter() {
  // 现在有完整的类型提示了！
  const count = useAppSelector(state => state.counter.value);
  const dispatch = useAppDispatch();
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}

// ============================================================================
// 【完整示例：带输入的计数器】
// ============================================================================

function CounterWithInput() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch<AppDispatch>();
  const [amount, setAmount] = React.useState(0);
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
      <h3>带输入的计数器</h3>
      <p>当前计数: {count}</p>
      
      <div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ width: '60px', marginRight: '10px' }}
        />
        <button onClick={() => dispatch(incrementByAmount(amount))}>
          增加
        </button>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <button onClick={() => dispatch(decrement())}>-1</button>
        <button onClick={() => dispatch(increment())}>+1</button>
        <button onClick={() => dispatch(incrementByAmount(10))}>+10</button>
      </div>
    </div>
  );
}

// ============================================================================
// 【重要知识点总结】
// ============================================================================
/**
 * 1. useSelector
 *    - 用于从 Store 读取状态
 *    - 组件会自动订阅选择的状态
 *    - 返回对象时要注意性能问题
 * 
 * 2. useDispatch
 *    - 获取 dispatch 函数
 *    - 调用 dispatch(action) 修改状态
 *    - action 可以是 slice.actions 中生成的
 * 
 * 3. Provider
 *    - 包裹应用的根组件
 *    - 注入 Redux Store
 *    - 所有子组件都能使用 hooks
 * 
 * 4. 最佳实践
 *    - 创建类型化的 useAppSelector 和 useAppDispatch
 *    - 尽量直接选择原始值
 *    - 多个状态分别选择，不要合并成对象
 *    - 复杂逻辑使用 createSelector
 * 
 * 5. 常见错误
 *    - 忘记用 Provider 包裹应用
 *    - useSelector 返回新对象导致无限重渲染
 *    - 在 useSelector 中进行计算（应该在组件内或 createSelector）
 */

export default App;
export { SimpleCounter, CounterWithInput };
