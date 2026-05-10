/**
 * ============================================================================
 * 示例 5: 异步操作 - createAsyncThunk
 * ============================================================================
 * 
 * 【什么是异步操作？】
 * 在实际应用中，我们经常需要：
 * - 从服务器获取数据
 * - 提交表单到服务器
 * - 上传文件
 * 
 * 这些操作需要时间，而且可能成功或失败。
 * Redux Toolkit 提供了 createAsyncThunk 来处理异步操作。
 * 
 * 【createAsyncThunk 做了什么？】
 * 1. 创建一个 thunk action creator
 * 2. 自动生成 pending、fulfilled、rejected 三种状态的 action
 * 3. 处理异步逻辑，自动 dispatch 相应 action
 * 
 * 【三种状态】
 * - pending: 异步操作开始
 * - fulfilled: 异步操作成功完成
 * - rejected: 异步操作失败
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ============================================================================
// 示例 1: 最简单的异步 Thunk
// ============================================================================

/**
 * createAsyncThunk 接收两个参数：
 * 1. type prefix: action type 的前缀
 * 2. payload creator: 异步函数
 */

// 模拟 API 调用
const fetchUserAPI = async (userId: number): Promise<{ id: number; name: string; email: string }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟随机失败（20% 概率）
  if (Math.random() < 0.2) {
    throw new Error('网络错误');
  }
  
  return {
    id: userId,
    name: `用户${userId}`,
    email: `user${userId}@example.com`,
  };
};

// 创建异步 thunk
export const fetchUser = createAsyncThunk(
  // action type 前缀
  // 生成的 action types 会是：
  // - 'user/fetchUser/pending'
  // - 'user/fetchUser/fulfilled'
  // - 'user/fetchUser/rejected'
  'user/fetchUser',
  
  // payload creator 函数
  // 接收参数，返回 Promise
  async (userId: number, thunkAPI) => {
    try {
      const response = await fetchUserAPI(userId);
      return response; // 这会作为 fulfilled action 的 payload
    } catch (error) {
      // 出错时，使用 rejectWithValue 返回自定义错误信息
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

// ============================================================================
// 示例 2: 带更多选项的 Thunk
// ============================================================================

interface FetchPostsParams {
  page: number;
  limit: number;
  category?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
}

// 模拟获取文章列表
const fetchPostsAPI = async (params: FetchPostsParams): Promise<Post[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const posts: Post[] = [];
  for (let i = 0; i < params.limit; i++) {
    const id = (params.page - 1) * params.limit + i + 1;
    posts.push({
      id,
      title: `文章 ${id}${params.category ? ` (${params.category})` : ''}`,
      content: `这是文章 ${id} 的内容...`,
    });
  }
  
  return posts;
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params: FetchPostsParams, thunkAPI) => {
    // thunkAPI 对象包含很多有用的属性和方法
    const { signal } = thunkAPI;
    
    try {
      const posts = await fetchPostsAPI(params);
      return posts;
    } catch (error) {
      return thunkAPI.rejectWithValue('获取文章失败');
    }
  },
  {
    // 条件：决定是否执行异步操作
    // 返回 false 时，不会执行
    condition: (params, { getState }) => {
      // 可以在这里检查是否需要重新获取数据
      // 例如：如果已经在获取中，就不要重复获取
      const state = getState() as { posts: { loading: boolean } };
      if (state.posts.loading) {
        return false; // 已经在加载中，取消这次请求
      }
      return true;
    },
  }
);

// ============================================================================
// 示例 3: 创建包含异步状态的 Slice
// ============================================================================

interface UserState {
  data: {
    id: number;
    name: string;
    email: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 同步 reducer：清空用户数据
    clearUser: (state) => {
      state.data = null;
      state.error = null;
    },
    
    // 同步 reducer：重置错误
    clearError: (state) => {
      state.error = null;
    },
  },
  
  // extraReducers: 处理其他 slice 的 action 或异步 thunk 的 action
  extraReducers: (builder) => {
    // pending: 异步操作开始
    builder.addCase(fetchUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      // 注意：不要在这里修改 data，保留旧数据可以显示加载状态
    });
    
    // fulfilled: 异步操作成功
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload; // payload 是 thunk 返回的数据
      state.error = null;
    });
    
    // rejected: 异步操作失败
    builder.addCase(fetchUser.rejected, (state, action) => {
      state.loading = false;
      // action.payload 是 rejectWithValue 返回的值
      // action.error 是抛出的错误
      state.error = (action.payload as string) || action.error.message || '未知错误';
    });
    
    // 也可以使用 match 来处理多个类似的 thunk
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          console.log('某个异步操作开始了');
        }
      )
      .addDefaultCase((state, action) => {
        // 处理所有未被捕获的 action
        console.log('未处理的 action:', action.type);
      });
  },
});

