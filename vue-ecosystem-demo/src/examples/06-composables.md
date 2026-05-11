# 06 - Composables 组合式函数教程

> Composables（组合式函数）是 Vue 3 中利用 Composition API 封装和复用有状态逻辑的方式。
> 它是 Vue 3 中最重要的代码复用模式。

---

## 一、什么是 Composable？

### 定义

Composable 是一个函数，它利用 Vue 的响应式 API（如 `ref`、`computed`、`watch` 等）
来封装和复用**有状态逻辑**。

### 命名规范

Composable 函数必须以 `use` 前缀命名，这是 Vue 社区的约定：

```
useMousePosition   ✅ 正确
useLocalStorage    ✅ 正确
useFetch           ✅ 正确
mousePosition      ❌ 错误（缺少 use 前缀）
getLocalStorage    ❌ 错误（使用了 get 前缀）
```

### Composable vs 普通工具函数

| 特性 | Composable | 普通工具函数 |
|------|-----------|-------------|
| **响应式** | 是（使用 ref/reactive） | 否 |
| **生命周期** | 可以使用（onMounted 等） | 不可以使用 |
| **状态管理** | 内部维护状态 | 无状态 |
| **用途** | 封装有状态逻辑 | 封装纯逻辑 |

---

## 二、Composable 基本结构

### 模板

```typescript
// src/composables/useXxx.ts
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

/**
 * useXxx - 功能描述
 *
 * @param param1 - 参数描述
 * @param param2 - 参数描述
 * @returns 返回值描述
 *
 * @example
 * ```vue
 * <script setup>
 * const { data, loading, error } = useXxx(param)
 * </script>
 * ```
 */
export function useXxx(param1: string, param2?: number) {
  // ============================================
  // 1. 响应式状态（使用 ref / reactive）
  // ============================================
  const data = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // ============================================
  // 2. 计算属性（使用 computed）
  // ============================================
  const computedData = computed(() => {
    return data.value?.toUpperCase()
  })

  // ============================================
  // 3. 方法（普通函数或异步函数）
  // ============================================
  async function fetchData() {
    loading.value = true
    error.value = null
    try {
      // ... 异步操作
      data.value = 'result'
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // 4. 侦听器（使用 watch / watchEffect）
  // ============================================
  watch(param1, (newVal) => {
    console.log('参数变化:', newVal)
  })

  // ============================================
  // 5. 生命周期钩子（可选）
  // ============================================
  onMounted(() => {
    fetchData()
  })

  // ============================================
  // 6. 清理副作用（可选）
  // ============================================
  onUnmounted(() => {
    // 清理定时器、事件监听等
  })

  // ============================================
  // 7. 返回需要暴露的状态和方法
  // ============================================
  return {
    // 状态（ref）
    data,
    loading,
    error,
    // 计算属性（computed）
    computedData,
    // 方法
    fetchData,
  }
}
```

---

## 三、常用 Composable 示例

### 1. useLocalStorage - 本地存储

