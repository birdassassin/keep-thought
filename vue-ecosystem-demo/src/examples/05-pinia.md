# 05 - Pinia 2 状态管理教程

> Pinia 是 Vue.js 的官方状态管理库，是 Vuex 的继任者。
> 本教程基于 Pinia 2.x 版本。

---

## 一、安装

```bash
npm install pinia
```

### 注册 Pinia

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

// 创建 Pinia 实例并注册
const pinia = createPinia()
app.use(pinia)

app.mount('#app')
```

---

## 二、为什么选择 Pinia？

### Pinia vs Vuex

| 特性 | Pinia | Vuex |
|------|-------|------|
| **API 风格** | 更简洁，支持 Composition API | 较复杂，主要是 Options API |
| **TypeScript** | 原生支持，类型推导完善 | 需要额外配置 |
| **Mutations** | 不需要，直接修改 state | 必须通过 mutation 修改 |
| **模块化** | 天然模块化，每个 Store 独立 | 需要手动拆分 modules |
| **代码分割** | 自动按需加载 | 需要手动配置 |
| **DevTools** | 完整支持 | 完整支持 |
| **体积** | ~1KB | ~10KB |
| **Vue 版本** | Vue 2 + Vue 3 | Vue 2 + Vue 3 |

### Pinia 的核心优势

1. **更简洁的 API**：不需要 mutations，直接修改 state
2. **更好的 TypeScript 支持**：完整的类型推导
3. **更小的体积**：只有 ~1KB
4. **支持 Composition API 和 Options API**
5. **天然模块化**：每个 Store 都是独立的
6. **支持插件扩展**

---

## 三、定义 Store

### Store 的三种定义方式

#### 1. Composition API 风格（推荐）

```typescript
// src/stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// defineStore 的第一个参数是 Store 的唯一 ID
// 第二个参数是 Setup 函数（类似组件的 setup）
export const useCounterStore = defineStore('counter', () => {
  // ============================================
  // State - 使用 ref() 定义状态
  // ============================================
  const count = ref(0)
  const name = ref('Counter Store')

  // ============================================
  // Getters - 使用 computed() 定义计算属性
  // ============================================
  const doubleCount = computed(() => count.value * 2)
  const isPositive = computed(() => count.value > 0)

  // ============================================
  // Actions - 定义方法（可以是普通函数或异步函数）
  // ============================================
  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  async function incrementAsync() {
    // 支持异步操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    count.value++
  }

  // 返回所有需要暴露的状态和方法
  return {
    // State
    count,
    name,
    // Getters
    doubleCount,
    isPositive,
    // Actions
    increment,
    decrement,
    reset,
    incrementAsync,
  }
})
```

#### 2. Options API 风格

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  // State - 返回初始状态的函数
  state: () => ({
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com',
    isLoggedIn: false,
    token: '' as string,
    preferences: {
      theme: 'light' as 'light' | 'dark',
      language: 'zh-CN',
    },
  }),

  // Getters - 类似于计算属性
  getters: {
    // 基本 getter
    displayName: (state) => `${state.name} (${state.age}岁)`,

    // 使用 this 访问其他 getter
    userInfo(): string {
      return `${this.name}, ${this.email}`
    },

    // 返回函数的 getter（每次调用都会重新计算，不缓存）
    getUserById: (state) => {
      return (id: number) => state.users?.find(user => user.id === id)
    },

    // 接收参数的 getter
    isAdult: (state) => {
      return (minAge: number = 18) => state.age >= minAge
    },
  },

  // Actions - 可以是同步或异步的
  actions: {
    // 同步 action
    updateName(newName: string) {
      this.name = newName
    },

    // 异步 action
    async login(credentials: { email: string; password: string }) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        })
        const data = await response.json()

        this.token = data.token
        this.isLoggedIn = true
        this.name = data.name
        this.email = data.email

        return data
      } catch (error) {
        console.error('登录失败', error)
        throw error
      }
    },

    // 调用其他 action
    async loginAndFetchProfile(credentials: { email: string; password: string }) {
      await this.login(credentials)
      await this.fetchProfile()
    },

    async fetchProfile() {
      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      const data = await response.json()
      this.preferences = data.preferences
    },

    // 退出登录
    logout() {
      this.token = ''
      this.isLoggedIn = false
      this.name = ''
      this.email = ''
    },
  },
})
```

