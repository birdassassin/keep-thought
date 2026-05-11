# 07 - Vue 3 高级特性与性能优化教程

> 本教程涵盖 Vue 3.5 新特性、Vapor Mode、自定义指令、渲染函数、TypeScript 支持和性能优化等高级主题。

---

## 一、Vue 3.5 新特性

### 1.1 useId() - 生成唯一 ID

```typescript
// useId 用于生成应用级别的唯一 ID
// 常用于无障碍访问（label 的 for 属性）和表单元素

import { useId } from 'vue'

// 在组件中使用
const id = useId()

// 模板中使用
// <label :for="id">用户名</label>
// <input :id="id" />

// 生成带前缀的 ID
const formId = useId()
const inputId = `${formId}-input`
const errorId = `${formId}-error`

// 模板
// <div :id="formId">
//   <label :for="inputId">用户名</label>
//   <input :id="inputId" :aria-describedby="errorId" />
//   <p :id="errorId" role="alert">错误信息</p>
// </div>
```

**使用场景：**
- 表单元素的 `id` 和 `for` 属性关联
- ARIA 无障碍属性（`aria-describedby`、`aria-controls` 等）
- 需要唯一标识符的 DOM 元素

### 1.2 useTemplateRef() - 模板引用

```typescript
// useTemplateRef 是 Vue 3.5 引入的更安全的模板引用方式
// 替代了传统的 ref + template ref 模式

import { useTemplateRef, onMounted } from 'vue'

// 传统方式（Vue 3.0-3.4）
// const inputRef = ref<HTMLInputElement | null>(null)
// 模板：<input ref="inputRef" />

// 新方式（Vue 3.5+）
// useTemplateRef 接收一个与模板中 ref 属性值匹配的 key
const inputRef = useTemplateRef<HTMLInputElement>('myInput')

onMounted(() => {
  // inputRef.value 是 DOM 元素
  inputRef.value?.focus()
})

// 模板
// <input ref="myInput" />
```

**优势：**
- 更好的 TypeScript 类型推导
- 避免了 ref 命名冲突
- 更清晰的意图表达

### 1.3 useModel() - 简化的双向绑定

```typescript
// useModel 简化了组件中 v-model 的实现
// 替代了传统的 props.modelValue + emit('update:modelValue') 模式

import { useModel } from 'vue'

// 传统方式
// const props = defineProps<{ modelValue: string }>()
// const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
// const computedValue = computed({
//   get: () => props.modelValue,
//   set: (val) => emit('update:modelValue', val),
// })

// 新方式（Vue 3.5+）
const modelValue = useModel()

// 自定义 prop 名
const title = useModel(props, 'title')

// 在模板中可以直接使用
// <input v-model="modelValue" />
```

### 1.4 响应式 Props 解构

```typescript
// Vue 3.5 之前：解构 props 会丢失响应性
// const { title, count } = props  // ❌ 丢失响应性

// Vue 3.5：解构 props 保持响应性
const { title, count } = defineProps<{
  title: string
  count: number
}>()

// 解构时使用默认值
const { title = '默认标题', count = 0 } = defineProps<{
  title?: string
  count?: number
}>()

// 注意：解构后的变量是只读的
// 如果需要修改，使用 computed 或本地变量
const localTitle = computed(() => title.toUpperCase())
```

### 1.5 Deferred Teleport（延迟传送门）

```vue
<!-- Vue 3.5 新增的 deferred 属性 -->
<!-- 当目标元素在初始渲染时还不存在，deferred Teleport 会等待 -->

<Teleport defer to="#portal-target">
  <p>这段内容会在 #portal-target 可用后才传送</p>
</Teleport>

<!-- 使用场景：SSR 环境中，目标元素可能在客户端才创建 -->
<!-- 或者在动态创建的容器中使用 -->
```

### 1.6 其他 3.5 改进