```typescript
// src/composables/useLocalStorage.ts
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * useLocalStorage - 响应式的 localStorage 封装
 *
 * 将 localStorage 中的值与 ref 双向同步，
 * 修改 ref 的值会自动保存到 localStorage，
 * 页面刷新后自动从 localStorage 恢复值。
 *
 * @param key - localStorage 的键名
 * @param defaultValue - 默认值（localStorage 中没有值时使用）
 * @returns 响应式的 ref
 *
 * @example
 * ```ts
 * // 基本用法
 * const theme = useLocalStorage('theme', 'light')
 * theme.value = 'dark'  // 自动保存到 localStorage
 *
 * // 使用对象
 * const userPrefs = useLocalStorage('user-prefs', {
 *   language: 'zh-CN',
 *   fontSize: 14,
 * })
 * ```
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  // 尝试从 localStorage 读取初始值
  const storedValue = localStorage.getItem(key)

  // 如果有存储值，尝试解析 JSON；否则使用默认值
  let initialValue: T = defaultValue
  if (storedValue !== null) {
    try {
      initialValue = JSON.parse(storedValue)
    } catch {
      // JSON 解析失败，使用默认值
      initialValue = defaultValue
    }
  }

  // 创建响应式 ref
  const data = ref<T>(initialValue) as Ref<T>

  // 侦听 ref 的变化，自动保存到 localStorage
  watch(
    data,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (e) {
        console.error(`保存 localStorage 失败 [${key}]:`, e)
      }
    },
    { deep: true }  // 深度侦听，对象内部变化也能捕获
  )

  return data
}

// ============================================
// 使用示例
// ============================================
// import { useLocalStorage } from '@/composables/useLocalStorage'
//
// // 存储简单值
// const theme = useLocalStorage('app-theme', 'light')
// const token = useLocalStorage('auth-token', '')
//
// // 存储对象
// const settings = useLocalStorage('app-settings', {
//   language: 'zh-CN',
//   fontSize: 14,
//   notifications: true,
// })
//
// // 在模板中使用
// // <select v-model="theme">
// //   <option value="light">浅色</option>
// //   <option value="dark">深色</option>
// // </select>
```

### 2. useMousePosition - 鼠标位置追踪

```typescript
// src/composables/useMousePosition.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * useMousePosition - 追踪鼠标位置
 *
 * 实时追踪鼠标在页面上的 x、y 坐标。
 * 组件卸载时自动移除事件监听。
 *
 * @returns 包含 x、y 坐标的响应式对象
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMousePosition } from '@/composables/useMousePosition'
 *
 * const { x, y } = useMousePosition()
 * </script>
 *
 * <template>
 *   <p>鼠标位置：({{ x }}, {{ y }})</p>
 * </template>
 * ```
 */
export function useMousePosition() {
  // 响应式状态
  const x = ref(0)
  const y = ref(0)

  // 鼠标移动事件处理函数
  function handleMouseMove(event: MouseEvent) {
    x.value = event.clientX
    y.value = event.clientY
  }

  // 组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
  })

  // 组件卸载时移除事件监听（防止内存泄漏）
  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
  })

  return { x, y }
}

// ============================================
// 进阶版本：支持节流
// ============================================
export function useMousePositionThrottled(delay: number = 16) {
  const x = ref(0)
  const y = ref(0)
  let lastTime = 0

  function handleMouseMove(event: MouseEvent) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      x.value = event.clientX
      y.value = event.clientY
      lastTime = now
    }
  }

  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
  })

  return { x, y }
}
```

### 3. useFetch - 数据请求

```typescript
// src/composables/useFetch.ts
import { ref, watch, type Ref } from 'vue'

/**
 * useFetch - 通用的数据请求 Composable
 *
 * 封装了异步数据请求的完整生命周期：
 * 加载状态、数据、错误处理、自动/手动请求。
 *
 * @param url - 请求的 URL（可以是 ref，实现自动请求）
 * @param options - 请求选项
 * @returns 包含 data、loading、error、execute 的对象
 *
 * @example
 * ```ts
 * // 自动请求（url 变化时自动重新请求）
 * const url = ref('/api/users')
 * const { data, loading, error } = useFetch(url)
 *
 * // 手动请求
 * const { data, loading, error, execute } = useFetch('/api/users', {
 *   immediate: false,
 * })
 * execute()  // 手动触发请求
 *
 * // POST 请求
 * const { data, execute } = useFetch('/api/users', {
 *   immediate: false,
 *   method: 'POST',
 *   body: { name: '张三' },
 * })
 * ```
 */
interface UseFetchOptions {
  immediate?: boolean        // 是否立即请求（默认 true）
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'  // 请求方法
  body?: any                 // 请求体
  headers?: Record<string, string>  // 请求头
  onSuccess?: (data: any) => void   // 成功回调
  onError?: (error: Error) => void  // 失败回调
}

