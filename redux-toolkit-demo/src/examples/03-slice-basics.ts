//**
 * ============================================================================
 * 示例 3: Slice - Redux Toolkit 的核心概念
 * ============================================================================
 * 
 * 【什么是 Slice？】
 * Slice 是 Redux Toolkit 最重要的概念，它将相关的 state、reducer、action 打包在一起。
 * 
 * 【为什么要用 Slice？】
 * 传统 Redux 的问题：
 * - Action types、action creators、reducers 分散在不同文件
 * - 样板代码太多
 * - 容易写错 action type
 * 
 * Slice 的解决方案：
 * - 一个 Slice = 一个功能模块的状态管理
 * - 自动生成 action creators 和 action types
 * - 代码组织更清晰
 * 
 * 【Slice 的组成】
 * 1. name: Slice 的名称（用于生成 action type）
 * 2. initialState: 初始状态
 * 3. reducers: 修改状态的函数对象
 * 
 * 【创建 Slice 后得到什么？】
 * - slice.reducer: 用于配置 Store 的 reducer
 * - slice.actions: 自动生成的 action creators
 * - slice.name: Slice 的名称
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================================================
// 示例 1: 最简单的 Counter Slice
// ============================================================================

// 定义初始状态
const counterInitialState = {
  value: 0,
};

// 使用 createSlice 创建 Slice
const counterSlice = createSlice({
  // Slice 的名称，会作为 action type 的前缀
  // 生成的 action type 会是: 'counter/increment', 'counter/decrement'
  name: 'counter',
  
  // 初始状态
  initialState: counterInitialState,
  
  // Reducers: 定义如何修改状态
  // 每个 reducer 对应一个 action
  reducers: {
    // increment 是一个 reducer 函数
    // 它接收当前 state 和一个 action，返回新状态
    // 但 Redux Toolkit 允许你"直接修改" state（实际使用了 Immer）
    increment: (state) => {
      // 看起来像是直接修改，但实际上 Redux Toolkit 使用了 Immer
      // 会自动帮你创建不可变更新
      state.value += 1;
      
      // 等价于传统写法：
      // return { ...state, value: state.value + 1 };
    },
    
    decrement: (state) => {
      state.value -= 1;
    },
    
    // 带参数的 reducer
    // PayloadAction<number> 表示 action.payload 是 number 类型
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    
    // 多个参数的 reducer
    // 只能有一个 payload，多个参数需要包装成对象
    setCounter: (state, action: PayloadAction<{ value: number; step: number }>) => {
      state.value = action.payload.value;
    },
    
    // 重置状态
    reset: (state) => {
      state.value = counterInitialState.value;
    },
  },
});

// ============================================================================
// 使用 Slice 生成的内容
// ============================================================================

// 1. 导出 reducer（用于配置 Store）
export const counterReducer = counterSlice.reducer;

// 2. 导出 action creators（用于组件中 dispatch）
export const {
  increment,
  decrement,
  incrementByAmount,
  setCounter,
  reset,
} = counterSlice.actions;

// ============================================================================
// 示例 2: 更复杂的 User Slice
// ============================================================================

// 定义用户状态的类型
interface UserState {
  name: string;
  email: string;
  isLoggedIn: boolean;
  preferences: {
    theme: 'light' | 'dark';
    language: 'zh' | 'en';
  };
}

const userInitialState: UserState = {
  name: '',
  email: '',
  isLoggedIn: false,
  preferences: {
    theme: 'light',
    language: 'zh',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState: userInitialState,
  reducers: {
    // 登录
    login: (state, action: PayloadAction<{ name: string; email: string }>) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.isLoggedIn = true;
    },
    
    // 登出
    logout: (state) => {
      // 可以重置整个状态
      return userInitialState;
      // 或者逐个重置：
      // state.name = '';
      // state.email = '';
      // state.isLoggedIn = false;
    },
    
    // 更新用户信息
    updateProfile: (state, action: PayloadAction<Partial<UserState>>) => {
      // Partial<UserState> 表示可以只传入部分属性
      // 使用 Object.assign 合并对象
      Object.assign(state, action.payload);
    },
    
    // 切换主题
    toggleTheme: (state) => {
      state.preferences.theme = state.preferences.theme === 'light' ? 'dark' : 'light';
    },
    
    // 设置语言
    setLanguage: (state, action: PayloadAction<'zh' | 'en'>) => {
      state.preferences.language = action.payload;
    },
  },
});

export const userReducer = userSlice.reducer;
export const { login, logout, updateProfile, toggleTheme, setLanguage } = userSlice.actions;

// ============================================================================
// 示例 3: Todo Slice（数组操作）
// ============================================================================

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  items: Todo[];
  filter: 'all' | 'active' | 'completed';
}

const todoInitialState: TodoState = {
  items: [],
  filter: 'all',
};

const todoSlice = createSlice({
  name: 'todo',
  initialState: todoInitialState,
  reducers: {
    // 添加 Todo
    addTodo: (state, action: PayloadAction<string>) => {
      const newTodo: Todo = {
        id: Date.now(),
        text: action.payload,
        completed: false,
      };
      state.items.push(newTodo);
      // Redux Toolkit + Immer 允许使用 push 等可变方法
    },
    
    // 切换完成状态
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    
    // 删除 Todo
    removeTodo: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    // 设置过滤器
    setFilter: (state, action: PayloadAction<TodoState['filter']>) => {
      state.filter = action.payload;
    },
    
    // 清空已完成
    clearCompleted: (state) => {
      state.items = state.items.filter(item => !item.completed);
    },
  },
});

export const todoReducer = todoSlice.reducer;
export const { addTodo, toggleTodo, removeTodo, setFilter, clearCompleted } = todoSlice.actions;

// ============================================================================
// 示例 4: 组合多个 Slice 到 Store
// ============================================================================

import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    counter: counterReducer,  // 来自 counterSlice
    user: userReducer,        // 来自 userSlice
    todo: todoReducer,        // 来自 todoSlice
  },
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ============================================================================
// 【重要知识点总结】
// ============================================================================
/**
 * 1. createSlice 做了什么？
 *    - 根据 name 和 reducers 自动生成 action types
 *    - 为每个 reducer 生成对应的 action creator
 *    - 创建 reducer 函数
 * 
 * 2. 为什么可以直接修改 state？
 *    - Redux Toolkit 使用了 Immer 库
 *    - 你写的"修改"代码实际上会被转换为不可变更新
 *    - 这让代码更简洁，不容易出错
 * 
 * 3. PayloadAction<Type> 是什么？
 *    - TypeScript 类型，用于定义 action.payload 的类型
 *    - 提供类型安全，IDE 会有代码提示
 * 
 * 4. 如何组织 Slice？
 *    - 按功能模块划分（counter、user、todo）
 *    - 每个 Slice 一个文件
 *    - 在 store/index.ts 中组合所有 reducer
 * 
 * 5. 命名规范：
 *    - Slice name: 小写、驼峰（如 'counter'、'userProfile'）
 *    - Action creator: 驼峰（如 'increment'、'updateProfile'）
 *    - 生成的 action type: 'sliceName/actionName'（如 'counter/increment'）
 */

export default store;