#### 3. Setup Store（Composition API 风格的另一种写法）

```typescript
// src/stores/todo.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Ref } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export const useTodoStore = defineStore('todo', () => {
  // State
  const todos: Ref<Todo[]> = ref([])
  const nextId = ref(1)
  const filter = ref<'all' | 'active' | 'completed'>('all')

  // Getters
  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(t => !t.completed)
      case 'completed':
        return todos.value.filter(t => t.completed)
      default:
        return todos.value
    }
  })

  const remaining = computed(() => todos.value.filter(t => !t.completed).length)
  const completedCount = computed(() => todos.value.filter(t => t.completed).length)

  // Actions
  function addTodo(text: string) {
    todos.value.push({
      id: nextId.value++,
      text,
      completed: false,
    })
  }

  function removeTodo(id: number) {
    todos.value = todos.value.filter(t => t.id !== id)
  }

  function toggleTodo(id: number) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) todo.completed = !todo.completed
  }

  function setFilter(newFilter: 'all' | 'active' | 'completed') {
    filter.value = newFilter
  }

  return {
    todos,
    filter,
    filteredTodos,
    remaining,
    completedCount,
    addTodo,
    removeTodo,
    toggleTodo,
    setFilter,
  }
})
```

---

## 四、在组件中使用 Store

### 基本使用

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
import { useUserStore } from '@/stores/user'

// 调用 useCounterStore() 获取 store 实例
// 注意：必须在 setup 函数中调用，不能在异步函数中调用
const counterStore = useCounterStore()
const userStore = useUserStore()

// 直接访问 state
console.log(counterStore.count)

// 直接访问 getters
console.log(counterStore.doubleCount)

// 直接调用 actions
counterStore.increment()
counterStore.incrementAsync()

// 直接修改 state（Pinia 允许直接修改）
counterStore.count = 10

// 修改多个属性
counterStore.$patch({
  count: 5,
  name: 'New Name',
})

// 使用函数修改（适用于复杂逻辑）
counterStore.$patch((state) => {
  state.count += 10
  state.name = 'Patched Name'
})

// 重置 store 到初始状态
counterStore.$reset()

// 订阅 state 变化
counterStore.$subscribe((mutation, state) => {
  console.log('Store 变化:', mutation.type)
  console.log('新状态:', state)

  // mutation.type: 'direct' | 'patch object' | 'patch function'
  // mutation.storeId: store 的 ID
  // mutation.payload: $patch 的参数
})

// 订阅 action
counterStore.$onAction(({ name, after, onError }) => {
  console.log(`Action ${name} 开始执行`)

  after((result) => {
    console.log(`Action ${name} 执行完成，结果:`, result)
  })

  onError((error) => {
    console.error(`Action ${name} 执行失败:`, error)
  })
})
</script>

<template>
  <div>
    <!-- 在模板中直接使用 -->
    <p>计数：{{ counterStore.count }}</p>
    <p>双倍计数：{{ counterStore.doubleCount }}</p>
    <button @click="counterStore.increment()">+1</button>
    <button @click="counterStore.decrement()">-1</button>
    <button @click="counterStore.reset()">重置</button>
  </div>
</template>
```

### storeToRefs 解构

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()

// 错误方式：直接解构会丢失响应性！
// const { count, doubleCount } = counterStore  // ❌ 丢失响应性

// 正确方式：使用 storeToRefs 解构 state 和 getters
// storeToRefs 只会解构 state 和 getters，不会解构 actions
const { count, doubleCount, name } = storeToRefs(counterStore)

// actions 可以直接从 store 中解构（actions 本身不是响应式的）
const { increment, decrement, reset } = counterStore
</script>

<template>
  <div>
    <p>{{ count }} x 2 = {{ doubleCount }}</p>
    <button @click="increment()">+1</button>
  </div>
</template>
```

---

## 五、跨 Store 调用

```typescript
// src/stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'  // 导入其他 store

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // 在 getter 中使用其他 store
  const canCheckout = computed(() => {
    const userStore = useUserStore()
    return userStore.isLoggedIn && items.value.length > 0
  })

  // 在 action 中使用其他 store
  async function checkout() {
    const userStore = useUserStore()

    if (!userStore.isLoggedIn) {
      throw new Error('请先登录')
    }

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({ items: items.value }),
    })

    const data = await response.json()

    // 清空购物车
    items.value = []

    return data
  }

  return { items, canCheckout, checkout }
})
```