export function useFetch<T = any>(
  url: string | Ref<string>,
  options: UseFetchOptions = {}
) {
  // 解构选项，设置默认值
  const {
    immediate = true,
    method = 'GET',
    body = null,
    headers = {},
    onSuccess,
    onError,
  } = options

  // 响应式状态
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 请求执行函数
  async function execute(
    overrideUrl?: string,
    overrideOptions?: Partial<UseFetchOptions>
  ) {
    const requestUrl = overrideUrl || (typeof url === 'string' ? url : url.value)
    const requestMethod = overrideOptions?.method || method
    const requestBody = overrideOptions?.body ?? body

    loading.value = true
    error.value = null

    try {
      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: requestBody ? JSON.stringify(requestBody) : null,
      })

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      data.value = result

      onSuccess?.(result)
      return result
    } catch (e) {
      const err = e as Error
      error.value = err
      onError?.(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 如果 url 是 ref，侦听变化自动请求
  if (typeof url !== 'string') {
    watch(url, () => {
      if (immediate) execute()
    }, { immediate: true })
  } else if (immediate) {
    // 如果 url 是字符串且 immediate 为 true，立即请求
    execute()
  }

  return {
    data,      // 响应数据
    loading,   // 加载状态
    error,     // 错误信息
    execute,   // 手动触发请求
  }
}

// ============================================
// 使用示例：带分页的数据请求
// ============================================
// export function usePaginatedFetch<T>(baseUrl: string, page: Ref<number>) {
//   const url = computed(() => `${baseUrl}?page=${page.value}&limit=10`)
//   const { data, loading, error } = useFetch<{ items: T[]; total: number }>(url)
//
//   return {
//     items: computed(() => data.value?.items || []),
//     total: computed(() => data.value?.total || 0),
//     loading,
//     error,
//   }
// }
```

### 4. useDebounce - 防抖

```typescript
// src/composables/useDebounce.ts
import { ref, watch, type Ref } from 'vue'

/**
 * useDebounce - 防抖 Composable
 *
 * 将一个 ref 值进行防抖处理，
 * 只有在指定时间内没有新的变化时，才会更新输出值。
 * 常用于搜索输入框、表单验证等场景。
 *
 * @param source - 源 ref 值
 * @param delay - 防抖延迟时间（毫秒），默认 300ms
 * @returns 防抖后的 ref 值
 *
 * @example
 * ```vue
 * <script setup>
 * import { useDebounce } from '@/composables/useDebounce'
 *
 * const searchInput = ref('')
 * const debouncedSearch = useDebounce(searchInput, 500)
 *
 * // 当用户停止输入 500ms 后，debouncedSearch 才会更新
 * watch(debouncedSearch, (val) => {
 *   fetchSearchResults(val)
 * })
 * </script>
 *
 * <template>
 *   <input v-model="searchInput" placeholder="搜索..." />
 *   <p>防抖后的值：{{ debouncedSearch }}</p>
 * </template>
 * ```
 */
export function useDebounce<T>(source: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(source.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(source, (newVal) => {
    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // 设置新的定时器
    timeoutId = setTimeout(() => {
      debouncedValue.value = newVal
    }, delay)
  })

  return debouncedValue
}

// ============================================
// useDebounceFn - 防抖函数
// ============================================
/**
 * useDebounceFn - 将函数进行防抖处理
 *
 * @param fn - 需要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 *
 * @example
 * ```ts
 * const handleSearch = useDebounceFn((keyword: string) => {
 *   console.log('搜索:', keyword)
 * }, 500)
 *
 * inputElement.addEventListener('input', (e) => {
 *   handleSearch(e.target.value)
 * })
 * ```
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debouncedFn = ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T

  // 组件卸载时清除定时器
  if (typeof onUnmounted !== 'undefined') {
    onUnmounted(() => {
      if (timeoutId) clearTimeout(timeoutId)
    })
  }

  return debouncedFn
}
```

### 5. useWindowSize - 窗口尺寸

```typescript
// src/composables/useWindowSize.ts
import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'

/**
 * useWindowSize - 追踪浏览器窗口尺寸
 *
 * 实时追踪窗口的宽度和高度，
 * 并提供常用的断点判断。
 *
 * @returns 包含 width、height 和断点判断的对象
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWindowSize } from '@/composables/useWindowSize'
 *
 * const { width, height, isMobile, isTablet, isDesktop } = useWindowSize()
 * </script>
 *
 * <template>
 *   <p>窗口尺寸：{{ width }} x {{ height }}</p>
 *   <p v-if="isMobile">移动端布局</p>
 *   <p v-else-if="isTablet">平板布局</p>
 *   <p v-else>桌面布局</p>
 * </template>
 * ```
 */
export function useWindowSize() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
  const height = ref(typeof window !== 'undefined' ? window.innerHeight : 0)

  // 常用断点判断
  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed(() => width.value >= 1024)
  const isLargeDesktop = computed(() => width.value >= 1440)

  // 窗口尺寸变化处理函数
  function handleResize() {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
  }
}
```

### 6. useEventListener - 事件监听

```typescript
// src/composables/useEventListener.ts
import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * useEventListener - 声明式的事件监听
 *
 * 自动管理事件监听器的添加和移除，
 * 组件卸载时自动清理，防止内存泄漏。
 *
 * @param target - 事件目标（DOM 元素、window、document 等）
 * @param event - 事件名称
 * @param handler - 事件处理函数
 * @param options - 事件监听选项
 *
 * @example
 * ```ts
 * // 监听 window 事件
 * useEventListener(window, 'resize', handleResize)
 *
 * // 监听 document 事件
 * useEventListener(document, 'keydown', handleKeydown)
 *
 * // 监听 DOM 元素事件
 * const buttonRef = ref<HTMLButtonElement>()
 * useEventListener(buttonRef, 'click', handleClick)
 * ```
 */
export function useEventListener(
  target: Ref<EventTarget | null> | EventTarget,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) {
  // 如果 target 是 ref，使用 watchEffect 自动追踪
  onMounted(() => {
    const targetElement = target instanceof Ref ? target.value : target
    if (targetElement) {
      targetElement.addEventListener(event, handler, options)
    }
  })

  onUnmounted(() => {
    const targetElement = target instanceof Ref ? target.value : target
    if (targetElement) {
      targetElement.removeEventListener(event, handler, options)
    }
  })
}
```

### 7. useTitle - 页面标题

```typescript
// src/composables/useTitle.ts
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * useTitle - 响应式的页面标题
 *
 * @param newTitle - 新标题（可以是字符串或 ref）
 * @param restoreOnUnmount - 组件卸载时是否恢复原标题（默认 true）
 *
 * @example
 * ```ts
 * const title = useTitle('我的应用')
 * title.value = '新标题'  // 自动更新 document.title
 * ```
 */
export function useTitle(
  newTitle: string | Ref<string> = '',
  restoreOnUnmount: boolean = true
): Ref<string> {
  const originalTitle = document.title
  const title = ref(typeof newTitle === 'string' ? newTitle : newTitle.value)

  watch(
    title,
    (newVal) => {
      document.title = newVal
    },
    { immediate: true }
  )

  if (restoreOnUnmount && typeof onUnmounted !== 'undefined') {
    onUnmounted(() => {
      document.title = originalTitle
    })
  }

  return title
}
```

### 8. useClipboard - 剪贴板

```typescript
// src/composables/useClipboard.ts
import { ref } from 'vue'

/**
 * useClipboard - 剪贴板操作
 *
 * @returns 包含 copied、copy、supported 的对象
 *
 * @example
 * ```ts
 * const { copied, copy } = useClipboard()
 * await copy('要复制的文本')
 * console.log(copied.value)  // true
 * ```
 */
export function useClipboard() {
  const copied = ref(false)
  const supported = navigator && 'clipboard' in navigator

  async function copy(text: string) {
    if (!supported) {
      console.warn('当前浏览器不支持剪贴板 API')
      return false
    }
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      setTimeout(() => { copied.value = false }, 2000)
      return true
    } catch (e) {
      console.error('复制失败:', e)
      copied.value = false
      return false
    }
  }

  return { copied, copy, supported }
}
```

---

## 四、Composable 的高级模式

### 组合多个 Composable

```typescript
// src/composables/useSearch.ts
import { ref, computed } from 'vue'
import { useDebounce } from './useDebounce'
import { useFetch } from './useFetch'

