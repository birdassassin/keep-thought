# React Form 完整教程示例

本教程涵盖 React 表单开发的完整知识体系，从基础到高级，帮助你掌握现代 React 表单开发技能。

## 版本信息

| 库名称 | 版本 | 说明 |
|--------|------|------|
| React | 19.x | 最新版本，支持 Form Actions |
| React Hook Form | 7.x | 高性能表单库 |
| Zod | 3.x | TypeScript 优先的 schema 验证库 |
| @hookform/resolvers | 3.x | 验证解析器 |

## 核心库介绍

### React Hook Form 7

React Hook Form 是一个高性能、灵活的表单库，具有以下特点：

- **性能优化**：通过非受控组件减少重渲染
- **体积小**：压缩后仅约 8KB
- **易于使用**：API 简洁直观
- **验证支持**：内置验证，支持多种验证库
- **表单状态管理**：完整的表单状态追踪

```bash
npm install react-hook-form
```

### Zod

Zod 是一个 TypeScript 优先的 schema 声明和验证库：

- **类型推断**：从 schema 自动推断 TypeScript 类型
- **链式 API**：优雅的链式调用语法
- **丰富的验证规则**：内置大量验证方法
- **错误消息自定义**：灵活的错误消息配置

```bash
npm install zod
```

### React 19 Form Actions

React 19 引入了原生的表单处理能力：

- **useActionState**：管理表单 action 的状态
- **useFormStatus**：获取表单提交状态
- **useOptimistic**：乐观更新支持
- **表单 action 属性**：直接在 form 上使用 action

```bash
# React 19 已内置，无需额外安装
npm install react@latest react-dom@latest
```

## 示例目录

| 文件 | 内容 | 难度 |
|------|------|------|
| [01-controlled.tsx](./src/examples/01-controlled.tsx) | 受控组件基础、useState 表单 | 入门 |
| [02-react-hook-form.tsx](./src/examples/02-react-hook-form.tsx) | React Hook Form 核心用法 | 入门 |
| [03-validation.tsx](./src/examples/03-validation.tsx) | Zod 验证、自定义验证、异步验证 | 进阶 |
| [04-advanced.tsx](./src/examples/04-advanced.tsx) | 动态字段、表单联动、条件字段 | 进阶 |
| [05-server-actions.tsx](./src/examples/05-server-actions.tsx) | React 19 Form Actions | 高级 |

## 学习路径

```
01-controlled.tsx (受控组件基础)
        ↓
02-react-hook-form.tsx (React Hook Form 入门)
        ↓
03-validation.tsx (表单验证)
        ↓
04-advanced.tsx (高级用法)
        ↓
05-server-actions.tsx (React 19 新特性)
```

## 快速开始

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

## 推荐阅读顺序

1. **新手**：从 `01-controlled.tsx` 开始，理解受控组件的概念
2. **进阶**：学习 `02-react-hook-form.tsx`，掌握现代表单开发方式
3. **验证**：阅读 `03-validation.tsx`，学习表单验证最佳实践
4. **高级**：研究 `04-advanced.tsx`，处理复杂表单场景
5. **新特性**：探索 `05-server-actions.tsx`，了解 React 19 的表单处理

## 相关资源

- [React Hook Form 官方文档](https://react-hook-form.com/)
- [Zod 官方文档](https://zod.dev/)
- [React 19 官方文档](https://react.dev/blog/2024/12/05/react-19)
- [React Form Actions RFC](https://github.com/reactjs/rfcs/blob/main/text/0224-react-forms.md)
