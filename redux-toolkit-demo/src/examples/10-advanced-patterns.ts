/**
 * ============================================================================
 * 示例 10: 高级用法 - createSelector、中间件、性能优化
 * ============================================================================
 * 
 * 本示例展示 Redux Toolkit 的高级功能：
 * 1. createSelector - 记忆化选择器
 * 2. 自定义中间件
 * 3. Redux DevTools 高级用法
 * 4. 代码拆分和动态加载
 * 5. 最佳实践和常见陷阱
 */

import { createSelector, createSlice, PayloadAction, configureStore, Middleware } from '@reduxjs/toolkit';

// ============================================================================
// 高级功能 1: createSelector - 记忆化选择器
// ============================================================================
/**
 * 【为什么需要 createSelector？】
 * 
 * 问题：每次组件渲染时，useSelector 都会重新执行选择函数。
 * 如果选择函数中包含复杂计算（如 filter、map、sort），
 * 即使输入没变，也会重新计算，浪费性能。
 * 
 * 解决方案：createSelector 会缓存上次的计算结果。
 * 只有当输入发生变化时，才会重新计算。
 * 
 * 【工作原理】
 * 
 *   输入选择器          记忆化计算函数          输出
 *   (input selectors)   (combiner function)
 *       │                     │                 │
 *       │  state => state.x   │                 │
 *       ├────────────────────>│                 │
 *       │                     │  检查输入是否变化  │
 *       │                     │  变了 → 重新计算   │
 *       │                     │  没变 → 返回缓存   │
 *       │                     ├─────────────────>│
 *       │                     │                 │
 */

// 示例状态
interface ShopState {
  products: { id: number; name: string; price: number; category: string }[];
  discount: number; // 折扣比例 0-1
  cart: { productId: number; quantity: number }[];
}

const shopInitialState: ShopState = {
  products: [
    { id: 1, name: 'React 入门', price: 99, category: '编程' },
    { id: 2, name: 'Redux 实战', price: 129, category: '编程' },
    { id: 3, name: 'TypeScript 指南', price: 89, category: '编程' },
    { id: 4, name: 'JavaScript 高级', price: 149, category: '编程' },
    { id: 5, name: 'CSS 秘籍', price: 69, category: '设计' },
  ],
  discount: 0.8, // 8 折
  cart: [
    { productId: 1, quantity: 2 },
    { productId: 3, quantity: 1 },
  ],
};

const shopSlice = createSlice({
  name: 'shop',
  initialState: shopInitialState,
  reducers: {
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
    },
    addToCart: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const existing = state.cart.find(item => item.productId === action.payload.productId);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart = state.cart.filter(item => item.productId !== action.payload);
    },
  },
});

// ❌ 不好的做法：每次都重新计算
// function selectCartTotal(state: ShopState) {
//   return state.cart.reduce((total, item) => {
//     const product = state.products.find(p => p.id === item.productId);
//     return total + (product ? product.price * item.quantity : 0);
//   }, 0);
// }
// 问题：即使 cart 和 products 没变，每次调用都会重新遍历计算

// ✅ 好的做法：使用 createSelector
// createSelector 接收多个输入选择器和一个组合函数

// 输入选择器 1：获取购物车
const selectCart = (state: ShopState) => state.cart;

// 输入选择器 2：获取商品列表
const selectProducts = (state: ShopState) => state.products;

// 输入选择器 3：获取折扣
const selectDiscount = (state: ShopState) => state.discount;

// 创建记忆化选择器
const selectCartTotal = createSelector(
  // 第一步：定义输入选择器（可以有多个）
  [selectCart, selectProducts],
  // 第二步：组合函数，接收输入选择器的返回值
  (cart, products) => {
    console.log('重新计算购物车总价...'); // 只有 cart 或 products 变化时才会执行
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }
);

// 带折扣的价格选择器（可以嵌套使用其他选择器）
const selectDiscountedTotal = createSelector(
  [selectCartTotal, selectDiscount],
  (cartTotal, discount) => {
    console.log('重新计算折扣价...');
    return Math.round(cartTotal * discount);
  }
);

// 按分类筛选商品
const selectProductsByCategory = createSelector(
  [selectProducts, (_state: ShopState, category: string) => category],
  (products, category) => {
    console.log(`筛选 ${category} 类商品...`);
    return products.filter(p => p.category === category);
  }
);

// ============================================================================
// 高级功能 2: 自定义中间件
// ============================================================================
/**
 * 【中间件是什么？】
 * 
 * 中间件是在 action 被 dispatch 后、到达 reducer 之前执行的函数。
 * 它可以：
 * - 拦截 action
 * - 执行副作用（日志、API 调用、分析等）
 * - 修改 action
 * - 阻止 action 到达 reducer
 * 
 * 【中间件的执行流程】
 * 
 *   dispatch(action)
 *       │
 *       ▼
 *   ┌─ middleware 1 ─┐
 *   │  next(action)  │
 *   └───────┬────────┘
 *           ▼
 *   ┌─ middleware 2 ─┐
 *   │  next(action)  │
 *   └───────┬────────┘
 *           ▼
 *       reducer
 */

// 示例 1: 日志中间件
const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.group(`Action: ${String(action.type)}`);
  console.log('Payload:', (action as any).payload);
  console.log('之前的 State:', store.getState());
  
  const result = next(action); // 传递给下一个中间件/reducer
  
  console.log('之后的 State:', store.getState());
  console.groupEnd();
  
  return result;
};

