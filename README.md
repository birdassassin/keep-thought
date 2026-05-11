# Keep Thought - 前端技术示例代码集合

> 从零开始学习前端技术，每个知识点都有详细中文注释，无需再看官方文档。

## 📁 项目结构

```
keep-thought/
├── react19-demos/           # ✅ React 19 新特性
├── redux-toolkit-demo/      # ✅ Redux Toolkit + RTK Query
├── nextjs-demo/             # ✅ Next.js 15 App Router
├── es6-demo/                # ✅ ES6+ 现代 JavaScript
├── typescript-advanced/     # ✅ TypeScript 高级类型
├── remix-demo/              # ✅ Remix 全栈框架
├── react-router-demo/       # ✅ React Router 7
├── react-form-demo/         # ✅ React Form 表单处理
└── demo-app/                # 🌐 在线演示网站
```

## 🚀 已包含的示例

| 技术 | 版本 | 示例数量 | 内容 |
|------|------|----------|------|
| **React 19** | 19.x | 6 个 | Actions、useOptimistic、use()、ref as prop、Form Actions、Metadata |
| **Redux Toolkit** | 2.x | 10 个 | Slice、Thunk、RTK Query、createSelector、中间件 |
| **Next.js** | 15.x | 6 个 | App Router、Server Components、Data Fetching、Server Actions |
| **ES6+** | ES2015-ES2024 | 6 个 | 箭头函数、解构、Promise、async/await、模块化、迭代器 |
| **TypeScript** | 5.x | 6 个 | 泛型、条件类型、映射类型、模板字面量、工具类型、类型模式 |
| **Remix** | 2.x | 5 个 | 路由、Loader、Action、Session、中间件 |
| **React Router** | 7.x | 5 个 | 嵌套路由、Data Routing、懒加载、错误边界、框架模式 |
| **React Form** | RHF 7 + Zod | 5 个 | 受控组件、React Hook Form、Zod验证、动态字段、Server Actions |

## 📖 学习路径

### 初学者路径
1. **ES6+ 基础** → 掌握现代 JavaScript 语法
2. **TypeScript 入门** → 类型安全编程
3. **React 19** → React 最新特性
4. **React Router** → 单页应用路由

### 进阶路径
1. **Redux Toolkit** → 状态管理
2. **React Form** → 表单处理最佳实践
3. **Next.js** → 服务端渲染
4. **Remix** → 全栈开发

## 🌐 在线演示

访问在线演示网站（需要先开启 Gitee Pages）：
```
https://birdassassin.gitee.io/keep-thought/
```

## 🛠️ 如何使用

每个子目录都是独立的教程，包含详细注释：

```bash
# 查看某个教程
cd nextjs-demo
cat README.md

# 示例代码可以直接复制到项目中使用
```

## 📚 各技术详细目录

<details>
<summary><b>Next.js 15 示例目录</b></summary>

- 01-basics.md - 项目创建、目录结构、第一个页面
- 02-app-router.md - 文件路由、动态路由、布局、错误处理
- 03-server-components.md - Server vs Client Components
- 04-data-fetching.md - fetch 缓存、revalidate、流式渲染
- 05-server-actions.md - 表单处理、数据变更
- 06-advanced.md - 中间件、API Routes、SEO、性能优化
</details>

<details>
<summary><b>ES6+ 示例目录</b></summary>

- 01-basics.js - let/const、箭头函数、模板字符串
- 02-functions.js - rest参数、解构参数、尾调用优化
- 03-objects.js - 解构赋值、Object新方法、Proxy/Reflect
- 04-async.js - Promise、async/await、事件循环
- 05-modules.js - import/export、动态导入
- 06-advanced.js - 迭代器、生成器、Map/Set、私有字段
</details>

<details>
<summary><b>TypeScript 高级示例目录</b></summary>

- 01-generics.ts - 泛型函数、泛型约束、条件泛型
- 02-conditional.ts - infer关键字、分布式条件类型
- 03-mapped.ts - 映射类型、keyof、修饰符
- 04-template-literal.ts - 字符串推断、联合分发
- 05-utility-types.ts - Partial、Pick、Record、ReturnType
- 06-patterns.ts - 类型守卫、函数重载、声明合并
</details>

<details>
<summary><b>React Router 7 示例目录</b></summary>

- 01-basics.tsx - BrowserRouter、Link、useNavigate、useParams
- 02-nested-routing.tsx - Outlet、嵌套布局、索引路由
- 03-data-routing.tsx - loader、action、Form、useFetcher
- 04-advanced.tsx - 懒加载、错误边界、路由守卫
- 05-framework-mode.md - 文件路由、SSR配置、类型安全
</details>

<details>
<summary><b>React Form 示例目录</b></summary>

- 01-controlled.tsx - 受控组件、表单提交
- 02-react-hook-form.tsx - useForm、register、handleSubmit
- 03-validation.tsx - Zod schema、自定义验证、异步验证
- 04-advanced.tsx - useFieldArray、FormProvider、表单联动
- 05-server-actions.tsx - useActionState、useOptimistic
</details>

## 🤝 贡献

欢迎提交 PR 添加更多示例代码！

## 📄 许可证

MIT