---

## 六、插件

### 使用 pinia-plugin-persistedstate（状态持久化）

```bash
npm install pinia-plugin-persistedstate
```

#### 基本用法

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia()

// 注册持久化插件
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')
```

#### 在 Store 中启用持久化

```typescript
// 方式 1：简单配置（默认使用 localStorage）
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)

  return { token, userInfo }
}, {
  persist: true,  // 启用持久化
})

// 方式 2：自定义配置
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('light')
  const language = ref('zh-CN')

  return { theme, language }
}, {
  persist: {
    key: 'my-app-settings',  // 自定义存储的 key（默认为 store.$id）
    storage: localStorage,    // 存储方式（localStorage / sessionStorage）
    // storage: window.sessionStorage,
    // 或者自定义存储
    // storage: {
    //   getItem(key) { return uni.getStorageSync(key) },
    //   setItem(key, value) { uni.setStorageSync(key, value) },
    //   removeItem(key) { uni.removeStorageSync(key) },
    // },
    paths: ['theme'],         // 只持久化指定的字段
    // beforeRestore: (ctx) => { console.log('即将恢复状态', ctx.store) },
    // afterRestore: (ctx) => { console.log('状态已恢复', ctx.store) },
  },
})

// 方式 3：多个持久化配置
export const useAppStore = defineStore('app', () => {
  const token = ref('')
  const settings = ref({ theme: 'light' })

  return { token, settings }
}, {
  persist: [
    {
      key: 'app-token',
      paths: ['token'],
      storage: localStorage,
    },
    {
      key: 'app-settings',
      paths: ['settings'],
      storage: localStorage,
    },
  ],
})
```

### 自定义插件

```typescript
// src/stores/plugins/logger.ts
import type { PiniaPluginContext } from 'pinia'

// 自定义插件：日志记录
export function piniaLoggerPlugin({ store }: PiniaPluginContext) {
  // 当 store 初始化时
  console.log(`[Pinia] Store "${store.$id}" 已创建`)

  // 订阅 state 变化
  store.$subscribe((mutation, state) => {
    console.log(
      `[Pinia] Store "${store.$id}" 变化 (${mutation.type}):`,
      mutation.payload
    )
  })

  // 订阅 action
  store.$onAction(({ name, after, onError }) => {
    console.log(`[Pinia] Action "${name}" 开始 (Store: "${store.$id}")`)
    after((result) => {
      console.log(`[Pinia] Action "${name}" 完成 (Store: "${store.$id}")`, result)
    })
    onError((error) => {
      console.error(`[Pinia] Action "${name}" 失败 (Store: "${store.$id}")`, error)
    })
  })
}

// 注册自定义插件
// src/main.ts
import { piniaLoggerPlugin } from './stores/plugins/logger'
pinia.use(piniaLoggerPlugin)
```

```typescript
// 自定义插件：重置所有 store
// src/stores/plugins/reset.ts
import type { PiniaPluginContext } from 'pinia'

export function resetAllStoresPlugin({ store }: PiniaPluginContext) {
  // 为每个 store 添加 $resetAll 方法
  const initialState = JSON.parse(JSON.stringify(store.$state))
  store.$resetAll = () => {
    store.$patch(JSON.parse(JSON.stringify(initialState)))
  }
}
```

---

## 七、Store 的组合与复用

### 组合多个 Store

```typescript
// src/stores/composite.ts
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useUserStore } from './user'
import { useCartStore } from './cart'
import { useNotificationStore } from './notification'

export const useDashboardStore = defineStore('dashboard', () => {
  const userStore = useUserStore()
  const cartStore = useCartStore()
  const notificationStore = useNotificationStore()

  // 组合多个 store 的数据
  const dashboardData = computed(() => ({
    user: {
      name: userStore.name,
      isLoggedIn: userStore.isLoggedIn,
    },
    cart: {
      itemCount: cartStore.items.length,
      total: cartStore.totalPrice,
    },
    notifications: notificationStore.unreadCount,
  }))

  // 组合多个 store 的 actions
  async function initializeApp() {
    try {
      await userStore.fetchProfile()
      await cartStore.fetchCart()
      await notificationStore.fetchNotifications()
    } catch (error) {
      console.error('初始化失败', error)
    }
  }

  return { dashboardData, initializeApp }
})
```

### 工厂函数创建 Store

```typescript
// 通过工厂函数创建多个相似的 store
function createListStore<T>(id: string) {
  return defineStore(id, () => {
    const items = ref<T[]>([]) as Ref<T[]>
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchItems(url: string) {
      loading.value = true
      error.value = null
      try {
        const response = await fetch(url)
        items.value = await response.json()
      } catch (e) {
        error.value = (e as Error).message
      } finally {
        loading.value = false
      }
    }

    function addItem(item: T) {
      items.value.push(item)
    }

    function removeItem(index: number) {
      items.value.splice(index, 1)
    }

    return { items, loading, error, fetchItems, addItem, removeItem }
  })
}