/**
 * useSearch - 搜索功能 Composable
 *
 * 组合 useDebounce 和 useFetch，实现带防抖的搜索功能。
 */
export function useSearch<T>(apiUrl: string, delay: number = 300) {
  const keyword = ref('')
  const debouncedKeyword = useDebounce(keyword, delay)

  // 构建搜索 URL
  const searchUrl = computed(() => {
    if (!debouncedKeyword.value) return ''
    return `${apiUrl}?q=${encodeURIComponent(debouncedKeyword.value)}`
  })

  // 使用 useFetch 发起请求
  const { data, loading, error } = useFetch<T[]>(searchUrl, {
    immediate: false,
  })

  // 侦听搜索 URL 变化，自动请求
  // （useFetch 内部已经处理了 ref 的侦听）

  return {
    keyword,           // 搜索关键词（用户输入）
    debouncedKeyword,  // 防抖后的关键词
    results: data,     // 搜索结果
    loading,           // 加载状态
    error,             // 错误信息
  }
}
```

### 接收 ref 参数（灵活的 Composable）

```typescript
// src/composables/useCounter.ts
import { ref, computed, watch, type Ref } from 'vue'

/**
 * useCounter - 计数器 Composable
 *
 * 演示 Composable 接受 ref 参数的写法。
 *
 * @param initialValue - 初始值（可以是数字或 ref）
 * @param step - 步长
 */