```typescript
// 1. watch 的 once 选项
watch(source, callback, { once: true })
// 只触发一次，类似 { once: true } 的事件监听

// 2. onScopeDisposeEffect
// 在 effect 作用域销毁时执行清理逻辑

// 3. base64 编码/解码
import { base64Encode, base64Decode } from 'vue'
const encoded = base64Encode('hello')  // aGVsbG8=
const decoded = base64Decode('aGVsbG8=')  // hello

// 4. 更好的错误信息
// Vue 3.5 提供了更清晰、更有帮助的运行时错误提示
```

---

## 二、Vapor Mode（Vue 3.6 Beta）

### 2.1 什么是 Vapor Mode？

Vapor Mode 是 Vue 3.6 引入的一种新的渲染模式，
它**完全跳过虚拟 DOM**，直接操作真实 DOM，
性能接近原生 JavaScript。

### 2.2 核心原理

```
传统 Vue 渲染流程：
模板 → 编译为渲染函数 → 创建 VNode（虚拟 DOM）→ Diff → Patch → 真实 DOM

Vapor Mode 渲染流程：
模板 → 编译为命令式 DOM 操作 → 直接操作真实 DOM（无 VNode、无 Diff）
```

### 2.3 使用方式

```vue
<!-- 在组件中使用 vapor 模式 -->
<script setup lang="ts">
// 只需要在 <script> 标签上添加 vapor 属性
</script>
<script setup lang="ts" vapor>
import { ref } from 'vue'

const count = ref(0)
function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">
    {{ count }}
  </button>
</template>
```

### 2.4 性能对比

| 指标 | 传统模式 | Vapor Mode |
|------|---------|------------|
| **内存占用** | 较高（VNode 对象） | 较低（无 VNode） |
| **首次渲染** | 较慢（创建 VNode 树） | 更快（直接 DOM 操作） |
| **更新性能** | 较好（Virtual DOM Diff） | 更好（精准 DOM 更新） |
| **包体积** | 较大（包含 VNode 运行时） | 更小（精简运行时） |
| **兼容性** | 完整 Vue API | 部分限制 |

### 2.5 Vapor Mode 的限制

```
当前限制（Beta 阶段）：
- 不支持 render 函数（h 函数）
- 不支持 $refs（使用 useTemplateRef 替代）
- 不支持 $el（使用 useTemplateRef 替代）
- 不支持 Transition 组件
- 不支持 v-html（使用 ref 直接操作 innerHTML）
- 不支持 $emit（使用 defineEmits 替代）
- 插槽语法有限制

适用场景：
✅ 性能敏感的组件（列表、表格、表单）
✅ 需要极致性能的移动端应用
✅ 嵌入式设备或低性能环境

不适用场景：
❌ 需要完整 Vue API 的复杂组件
❌ 大量使用 render 函数的库
❌ 当前处于 Beta，不建议生产环境使用
```

### 2.6 迁移策略

```vue
<!-- 渐进式迁移：Vapor Mode 和传统模式可以共存 -->

<!-- 传统模式组件 -->
<template>
  <div>
    <VaporCounter />  <!-- Vapor Mode 组件 -->
    <TraditionalList />  <!-- 传统模式组件 -->
  </div>
</template>

<!-- 可以逐步将性能敏感的组件迁移到 Vapor Mode -->
```

---

## 三、自定义指令

### 3.1 指令生命周期钩子

```typescript
// 自定义指令的生命周期钩子（与组件生命周期类似）
// Vue 3 中指令的钩子名称与组件生命周期一致

import type { Directive, DirectiveBinding } from 'vue'

// 指令钩子：
// created - 元素创建后（DOM 还未插入）
// beforeMount - 挂载前
// mounted - 挂载后（DOM 已插入）
// beforeUpdate - 更新前
// updated - 更新后
// beforeUnmount - 卸载前
// unmounted - 卸载后
```

### 3.2 实用指令示例

