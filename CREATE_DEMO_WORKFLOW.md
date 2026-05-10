# create-demo 工作流文档

> **触发方式**: 用户说"用 create-demo 做一个 XXX 的 demo"时，按此文档执行。

## 一、工作流总览

```
用户请求 → 技术调研 → 创建示例代码 → 更新 Demo App → 构建 → 推送到 Gitee → 更新 Pages
```

## 二、详细步骤

### 步骤 1: 技术调研

1. 搜索该技术的**最新版本号**和**最新特性**
2. 搜索该技术的**官方文档**和**最佳实践**
3. 整理出**所有知识点清单**（初级/中级/高级）

### 步骤 2: 创建示例代码

在 `/workspace/keep-thought/` 下创建新目录，命名规则：
```
{技术名}-demo/          # 例如: nextjs-demo, tailwind-demo
├── README.md           # 教程目录和说明
├── package.json        # 项目配置
└── src/
    └── examples/       # 所有示例文件
        ├── 01-基础概念.tsx
        ├── 02-初级用法.tsx
        ├── 03-中级用法.tsx
        └── 04-高级用法.tsx
```

**示例代码要求**：
- ✅ 使用该技术的**最新版本**
- ✅ 每个知识点一个独立文件
- ✅ **详细中文注释**，新手看代码就能学会
- ✅ 按难度分级：初级 → 中级 → 高级
- ✅ 涵盖**所有**核心知识点
- ✅ 包含 TypeScript 类型定义

**难度分级标准**：
| 级别 | 内容 | 示例 |
|------|------|------|
| 初级 | 基础概念、安装配置、简单用法 | 安装、基本 API、Hello World |
| 中级 | 常用模式、组合用法、实际场景 | 表单处理、数据获取、状态管理 |
| 高级 | 性能优化、底层原理、高级模式 | 自定义 Hook、SSR、源码分析 |

### 步骤 3: 更新 Demo App

1. 在 `/workspace/keep-thought/demo-app/src/features/` 下创建新模块
2. 将核心示例改造为**可运行的交互式组件**
3. 在 `/workspace/keep-thought/demo-app/src/App.tsx` 中添加新 Tab
4. 安装新依赖到 demo-app

### 步骤 4: 构建并部署

```bash
# 1. 构建静态文件
cd /workspace/keep-thought/demo-app
npm run build

# 2. 推送示例代码到 master 分支
cd /workspace/keep-thought
git add .
git commit -m "Add {技术名} demos"
git push https://oauth2:{TOKEN}@gitee.com/birdassassin/keep-thought.git master

# 3. 更新 gh-pages 分支
cd /workspace/keep-thought/demo-app
git init -b gh-pages
cp -r dist/* .
git add .
git commit -m "Update demo site"
git push -f https://oauth2:{TOKEN}@gitee.com/birdassassin/keep-thought.git gh-pages
```

### 步骤 5: 确认部署

- Pages 地址: https://birdassassin.gitee.io/keep-thought/
- 仓库地址: https://gitee.com/birdassassin/keep-thought

## 三、配置信息

Gitee 配置保存在 `/workspace/keep-thought/.gitee-config.json` 中（不提交到仓库）。

## 四、已完成的技术 Demo

| 技术 | 状态 | 示例数量 |
|------|------|----------|
| React 19 | ✅ 已完成 | 6 个交互式 Demo |
| Redux Toolkit + RTK Query | ✅ 已完成 | 10 个教程 + 3 个交互式 Demo |

## 五、待添加的技术 Demo

| 技术 | 优先级 |
|------|--------|
| Next.js | 高 |
| TypeScript 高级用法 | 高 |
| Tailwind CSS | 中 |
| Zustand | 中 |
| React Query (TanStack Query) | 中 |
| Vue 3 | 中 |
| Vite | 低 |
| WebSocket | 低 |
