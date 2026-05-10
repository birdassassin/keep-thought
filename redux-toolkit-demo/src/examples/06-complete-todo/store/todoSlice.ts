/**
 * Todo Slice - 完整的 Todo 应用状态管理
 * 
 * 这个文件展示了如何在实际项目中组织 Redux Toolkit 代码
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ============================================================================
// 类型定义
// ============================================================================

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type FilterType = 'all' | 'active' | 'completed';

export interface TodoState {
  items: Todo[];
  filter: FilterType;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// 初始状态
// ============================================================================

const initialState: TodoState = {
  items: [],
  filter: 'all',
  loading: false,
  error: null,
};

// ============================================================================
// 模拟 API（实际项目中这里会是真实的 API 调用）
// ============================================================================

const mockAPI = {
  // 模拟从服务器获取 todos
  fetchTodos: async (): Promise<Todo[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  },
  
  // 模拟保存到服务器
  saveTodos: async (todos: Todo[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.setItem('todos', JSON.stringify(todos));
  },
};

// ============================================================================
// 异步 Thunks
// ============================================================================

/**
 * 获取 Todo 列表
 */
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const todos = await mockAPI.fetchTodos();
      return todos;
    } catch (error) {
      return rejectWithValue('获取待办事项失败');
    }
  }
);

/**
 * 保存 Todo 列表
 */
export const saveTodos = createAsyncThunk(
  'todos/saveTodos',
  async (todos: Todo[], { rejectWithValue }) => {
    try {
      await mockAPI.saveTodos(todos);
      return todos;
    } catch (error) {
      return rejectWithValue('保存失败');
    }
  }
);

// ============================================================================
// Slice 定义
// ============================================================================

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // 添加 Todo
    addTodo: {
      // prepare 函数：在 reducer 之前处理数据
      // 用于生成 id、时间戳等
      prepare: (text: string) => ({
        payload: {
          id: Date.now().toString(),
          text,
          completed: false,
          createdAt: Date.now(),
        },
      }),
      // reducer：实际修改状态
      reducer: (state, action: PayloadAction<Todo>) => {
        state.items.unshift(action.payload); // 添加到开头
      },
    },
    
    // 切换完成状态
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.items.find(item => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    
    // 编辑 Todo
    editTodo: (state, action: PayloadAction<{ id: string; text: string }>) => {
      const todo = state.items.find(item => item.id === action.payload.id);
      if (todo) {
        todo.text = action.payload.text;
      }
    },
    
    // 删除单个 Todo
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    // 切换所有 Todo 的完成状态
    toggleAll: (state, action: PayloadAction<boolean>) => {
      state.items.forEach(todo => {
        todo.completed = action.payload;
      });
    },
    
    // 清除已完成的 Todo
    clearCompleted: (state) => {
      state.items = state.items.filter(item => !item.completed);
    },
    
    // 设置过滤器
    setFilter: (state, action: PayloadAction<FilterType>) => {
      state.filter = action.payload;
    },
    
    // 重置错误
    clearError: (state) => {
      state.error = null;
    },
  },
  
  // 处理异步操作
  extraReducers: (builder) => {
    // 获取 Todos
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // 保存 Todos
    builder
      .addCase(saveTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveTodos.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ============================================================================
// 导出 Actions 和 Reducer
// ============================================================================

export const {
  addTodo,
  toggleTodo,
  editTodo,
  deleteTodo,
  toggleAll,
  clearCompleted,
  setFilter,
  clearError,
} = todoSlice.actions;

export const todoReducer = todoSlice.reducer;

// ============================================================================
// 选择器（Selectors）
// ============================================================================
// 选择器用于从 state 中派生数据
// 可以在这里进行数据转换和计算

export const selectTodos = (state: { todos: TodoState }) => state.todos.items;

export const selectFilter = (state: { todos: TodoState }) => state.todos.filter;

export const selectFilteredTodos = (state: { todos: TodoState }) => {
  const { items, filter } = state.todos;
  switch (filter) {
    case 'active':
      return items.filter(todo => !todo.completed);
    case 'completed':
      return items.filter(todo => todo.completed);
    default:
      return items;
  }
};

export const selectTodoStats = (state: { todos: TodoState }) => {
  const { items } = state.todos;
  const total = items.length;
  const completed = items.filter(todo => todo.completed).length;
  const active = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  return {
    total,
    completed,
    active,
    progress,
  };
};

export const selectLoading = (state: { todos: TodoState }) => state.todos.loading;

export const selectError = (state: { todos: TodoState }) => state.todos.error;