#### v-focus - 自动聚焦

```typescript
// src/directives/vFocus.ts
import type { Directive } from 'vue'

/**
 * v-focus - 自动聚焦指令
 *
 * @example
 * <input v-focus />
 * <input v-focus.delay="500" />  // 延迟 500ms 聚焦
 */
export const vFocus: Directive<HTMLInputElement, number | undefined> = {
  mounted(el, binding) {
    const delay = binding.value || 0
    if (delay > 0) {
      setTimeout(() => el.focus(), delay)
    } else {
      el.focus()
    }
  },
}

// 全局注册
// app.directive('focus', vFocus)

// 局部使用
// <script setup>
// import { vFocus } from '@/directives/vFocus'
// </script>
```

#### v-permission - 权限控制

```typescript
// src/directives/vPermission.ts
import type { Directive } from 'vue'

/**
 * v-permission - 权限控制指令
 *
 * 根据用户权限决定是否显示元素。
 *
 * @example
 * <button v-permission="'admin'">管理员按钮</button>
 * <button v-permission="['admin', 'editor']">管理员或编辑按钮</button>
 */
export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const requiredRoles = Array.isArray(binding.value)
      ? binding.value
      : [binding.value]

    const currentUserRoles = ['user']  // 从 store 或 token 中获取

    const hasPermission = requiredRoles.some(role =>
      currentUserRoles.includes(role)
    )

    if (!hasPermission) {
      // 没有权限，移除元素
      el.parentNode?.removeChild(el)
      // 或者隐藏元素：el.style.display = 'none'
    }
  },
}
```

#### v-debounce - 防抖指令

```typescript
// src/directives/vDebounce.ts
import type { Directive } from 'vue'

/**
 * v-debounce - 防抖指令
 *
 * 对绑定的事件进行防抖处理。
 *
 * @example
 * <input v-debounce:input="handleSearch" />
 * <button v-debounce:click.500="handleClick">点击</button>
 */
export const vDebounce: Directive = {
  mounted(el, binding) {
    // 解析修饰符
    // v-debounce:input.500 → 事件名: input, 延迟: 500ms
    const event = binding.arg || 'input'
    const delay = parseInt(binding.modifiers._ || '300') || 300

    let timer: ReturnType<typeof setTimeout> | null = null

    const handler = (...args: any[]) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value(...args)
      }, delay)
    }

    // 保存原始事件处理函数
    ;(el as any).__debounceHandler = handler
    el.addEventListener(event, handler)
  },

  unmounted(el, binding) {
    const event = binding.arg || 'input'
    el.removeEventListener(event, (el as any).__debounceHandler)
  },
}
```

#### v-lazy - 图片懒加载

```typescript
// src/directives/vLazy.ts
import type { Directive } from 'vue'

/**
 * v-lazy - 图片懒加载指令
 *
 * 使用 IntersectionObserver 实现图片懒加载。
 *
 * @example
 * <img v-lazy="imageUrl" />
 * <img v-lazy="'/images/photo.jpg'" />
 */
export const vLazy: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    const imageUrl = binding.value

    // 创建 IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 元素进入视口，加载图片
            el.src = imageUrl
            // 加载完成后停止观察
            observer.unobserve(el)
          }
        })
      },
      {
        rootMargin: '100px',  // 提前 100px 开始加载
        threshold: 0.01,
      }
    )

    observer.observe(el)

    // 保存 observer 引用，用于卸载时清理
    ;(el as any).__lazyObserver = observer
  },

  unmounted(el) {
    const observer = (el as any).__lazyObserver
    if (observer) {
      observer.disconnect()
    }
  },

  updated(el, binding) {
    // 如果图片 URL 变化，更新 src
    if (binding.value !== binding.oldValue) {
      el.src = binding.value
    }
  },
}
```

### 3.3 注册指令

