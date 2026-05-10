/**
 * ============================================================================
 * 示例 2: Store 基础 - 创建你的第一个 Store
 * ============================================================================
 * 
 * 【什么是 Store？】
 * Store 是 Redux 应用的核心，它是一个保存应用状态的对象。
 * 可以把 Store 想象成一个数据库，存储着整个应用的数据。
 * 
 * 【Redux Toolkit 如何简化 Store 创建？】
 * 传统 Redux：需要手动配置 reducer、中间件、DevTools
 * Redux Toolkit：使用 configureStore，一行代码搞定
 */

// 从 @reduxjs/toolkit 导入 configureStore
// configureStore 是 Redux Toolkit 提供的创建 Store 的函数
import { configureStore } from '@reduxjs/toolkit';

// ============================================================================
// 第一步：定义初始状态
// ============================================================================
// 这是应用启动时的默认状态
const initialState = {
  // 计数器相关状态
  counter: {
    value: 0,      // 当前计数
    step: 1,       // 每次增加的值
  },
  // 用户信息
  user: {
    name: '访客',
    isLoggedIn: false,
  },
  // 主题设置
  theme: {
    mode: 'light', // 'light' 或 'dark'
  },
};

// ============================================================================
// 第二步：创建 Reducer（简单版本）
// ============================================================================
// Reducer 是一个纯函数，接收当前状态和一个 Action，返回新状态
// 
// 纯函数的含义：
// - 相同的输入永远返回相同的输出
// - 不产生副作用（不修改外部变量、不调用 API 等）
// - 不修改传入的参数（使用展开运算符创建新对象）

function rootReducer(state = initialState, action: { type: string; payload?: any }) {
  // 根据 action.type 决定如何修改状态
  switch (action.type) {
    case 'counter/increment':
      // 使用展开运算符创建新对象，不修改原状态
      return {
        ...state,                           // 复制原有状态
        counter: {                          // 替换 counter 部分
          ...state.counter,                 // 复制原有 counter
          value: state.counter.value + state.counter.step, // 修改 value
        },
      };
    
    case 'counter/decrement':
      return {
        ...state,
        counter: {
          ...state.counter,
          value: state.counter.value - state.counter.step,
        },
      };
    
    case 'user/login':
      return {
        ...state,
        user: {
          ...state.user,
          name: action.payload,  // payload 是传递的数据
          isLoggedIn: true,
        },
      };
    
    case 'theme/toggle':
      return {
        ...state,
        theme: {
          ...state.theme,
          mode: state.theme.mode === 'light' ? 'dark' : 'light',
        },
      };
    
    // 默认情况：返回原状态（不改变任何东西）
    default:
      return state;
  }
}

// ============================================================================
// 第三步：使用 configureStore 创建 Store
// ============================================================================
// configureStore 会自动：
// 1. 启用 Redux DevTools（开发环境）
// 2. 添加常用中间件（如 redux-thunk）
// 3. 检查状态是否被意外修改

const store = configureStore({
  reducer: rootReducer,  // 传入 reducer
  // preloadedState: initialState,  // 可选：传入初始状态
  // middleware: [...],             // 可选：添加自定义中间件
  // devTools: true,                // 可选：显式启用 DevTools（默认已启用）
});

// ============================================================================
// 第四步：Store 的基本操作
// ============================================================================

// 1. 获取当前状态
console.log('初始状态:', store.getState());
// 输出: { counter: { value: 0, step: 1 }, user: {...}, theme: {...} }

// 2. 发送 Action 来修改状态
// Action 是一个普通对象，必须有 type 属性
store.dispatch({ type: 'counter/increment' });
console.log('增加后:', store.getState().counter.value); // 1

store.dispatch({ type: 'counter/increment' });
console.log('再增加:', store.getState().counter.value); // 2

store.dispatch({ type: 'counter/decrement' });
console.log('减少后:', store.getState().counter.value); // 1

// 3. 带 payload 的 Action
store.dispatch({ type: 'user/login', payload: '张三' });
console.log('登录后:', store.getState().user);
// 输出: { name: '张三', isLoggedIn: true }

// 4. 订阅状态变化（可选）
const unsubscribe = store.subscribe(() => {
  console.log('状态变化了:', store.getState());
});

// 取消订阅
// unsubscribe();

// ============================================================================
// 第五步：导出 Store 类型（TypeScript 需要）
// ============================================================================

// 从 Store 本身推断出 RootState 类型
export type RootState = ReturnType<typeof store.getState>;

// 推断出 AppDispatch 类型
export type AppDispatch = typeof store.dispatch;

// 默认导出 Store
export default store;

// ============================================================================
// 【重要知识点总结】
// ============================================================================
/**
 * 1. Store 是单一对象，包含整个应用的状态
 * 
 * 2. 状态是只读的，只能通过 dispatch Action 来修改
 * 
 * 3. Reducer 必须是纯函数：
 *    - 不要直接修改 state 参数
 *    - 使用展开运算符 {...state} 创建新对象
 *    - 不要调用 API 或使用 Math.random() 等副作用
 * 
 * 4. Action 的约定：
 *    - type: 描述动作类型，通常用 "domain/action" 格式
 *    - payload: 可选，携带的数据
 * 
 * 5. configureStore 的优势：
 *    - 自动配置 DevTools
 *    - 自动添加常用中间件
 *    - 检查不可变性
 */