export function useCounter(
  initialValue: number | Ref<number> = 0,
  step: number = 1
) {
  // 如果传入的是 ref，使用其值；否则直接使用
  const count = ref(typeof initialValue === 'number' ? initialValue : initialValue.value)

  // 如果传入的是 ref，侦听变化
  if (typeof initialValue !== 'number') {
    watch(initialValue, (newVal) => {
      count.value = newVal
    })
  }

  const doubleCount = computed(() => count.value * 2)

  function increment() { count.value += step }
  function decrement() { count.value -= step }
  function reset() {
    count.value = typeof initialValue === 'number' ? initialValue : initialValue.value
  }

  return { count, doubleCount, increment, decrement, reset }
}
```

### 带清理逻辑的 Composable

```typescript
// src/composables/useInterval.ts
import { ref, onUnmounted } from 'vue'

/**
 * useInterval - 定时器 Composable
 *
 * 封装 setInterval，组件卸载时自动清除定时器。
 *
 * @param callback - 定时器回调函数
 * @param interval - 间隔时间（毫秒）
 *
 * @example
 * ```ts
 * const count = ref(0)
 * useInterval(() => {
 *   count.value++
 * }, 1000)
 * ```
 */
export function useInterval(callback: () => void, interval: number) {
  const isActive = ref(true)

  const timer = setInterval(() => {
    if (isActive.value) {
      callback()
    }
  }, interval)

  // 组件卸载时自动清除定时器
  onUnmounted(() => {
    clearInterval(timer)
  })

  // 返回控制方法
  function pause() { isActive.value = false }
  function resume() { isActive.value = true }

  return { pause, resume, isActive }
}
```

---

## 五、与 React Hooks 对比

### 相似之处

| 特性 | Vue Composables | React Hooks |
|------|----------------|-------------|
| **命名规范** | `use` 前缀 | `use` 前缀 |
| **目的** | 封装和复用有状态逻辑 | 封装和复用有状态逻辑 |
| **响应式** | 基于响应式系统（Proxy） | 基于 useState / useReducer |
| **副作用** | `onMounted` / `watch` / `watchEffect` | `useEffect` |
| **计算属性** | `computed` | `useMemo` |
| **性能优化** | 自动依赖追踪 | 手动指定依赖数组 |

### 关键区别

```typescript
// ============================================
// 1. 不需要依赖数组
// ============================================

// React - 必须手动指定依赖
useEffect(() => {
  document.title = `${count} clicks`
}, [count])  // 必须指定依赖数组