```typescript
// 全局注册
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { vFocus, vPermission, vDebounce, vLazy } from './directives'

const app = createApp(App)

// 注册全局指令
app.directive('focus', vFocus)
app.directive('permission', vPermission)
app.directive('debounce', vDebounce)
app.directive('lazy', vLazy)

app.mount('#app')

// 局部使用（在 <script setup> 中）
// import { vFocus } from '@/directives/vFocus'
// 模板中直接使用 <input v-focus />
```

---

## 四、渲染函数（h 函数）

### 4.1 基本用法

```typescript
import { h, ref } from 'vue'

// h 函数签名：
// h(type, props?, children?)
// type: HTML 标签名、组件或函数
// props: 属性对象（包含 class、style、事件等）
// children: 子节点（字符串、数组或 VNode）

// 创建一个简单的元素
const vnode = h('div', { class: 'container' }, 'Hello Vue!')

// 嵌套元素
const vnode2 = h('div', { class: 'container' }, [
  h('h1', null, '标题'),
  h('p', null, '段落内容'),
  h('button', { onClick: () => console.log('clicked') }, '点击'),
])

// 创建组件
import MyComponent from './MyComponent.vue'
const vnode3 = h(MyComponent, {
  title: 'Props',
  onCustomEvent: (data: string) => console.log(data),
})
```

### 4.2 在 setup 中返回渲染函数

```typescript
// 无模板组件（使用渲染函数代替 template）
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)

    return () => h('div', null, [
      h('p', null, `Count: ${count.value}`),
      h('button', { onClick: () => count.value++ }, 'Increment'),
    ])
  },
}

// <script setup> 中的写法（使用 render 函数）
// 注意：<script setup> 中不能直接使用渲染函数
// 需要使用 setup() 返回渲染函数的方式
```

### 4.3 JSX / TSX 支持

```bash
npm install -D @vitejs/plugin-vue-jsx
```

```typescript
// vite.config.ts
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
})
```

```tsx
// 使用 JSX 编写组件
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)

    return () => (
      <div class="container">
        <h1>JSX Component</h1>
        <p>Count: {count.value}</p>
        <button onClick={() => count.value++}>Increment</button>
      </div>
    )
  },
})

// 或者使用 .tsx 文件
// MyButton.tsx
interface MyButtonProps {
  title: string
  onClick?: () => void
}

export default defineComponent({
  props: {
    title: String,
  },
  setup(props: MyButtonProps) {
    return () => (
      <button onClick={props.onClick}>{props.title}</button>
    )
  },
})
```

### 4.4 动态组件的渲染函数写法

```typescript
import { h, ref, computed } from 'vue'

const currentView = ref('home')

const components = {
  home: { render: () => h('div', null, 'Home Page') },
  about: { render: () => h('div', null, 'About Page') },
  contact: { render: () => h('div', null, 'Contact Page') },
}

// 动态渲染组件
const currentComponent = computed(() => components[currentView.value])

// 在渲染函数中使用
// h(currentComponent.value)
```

---

## 五、TypeScript 支持

### 5.1 泛型组件

```vue
<!-- 使用泛型定义 Props 类型 -->
<script setup lang="ts" generic="T extends { id: number }, U extends string">
/**
 * 泛型组件示例
 *
 * T 必须是包含 id: number 的对象
 * U 必须是 string 类型
 */
interface Props {
  items: T[]
  title: U
  selectedId?: number
}

const props = defineProps<Props>()

// emit 也支持泛型
const emit = defineEmits<{
  select: [item: T]
  update: [value: U]
}>()

function handleSelect(item: T) {
  emit('select', item)
}
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <ul>
      <li
        v-for="item in items"
        :key="item.id"
        :class="{ active: item.id === selectedId }"
        @click="handleSelect(item)"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>
```

### 5.2 defineProps 的类型声明方式