// 示例 2: 性能监控中间件
const perfMiddleware: Middleware = (store) => (next) => (action) => {
  const start = performance.now();
  const result = next(action);
  const end = performance.now();
  const duration = (end - start).toFixed(2);
  
  if (Number(duration) > 1) {
    console.warn(`⚠️ 慢 Action: ${String(action.type)} 耗时 ${duration}ms`);
  }
  
  return result;
};

// 示例 3: 只处理特定 action 的中间件
const crashReportingMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Reducer 出错了!', error);
    // 可以在这里上报错误到监控平台
    // Sentry.captureException(error);
    throw error;
  }
};

// 示例 4: 异步中间件（使用 redux-thunk 的原理）
// Redux Toolkit 默认已包含 redux-thunk
// 所以你可以直接 dispatch 异步函数：
// const asyncAction = (payload) => async (dispatch, getState) => {
//   dispatch({ type: 'request/start' });
//   try {
//     const data = await api.fetch(payload);
//     dispatch({ type: 'request/success', payload: data });
//   } catch (error) {
//     dispatch({ type: 'request/failure', error });
//   }
// };

// ============================================================================
// 高级功能 3: Store 配置最佳实践
// ============================================================================

const store = configureStore({
  reducer: {
    shop: shopSlice.reducer,
    // 其他 reducer...
  },
  middleware: (getDefaultMiddleware) => {
    // getDefaultMiddleware 返回默认的中间件数组
    // 默认包含：redux-thunk、不可变性检查、序列化检查
    return getDefaultMiddleware()
      // 添加自定义中间件（注意顺序！）
      .concat(loggerMiddleware)
      .concat(perfMiddleware);
    
    // 如果要移除某个默认中间件：
    // return getDefaultMiddleware({
    //   serializableCheck: false,  // 关闭序列化检查
    //   immutableCheck: false,    // 关闭不可变性检查
    //   thunk: false,             // 移除 redux-thunk
    // });
  },
  // 开发工具配置
  devTools: {
    // 自定义 DevTools 的行为
    name: 'My App',              // 在 DevTools 中显示的名称
    trace: true,                 // 追踪每个 action 的调用栈
    traceLimit: 25,              // 最多追踪 25 层
    // 如果要连接远程 DevTools：
    // hostname: 'localhost',
    // port: 8000,
  },
});

// ============================================================================
// 高级功能 4: 常见陷阱和解决方案
// ============================================================================

/**
 * 【陷阱 1: 在 reducer 中产生副作用】
 * 
 * ❌ 错误：
 * mySlice: createSlice({
 *   reducers: {
 *     fetchData: (state) => {
 *       fetch('/api/data'); // ❌ 不能在 reducer 中调用 API
 *       Math.random();      // ❌ 不能使用随机数
 *       Date.now();         // ❌ 不能使用时间
 *       state.value = 1;    // ✅ 可以修改 state
 *     }
 *   }
 * })
 * 
 * ✅ 正确：副作用放在 thunk 或组件中
 * // 使用 createAsyncThunk
 * export const fetchData = createAsyncThunk('data/fetch', async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 */

/**
 * 【陷阱 2: 直接修改非 Immer 管理的数据】
 * 
 * ❌ 错误：
 * const handleClick = () => {
 *   const items = useSelector(state => state.items);
 *   items.push(newItem); // ❌ 直接修改了 Redux state！
 * }
 * 
 * ✅ 正确：dispatch action 来修改
 * const handleClick = () => {
 *   dispatch(addItem(newItem));
 * }
 */

/**
 * 【陷阱 3: Selector 返回新对象导致无限渲染】
 * 
 * ❌ 错误：
 * const selectUser = (state) => ({ name: state.user.name, age: state.user.age });
 * // 每次都创建新对象，=== 比较总是 false
 * 
 * ✅ 正确：使用 createSelector
 * const selectUser = createSelector(
 *   [(state) => state.user.name, (state) => state.user.age],
 *   (name, age) => ({ name, age })
 * );
 * 
 * ✅ 或者直接选择原始值
 * const name = useSelector(state => state.user.name);
 * const age = useSelector(state => state.user.age);
 */

/**
 * 【陷阱 4: 在 createSelector 中使用外部变量】
 * 
 * ❌ 错误：
 * let filter = 'active';
 * const selectFiltered = createSelector(
 *   [selectItems],
 *   (items) => items.filter(item => item.status === filter) // ❌ filter 不是输入
 * );
 * 
 * ✅ 正确：将外部变量作为参数传入
 * const selectFiltered = createSelector(
 *   [selectItems, (_state, filter) => filter], // filter 作为输入选择器
 *   (items, filter) => items.filter(item => item.status === filter)
 * );
 * 
 * // 使用时：
 * const filteredItems = useSelector(state => selectFiltered(state, 'active'));
 */

// ============================================================================
// 【重要知识点总结】
// ============================================================================
/**
 * 1. createSelector
 *    - 记忆化选择器，避免重复计算
 *    - 输入不变时返回缓存结果
 *    - 可以嵌套使用
 *    - 支持传入参数
 * 
 * 2. 中间件
 *    - 在 action dispatch 后、reducer 执行前运行
 *    - 可以拦截、修改、记录 action
 *    - 使用 next(action) 传递给下一个
 *    - 用 getDefaultMiddleware().concat() 添加
 * 
 * 3. 性能优化
 *    - 使用 createSelector 缓存计算结果
 *    - useSelector 选择最小粒度的状态
 *    - 避免在 reducer 中做复杂计算
 *    - 使用 React.memo 包裹组件
 * 
 * 4. 常见陷阱
 *    - reducer 中不能有副作用
 *    - 不能直接修改 useSelector 返回的数据
 *    - Selector 不能返回新对象
 *    - createSelector 中不能使用外部变量
 */

export default store;