export const { clearUser, clearError } = userSlice.actions;
export const userReducer = userSlice.reducer;

// ============================================================================
// 示例 4: 在组件中使用异步 Thunk
// ============================================================================

/**
 * 使用步骤：
 * 
 * 1. dispatch 异步 thunk
 *    dispatch(fetchUser(123))
 * 
 * 2. 在组件中监听状态
 *    const { data, loading, error } = useSelector(state => state.user)
 * 
 * 3. 根据状态渲染 UI
 *    - loading: 显示加载中
 *    - error: 显示错误信息
 *    - data: 显示数据
 */

// 伪代码示例：
/*
function UserProfile({ userId }: { userId: number }) {
  const dispatch = useDispatch();
  const { data: user, loading, error } = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    // 组件挂载时获取用户数据
    dispatch(fetchUser(userId));
  }, [dispatch, userId]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!user) return <div>无数据</div>;
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
*/

// ============================================================================
// 示例 5: Thunk 中 dispatch 其他 action
// ============================================================================

// 创建另一个 slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState: { message: '', type: '' as 'success' | 'error' | '' },
  reducers: {
    showNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' }>) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    hideNotification: (state) => {
      state.message = '';
      state.type = '';
    },
  },
});

const { showNotification, hideNotification } = notificationSlice.actions;

// 在 thunk 中 dispatch 其他 action
export const fetchUserWithNotification = createAsyncThunk(
  'user/fetchUserWithNotification',
  async (userId: number, thunkAPI) => {
    const { dispatch } = thunkAPI;
    
    try {
      const user = await fetchUserAPI(userId);
      
      // 成功后显示通知
      dispatch(showNotification({
        message: `欢迎回来，${user.name}！`,
        type: 'success',
      }));
      
      // 3秒后隐藏通知
      setTimeout(() => dispatch(hideNotification()), 3000);
      
      return user;
    } catch (error) {
      dispatch(showNotification({
        message: '登录失败，请重试',
        type: 'error',
      }));
      
      throw error;
    }
  }
);

// ============================================================================
// 【重要知识点总结】
// ============================================================================
/**
 * 1. createAsyncThunk
 *    - 创建异步 action creator
 *    - 自动生成 pending/fulfilled/rejected action
 *    - 返回的 thunk 可以被 dispatch
 * 
 * 2. Thunk 参数
 *    - 第一个参数：传给 thunk 的数据
 *    - thunkAPI 对象：包含 dispatch, getState, rejectWithValue 等
 * 
 * 3. extraReducers
 *    - 使用 builder.addCase 处理不同状态的 action
 *    - pending: 设置 loading 状态
 *    - fulfilled: 保存数据，清除错误
 *    - rejected: 保存错误信息
 * 
 * 4. 状态设计
 *    - loading: 表示是否正在请求
 *    - error: 存储错误信息
 *    - data: 存储实际数据
 * 
 * 5. 最佳实践
 *    - 使用 rejectWithValue 返回自定义错误
 *    - 在 condition 中防止重复请求
 *    - 保持 data 在 loading 时不置空（显示旧数据）
 *    - 使用 addMatcher 处理通用逻辑
 */

export default userReducer;