```vue
<script setup lang="ts">
// 方式 1：运行时声明（简单场景）
const props = defineProps({
  title: String,
  count: { type: Number, default: 0 },
  items: { type: Array as PropType<string[]>, default: () => [] },
})

// 方式 2：类型声明（推荐，更好的类型推导）
const props = defineProps<{
  title: string
  count?: number           // 可选属性
  items: string[]
  callback?: (id: number) => void  // 函数类型
}>()

// 方式 3：接口声明（复杂类型）
interface UserProps {
  user: {
    id: number
    name: string
    avatar?: string
  }
  permissions: ('read' | 'write' | 'admin')[]
}

const props = defineProps<UserProps>()

// 方式 4：带默认值的类型声明
const props = withDefaults(defineProps<{
  title: string
  count: number
  theme: 'light' | 'dark'
}>(), {
  title: '默认标题',
  count: 0,
  theme: 'light',
})
</script>
```

### 5.3 defineEmits 的类型声明

```vue
<script setup lang="ts">
// 方式 1：类型声明（推荐）
const emit = defineEmits<{
  // 事件名: [参数列表]
  change: [value: string]
  update: [id: number, data: object]
  delete: [id: number]
  // 无参数事件
  refresh: []
}>()

// 方式 2：运行时声明
const emit = defineEmits(['change', 'update', 'delete', 'refresh'])

// 使用
emit('change', 'new value')
emit('update', 1, { name: 'test' })
emit('refresh')
</script>
```

### 5.4 ref 的类型

```typescript
import { ref, reactive, type Ref } from 'vue'

// 基本类型
const count = ref<number>(0)
const name = ref<string>('')

// 对象类型
const user = ref<{ id: number; name: string } | null>(null)

// 数组类型
const items = ref<string[]>([])
const users = ref<User[]>([])

// 使用 Ref 类型注解
const data: Ref<User | null> = ref(null)

// reactive 的类型
const form = reactive<{
  username: string
  password: string
  remember: boolean
}>({
  username: '',
  password: '',
  remember: false,
})
```

### 5.5 组件类型

```typescript
import type { Component } from 'vue'

// 组件类型
const MyComponent: Component = defineComponent({ /* ... */ })

// 组件实例类型
import MyComponent from './MyComponent.vue'
type MyComponentInstance = InstanceType<typeof MyComponent>

// 获取组件引用
const componentRef = ref<MyComponentInstance | null>(null)
// componentRef.value?.somePublicMethod()
```

---

## 六、性能优化

### 6.1 v-once - 只渲染一次

```vue
<template>
  <!-- v-once 只渲染元素和组件一次，之后的重新渲染会跳过 -->
  <!-- 适用于静态内容或只在初始化时计算一次的内容 -->

  <!-- 静态内容 -->
  <div v-once>
    <h1>{{ staticTitle }}</h1>
    <p>这段内容只渲染一次</p>
  </div>

  <!-- 整个组件只渲染一次 -->
  <StaticComponent v-once />

  <!-- v-once 内部的 v-bind 也只会计算一次 -->
  <div v-once>
    <span :class="computedClass">只计算一次的类名</span>
  </div>
</template>
```

### 6.2 v-memo - 条件缓存

```vue
<template>
  <!--
    v-memo 缓存模板的一部分
    只有当依赖的值发生变化时才重新渲染
    适用于大型列表中昂贵的子树
  -->

  <!-- 基本用法 -->
  <div v-memo="[item.id]">
    <!-- 只有当 item.id 变化时才重新渲染 -->
    <h3>{{ item.title }}</h3>
    <p>{{ item.description }}</p>
    <ExpensiveComponent :data="item" />
  </div>

  <!-- 在 v-for 中使用 -->
  <div
    v-for="item in list"
    :key="item.id"
    v-memo="[item.id === selectedId]"
  >
    <!-- 只有当选中的 ID 变化时，对应项才重新渲染 -->
    <ListItem :item="item" />
  </div>

  <!-- 多个依赖 -->
  <div v-memo="[dep1, dep2, dep3]">
    <!-- 当 dep1、dep2 或 dep3 任一变化时重新渲染 -->
    <ExpensiveComponent />
  </div>

  <!-- 注意事项 -->
  <!-- 1. v-memo 不适用于简单元素（开销可能大于收益） -->
  <!-- 2. 正确设置依赖非常重要，否则可能导致更新不正确 -->
  <!-- 3. 通常与 v-for 一起使用 -->
</template>
```

