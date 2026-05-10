/**
 * Store 配置文件
 * 
 * 这是整个 Redux 应用的入口文件
 * 负责组合所有的 reducer 和配置 store
 */

import { configureStore } from '@reduxjs/toolkit';

// 导入各个 slice 的 reducer
// 实际项目中，每个功能模块都有自己的 slice

// 示例：导入 counter slice
// import counterReducer from '../features/counter/counterSlice';

// 示例：导入 todo slice
// import todoReducer from '../features/todo/todoSlice';

// ============================================================================
// 创建 Redux Store
// ============================================================================

export const store = configureStore({
  reducer: {
    // 在这里注册所有的 reducer
    // 每个 reducer 对应一个 state 的分支
    
    // counter: counterReducer,
    // todos: todoReducer,
    // user: userReducer,
  },
  
  // 中间件配置（可选）
  // Redux Toolkit 默认已经配置了常用的中间件
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: true,  // 检查非序列化数据
  //   }),
  
  // 开发工具配置（可选）
  // devTools: process.env.NODE_ENV !== 'production',
});

// ============================================================================
// 导出类型（TypeScript 需要）
// ============================================================================

// RootState：整个应用的 State 类型
// ReturnType<typeof store.getState> 自动推断出 State 的类型
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch：dispatch 函数的类型
export type AppDispatch = typeof store.dispatch;

// ============================================================================
// 使用说明
// ============================================================================
/**
 * 1. 在这个文件中导入并注册所有的 reducer
 * 
 * 2. 在组件中使用：
 *    import { useSelector, useDispatch } from 'react-redux';
 *    import type { RootState, AppDispatch } from './store';
 *    
 *    const count = useSelector((state: RootState) => state.counter.value);
 *    const dispatch = useDispatch<AppDispatch>();
 * 
 * 3. 在 main.tsx 中用 Provider 包裹应用：
 *    import { Provider } from 'react-redux';
 *    import { store } from './store';
 *    
 *    <Provider store={store}>
 *      <App />
 *    </Provider>
 */

export default store;