// 创建不同的 list store
export const useUsersStore = createListStore<User>('users')
export const useProductsStore = createListStore<Product>('products')
```

---

## 八、SSR 支持

### Pinia 在 SSR 中的注意事项

```typescript
// 在 SSR 环境中使用 Pinia 需要注意：

// 1. 每个请求创建独立的 Pinia 实例
// src/server/app.ts
import { createPinia } from 'pinia'

export function createApp() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app, pinia }
}

// 2. 在服务端渲染时初始化 store
// src/server/entry.ts
export async function render(url: string) {
  const { app, pinia } = createApp()

  // 根据当前路由初始化需要的数据
  const router = createRouter()
  router.push(url)
  await router.isReady()

  // 匹配到的组件可能需要预取数据
  const matchedComponents = router.currentRoute.value.matched.flatMap(record =>
    Object.values(record.components)
  )

  // 对所有匹配的组件调用预取方法
  await Promise.all(
    matchedComponents.map((component: any) => {
      if (component.prefetch) {
        return component.prefetch({ router, pinia })
      }
    })
  )

  // 渲染 HTML
  const html = renderToString(app)
  // 序列化 Pinia 状态并注入到 HTML 中
  const piniaState = pinia.state.value

  return { html, piniaState }
}

// 3. 在客户端恢复状态
// src/client/main.ts
import { createPinia } from 'pinia'

const pinia = createPinia()

// 如果有服务端注入的状态，恢复它
if (window.__PINIA_STATE__) {
  pinia.state.value = window.__PINIA_STATE__
}

app.use(pinia)
```

### 持久化插件在 SSR 中的配置

```typescript
// SSR 环境中，持久化插件需要特殊处理
// 只在客户端执行持久化操作
{
  persist: {
    // 只在客户端启用
    enabled: import.meta.env.CLIENT,
    storage: localStorage,
  },
}
```

---

## 九、最佳实践

### 1. Store 的命名规范

```typescript
// Store 文件名：use + 功能名 + Store
// stores/useCounterStore.ts
// stores/useUserStore.ts
// stores/useCartStore.ts

// Store ID 与文件名一致
export const useCounterStore = defineStore('counter', () => { /* ... */ })
export const useUserStore = defineStore('user', () => { /* ... */ })
```

### 2. Store 的组织结构

```
src/stores/
├── index.ts              # 导出所有 store（可选）
├── useCounterStore.ts    # 计数器 store
├── useUserStore.ts       # 用户 store
├── useCartStore.ts       # 购物车 store
├── useNotificationStore.ts  # 通知 store
└── plugins/              # 自定义插件
    ├── logger.ts
    └── reset.ts
```

### 3. 何时使用 Store

```
需要使用 Store 的场景：
✅ 多个组件需要共享的状态（如用户信息、主题设置）
✅ 需要跨页面保持的状态（如购物车、表单数据）
✅ 需要持久化的状态（如用户偏好设置）
✅ 复杂的状态逻辑（如权限管理、通知系统）

不需要使用 Store 的场景：
❌ 只在单个组件中使用的状态（使用组件本地状态）
❌ 通过 Props / Emits 可以解决的父子组件通信
❌ 简单的 UI 状态（如模态框开关、下拉菜单展开）
```

### 4. TypeScript 最佳实践

```typescript
// 定义类型接口
interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

// 在 Store 中使用类型
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUser(id: number): Promise<User> {
    loading.value = true
    try {
      const response = await fetch(`/api/users/${id}`)
      const data: User = await response.json()
      user.value = data
      return data
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  return { user, loading, error, fetchUser }
})
```