### 6.3 shallowRef - 浅层响应式

```typescript
import { shallowRef, triggerRef } from 'vue'

// shallowRef 只追踪 .value 的变化，不深度追踪
// 适用于大型对象，避免不必要的深层响应式转换

// ref - 深层响应式（默认）
const deepRef = ref({
  nested: {
    count: 0,
  },
})
deepRef.value.nested.count++  // ✅ 触发更新（深度追踪）

// shallowRef - 浅层响应式
const shallow = shallowRef({
  nested: {
    count: 0,
  },
})
shallow.value.nested.count++  // ❌ 不触发更新（浅层追踪）
shallow.value = { nested: { count: 1 } }  // ✅ 触发更新（替换 .value）

// 如果需要手动触发更新
const data = shallowRef({ count: 0 })
data.value.count++
triggerRef(data)  // 手动触发更新
```

### 6.4 shallowReactive - 浅层响应式对象

```typescript
import { shallowReactive } from 'vue'

// shallowReactive 只追踪第一层属性的变化
const state = shallowReactive({
  firstLevel: 'tracked',  // ✅ 追踪变化
  nested: {
    secondLevel: 'not tracked',  // ❌ 不追踪变化
  },
})

state.firstLevel = 'new value'  // ✅ 触发更新
state.nested.secondLevel = 'new value'  // ❌ 不触发更新
state.nested = { secondLevel: 'new value' }  // ✅ 触发更新（替换第一层属性）
```

### 6.5 markRaw - 标记为非响应式

```typescript
import { reactive, markRaw } from 'vue'

// markRaw 将对象标记为永远不会被转为响应式
// 适用于大型不可变数据、第三方库实例等

// 第三方库实例（如 Lodash、ECharts 等）
import * as echarts from 'echarts'

const chartInstance = markRaw(echarts.init(document.getElementById('chart')))

// 在 reactive 中使用
const state = reactive({
  chart: chartInstance,  // 不会被转为响应式
  data: [{ name: 'A', value: 1 }],
})

// 大型配置对象
const config = markRaw({
  // 复杂的配置数据，不需要响应式
  theme: { /* ... */ },
  plugins: [/* ... */],
})
```

### 6.6 computed 缓存优化

```typescript
import { computed } from 'vue'

// computed 有缓存，只有依赖变化时才重新计算
const expensiveValue = computed(() => {
  // 这个计算可能很耗时
  return heavyCalculation(source.value)
})

// 避免在 computed 中执行副作用
// ❌ 错误：在 computed 中修改其他状态
const bad = computed(() => {
  count.value++  // 副作用！
  return someValue.value
})

// ✅ 正确：使用 watch 执行副作用
watch(someValue, (newVal) => {
  count.value++
})
```

### 6.7 列表渲染优化