// Vue - 自动追踪依赖
watchEffect(() => {
  document.title = `${count.value} clicks`
  // 自动追踪 count.value，不需要手动指定
})

// ============================================
// 2. 没有调用顺序限制
// ============================================

// React - Hooks 必须在组件顶层调用，不能在条件语句中
function ReactComponent() {
  if (condition) {
    // ❌ 不能在条件语句中调用 Hooks
    // useState(0)
  }
}

// Vue - Composables 可以在条件语句中调用
function VueComponent() {
  if (condition) {
    // ✅ 可以在条件语句中调用 Composables
    const { data } = useFetch('/api/data')
  }
}

// ============================================
// 3. 每次渲染不会重新执行
// ============================================

// React - 每次渲染都会重新执行所有 Hooks
// useState 返回的 state 是最新的，但函数会重新执行

// Vue - setup 只执行一次
// 响应式系统自动处理更新，不需要重新执行

// ============================================
// 4. 没有闭包陷阱
// ============================================

// React - 常见的闭包陷阱
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1)  // count 永远是初始值！
  }, 1000)
  return () => clearInterval(timer)
}, [])  // 空依赖数组

// 修复方式：使用 useRef 或函数式更新
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + 1)  // 使用函数式更新
  }, 1000)
  return () => clearInterval(timer)
}, [])

// Vue - 没有闭包问题
// count 是 ref，始终指向最新的值
const count = ref(0)
onMounted(() => {
  setInterval(() => {
    count.value++  // ✅ 始终获取最新值
  }, 1000)
})
```

### 对比总结

| 方面 | Vue Composables | React Hooks |
|------|----------------|-------------|
| **学习曲线** | 较低 | 较高 |
| **心智负担** | 较小（自动依赖追踪） | 较大（手动管理依赖） |
| **调用限制** | 无限制 | 必须在顶层调用 |
| **闭包问题** | 无 | 常见 |
| **性能** | 更精确的更新 | 需要手动优化 |
| **调试** | 更容易 | 相对困难 |

---

## 六、推荐资源

### VueUse 工具库

[VueUse](https://vueuse.org/) 是一个基于 Vue Composition API 的实用工具集合，
包含了大量高质量的 Composables，可以直接在项目中使用。

```bash
npm i @vueuse/core
```

```typescript
// 常用的 VueUse Composables
import {
  useMouse,          // 鼠标位置
  useStorage,        // localStorage 封装
  useDebounce,       // 防抖
  useThrottle,       // 节流
  useWindowSize,     // 窗口尺寸
  useClipboard,      // 剪贴板
  useDark,           // 暗色模式
  useToggle,         // 布尔值切换
  useEventListener,  // 事件监听
  useFetch,          // 数据请求
  useIntersectionObserver,  // 元素可见性
  useVirtualList,    // 虚拟列表
} from '@vueuse/core'

// 使用示例
const isDark = useDark()
const { x, y } = useMouse()
const { toggle } = useToggle(isDark)
```

### 项目中的 Composables 组织

```
src/composables/
├── index.ts              # 统一导出
├── useLocalStorage.ts    # 本地存储
├── useMousePosition.ts   # 鼠标位置
├── useFetch.ts           # 数据请求
├── useDebounce.ts        # 防抖
├── useWindowSize.ts      # 窗口尺寸
├── useEventListener.ts   # 事件监听
├── useTitle.ts           # 页面标题
├── useClipboard.ts       # 剪贴板
├── useInterval.ts        # 定时器
└── useSearch.ts          # 搜索功能
```

```typescript
// src/composables/index.ts
export { useLocalStorage } from './useLocalStorage'
export { useMousePosition } from './useMousePosition'
export { useFetch } from './useFetch'
export { useDebounce, useDebounceFn } from './useDebounce'
export { useWindowSize } from './useWindowSize'
export { useEventListener } from './useEventListener'
export { useTitle } from './useTitle'
export { useClipboard } from './useClipboard'
export { useInterval } from './useInterval'
export { useSearch } from './useSearch'
```
