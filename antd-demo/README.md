# Ant Design 5.x 完整教程示例

> 面向新手的 Ant Design 5.x 组件库教学项目，涵盖从基础组件到高级用法的完整示例。

## 版本信息

| 依赖 | 版本 | 说明 |
|------|------|------|
| React | 19.x | 最新稳定版，支持并发特性 |
| antd | 5.x | 当前主版本，采用 CSS-in-JS 方案 |
| TypeScript | 5.x | 类型安全 |
| @ant-design/icons | 5.x | 官方图标库 |

> **注意**：Ant Design 6.x 目前处于开发阶段（alpha/beta），本教程基于稳定的 5.x 版本。

## Ant Design 5.x 核心特性

### 1. CSS-in-JS 架构
- 移除了 Less 依赖，全面拥抱 CSS-in-JS（基于 `@ant-design/cssinjs`）
- 无需手动引入样式文件，组件自带样式
- 支持运行时动态主题切换，无需重新编译

### 2. Design Token 主题系统
- 通过 `ConfigProvider` 的 `theme` 属性进行全局主题定制
- 支持 Seed Token（种子变量）、Map Token（映射变量）、Component Token（组件级变量）三层定制
- 提供了 `theme.useToken()` Hook 在组件内获取主题变量

### 3. 暗黑模式
- 内置暗黑主题算法 `theme.darkAlgorithm`
- 一行配置即可切换暗黑模式
- 支持跟随系统主题偏好自动切换

### 4. 国际化（i18n）
- 内置多语言包（中文、英文、日文等 50+ 语言）
- 通过 `ConfigProvider` 的 `locale` 属性配置
- 支持自定义语言包

### 5. 静态方法改进
- `message`、`notification`、`modal` 等静态方法支持通过 `App` 组件获取上下文
- 解决了静态方法无法读取 ConfigProvider 配置的历史问题

## 安装与配置

### 1. 创建项目

```bash
# 使用 Vite 创建 React + TypeScript 项目
npm create vite@latest antd-demo -- --template react-ts
cd antd-demo
```

### 2. 安装依赖

```bash
# 安装 antd 和图标库
npm install antd @ant-design/icons
```

### 3. 基础配置

在 `src/main.tsx` 中进行全局配置：

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn'; // antd 5.x 使用 dayjs 替代 moment
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff', // 主色调
          borderRadius: 6,         // 全局圆角
        },
      }}
    >
      <App>
        {/* 你的应用内容 */}
      </App>
    </ConfigProvider>
  </React.StrictMode>
);
```

### 4. 使用静态方法（推荐方式）

antd 5.x 推荐通过 `App` 组件包裹应用，使用 Hook 获取静态方法实例：

```tsx
import { App } from 'antd';

function MyComponent() {
  const { message, modal, notification } = App.useApp();

  const handleClick = () => {
    message.success('操作成功！');
  };

  return <Button onClick={handleClick}>点击提示</Button>;
}
```

## 示例目录

| 文件 | 内容 | 核心组件 |
|------|------|----------|
| `01-basics.tsx` | 基础组件入门 | Button、Input、Typography、Space、Divider、ConfigProvider |
| `02-form.tsx` | 表单完整用法 | Form、Form.Item、Form.List、输入验证、表单联动 |
| `03-table.tsx` | 数据表格 | Table、排序、筛选、分页、选择、树形数据、行内编辑 |
| `04-feedback.tsx` | 反馈类组件 | Message、Notification、Modal、Drawer、Popconfirm、Progress、Result、Skeleton、Spin |
| `05-navigation.tsx` | 导航类组件 | Menu、Tabs、Breadcrumb、Pagination、Steps、Dropdown |
| `06-layout.tsx` | 布局类组件 | Layout、Grid、Flex、Card、Carousel、Collapse |
| `07-advanced.tsx` | 高级用法 | 自定义主题、暗黑模式、CSS-in-JS、国际化、ProComponents |

## 学习建议

1. **按顺序学习**：从 01 到 07 依次学习，由浅入深
2. **动手实践**：每个示例都可以直接复制到项目中运行
3. **查阅文档**：遇到不理解的属性，查阅 [Ant Design 官方文档](https://ant.design/components/overview-cn/)
4. **关注变更**：antd 5.x 相比 4.x 有较大变化，如果你之前使用 4.x，请关注 [迁移指南](https://ant.design/docs/react/migration-v5-cn)

## 常见问题

### Q: antd 5.x 还需要引入样式文件吗？
**A:** 不需要。antd 5.x 使用 CSS-in-JS，样式会随组件自动注入。

### Q: 如何自定义主题？
**A:** 通过 `ConfigProvider` 的 `theme` 属性，使用 Design Token 进行定制。详见 `07-advanced.tsx`。

### Q: antd 5.x 兼容 React 19 吗？
**A:** 兼容。antd 5.x 已支持 React 19，包括并发特性。

### Q: 从 antd 4.x 迁移需要注意什么？
**A:** 主要变化包括：移除 Less、CSS-in-JS 架构、静态方法推荐使用 Hook 方式、移除了部分过时 API。详见官方迁移指南。

## 参考链接

- [Ant Design 官方文档](https://ant.design/index-cn)
- [Ant Design GitHub](https://github.com/ant-design/ant-design)
- [Ant Design 5.0 发布公告](https://ant.design/blog/antd-5.0-cn)
- [Ant Design 迁移指南](https://ant.design/docs/react/migration-v5-cn)