```vue
<template>
  <!--
    列表渲染优化要点：
    1. 始终使用 :key（使用唯一且稳定的值）
    2. 避免在 v-for 中使用复杂表达式
    3. 大列表考虑虚拟滚动
    4. 使用 v-memo 缓存昂贵的子树
  -->

  <!-- ✅ 正确：使用唯一 ID 作为 key -->
  <li v-for="item in items" :key="item.id">{{ item.name }}</li>

  <!-- ❌ 错误：使用 index 作为 key（可能导致渲染问题） -->
  <li v-for="(item, index) in items" :key="index">{{ item.name }}</li>

  <!-- ✅ 避免在模板中使用复杂计算 -->
  <li v-for="item in processedItems" :key="item.id">
    {{ item.displayName }}
  </li>

  <!-- 在 computed 中预处理数据 -->
  <!--
    const processedItems = computed(() =>
      items.value.map(item => ({
        ...item,
        displayName: formatName(item),
      }))
    )
  -->

  <!-- 虚拟滚动（大列表优化） -->
  <!-- 推荐使用 vue-virtual-scroller 或 @tanstack/vue-virtual -->
  <!--
    <RecycleScroller
      :items="items"
      :item-size="50"
      key-field="id"
      v-slot="{ item }"
    >
      <div>{{ item.name }}</div>
    </RecycleScroller>
  -->
</template>
```

### 6.8 组件懒加载

```typescript
// 使用 defineAsyncComponent 懒加载组件
import { defineAsyncComponent } from 'vue'

// 基本用法
const HeavyComponent = defineAsyncComponent(
  () => import('./HeavyComponent.vue')
)

// 带配置的懒加载
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,    // 加载中显示的组件
  errorComponent: ErrorDisplay,        // 加载失败显示的组件
  delay: 200,                          // 延迟显示 loading
  timeout: 3000,                       // 超时时间
  onError(error, retry, fail, attempts) {
    // 错误处理
    if (attempts <= 3) {
      retry()  // 重试
    } else {
      fail()   // 放弃
    }
  },
})
```

### 6.9 使用 shallowRef 存储大型数据

```typescript
import { shallowRef } from 'vue'

// 对于大型列表数据，使用 shallowRef 避免深层响应式转换
const largeList = shallowRef<Item[]>([])

// 更新数据时替换整个数组
async function fetchItems() {
  const response = await fetch('/api/items')
  const data = await response.json()
  largeList.value = data  // 替换整个 .value 触发更新
}

// 如果需要修改单个元素
function updateItem(id: number, updates: Partial<Item>) {
  const index = largeList.value.findIndex(item => item.id === id)
  if (index !== -1) {
    // 创建新数组触发更新
    const newList = [...largeList.value]
    newList[index] = { ...newList[index], ...updates }
    largeList.value = newList
  }
}
```

---

## 七、SSR（服务端渲染）

### 7.1 Nuxt.js 简介

Nuxt.js 是 Vue.js 的官方 SSR 框架，提供了开箱即用的 SSR 支持。

```bash
# 创建 Nuxt 项目
npx nuxi@latest init my-nuxt-app

# 或使用 create-nuxt
npm create nuxt-app my-nuxt-app
```

### 7.2 Nuxt 3 核心特性

```
Nuxt 3 核心特性：
├── 文件系统路由（基于 pages/ 目录自动生成路由）
├── 自动导入（组件、composables、utils 自动导入）
├── 服务端渲染（SSR）
├── 静态站点生成（SSG）
├── 混合渲染（SSR + SSG + SPA + ISR）
├── 服务端 API 路由（server/api/ 目录）
├── 内置状态管理（useState）
├── 数据获取（useFetch、useAsyncData）
├── SEO 优化（meta 标签、OG 标签）
├── TypeScript 支持
└── Nitro 服务器引擎
```

### 7.3 Nuxt 3 目录结构

```
nuxt-app/
├── pages/              # 页面（自动路由）
│   ├── index.vue       # / 路由
│   ├── about.vue       # /about 路由
│   └── users/
│       ├── index.vue   # /users 路由
│       └── [id].vue    # /users/:id 动态路由
├── components/         # 组件（自动导入）
├── composables/        # 组合式函数（自动导入，use 前缀）
├── layouts/            # 布局
├── server/             # 服务端代码
│   ├── api/            # API 路由
│   └── middleware/     # 服务端中间件
├── middleware/         # 路由中间件
├── plugins/            # 插件
├── public/             # 静态资源
├── assets/             # 资源文件
├── utils/              # 工具函数（自动导入）
├── app.vue             # 根组件
├── nuxt.config.ts      # Nuxt 配置
└── package.json
```

### 7.4 Nuxt 3 数据获取

```vue
<!-- pages/users/[id].vue -->
<script setup lang="ts">
// useFetch - 获取数据并自动处理 SSR/CSR
const { data: user, pending, error } = await useFetch(`/api/users/${useRoute().params.id}`)

// useAsyncData - 自定义数据获取逻辑
const { data: posts } = await useAsyncData(
  `user-posts-${useRoute().params.id}`,
  () => $fetch(`/api/users/${useRoute().params.id}/posts`)
)

// useLazyFetch - 懒加载版本（不阻塞导航）
const { data, pending } = useLazyFetch('/api/data')
</script>

<template>
  <div>
    <h1>{{ user?.name }}</h1>
    <div v-if="pending">加载中...</div>
    <div v-else-if="error">加载失败</div>
    <div v-else>
      <ul>
        <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </div>
  </div>
</template>
```

### 7.5 渲染模式

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 全局渲染模式
  ssr: true,  // 启用/禁用 SSR

  // 路由规则（混合渲染）
  routeRules: {
    // 预渲染（构建时生成静态 HTML）
    '/': { prerender: true },
    '/about': { prerender: true },

    // SSR（每次请求都服务端渲染）
    '/dashboard/**': { ssr: true },

    // SPA（客户端渲染）
    '/admin/**': { ssr: false },

    // ISR（增量静态再生）
    '/blog/**': {
      isr: 3600,  // 每 3600 秒重新生成
    },

    // 缓存策略
    '/api/**': {
      cors: true,
      headers: {
        'cache-control': 's-maxage=60, stale-while-revalidate=300',
      },
    },
  },
})
```

### 7.6 SEO 优化

```vue
<!-- 使用 useSeoMeta 设置页面 SEO 信息 -->
<script setup lang="ts">
useSeoMeta({
  title: '页面标题',
  ogTitle: '分享标题',
  description: '页面描述',
  ogDescription: '分享描述',
  ogImage: '/images/og-image.png',
  ogUrl: 'https://example.com/page',
  twitterCard: 'summary_large_image',
})

// 使用 useHead 设置自定义 head 标签
useHead({
  title: '页面标题',
  meta: [
    { name: 'description', content: '页面描述' },
    { property: 'og:title', content: '分享标题' },
  ],
  link: [
    { rel: 'canonical', href: 'https://example.com/page' },
  ],
})
</script>
```

---

## 八、总结

### Vue 3 生态全景

```
Vue 3 生态系统
├── 核心：Vue 3.5.x（Composition API + Options API）
├── 构建：Vite 6.x（极速开发体验）
├── 路由：Vue Router 4.x（SPA 路由管理）
├── 状态：Pinia 2.x（轻量级状态管理）
├── SSR：Nuxt 3.x（全栈框架）
├── 工具：
│   ├── VueUse（实用 Composable 集合）
│   ├── Vue DevTools（开发者工具）
│   ├── unplugin-vue-components（组件自动导入）
│   └── unplugin-auto-import（API 自动导入）
├── UI 库：
│   ├── Element Plus
│   ├── Ant Design Vue
│   ├── Naive UI
│   └── Vuetify
└── 未来：Vapor Mode（Vue 3.6，无虚拟 DOM）
```

### 学习建议

1. **扎实基础**：先学好 Vue 3 核心概念（响应式、组件、指令）
2. **掌握生态**：熟悉 Vite、Vue Router、Pinia 的使用
3. **深入原理**：理解虚拟 DOM、响应式系统、编译器的工作原理
4. **性能优化**：学会使用 v-once、v-memo、shallowRef 等优化手段
5. **关注前沿**：了解 Vapor Mode 等新特性的发展方向
