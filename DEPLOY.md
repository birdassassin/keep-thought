# Keep Thought 部署指南

> Gitee Pages 已停止服务，推荐使用 Vercel 或 Netlify 部署。

## 方案一：Vercel 部署（推荐）

### 步骤 1：准备代码

确保 demo-app 已构建：

```bash
cd /workspace/keep-thought/demo-app
npm install
npm run build
```

### 步骤 2：安装 Vercel CLI

```bash
npm i -g vercel
```

### 步骤 3：登录并部署

```bash
cd /workspace/keep-thought
vercel login
vercel --prod
```

按提示操作：
- 设置项目名称：`keep-thought-demos`
- 选择目录：`./demo-app`

### 步骤 4：自动部署

每次推送代码到 GitHub 后，Vercel 会自动重新部署。

**部署后的网址格式**：
```
https://keep-thought-demos.vercel.app
```

---

## 方案二：Netlify 部署

### 步骤 1：构建项目

```bash
cd /workspace/keep-thought/demo-app
npm install
npm run build
```

### 步骤 2：拖拽部署

1. 打开 https://app.netlify.com/drop
2. 将 `demo-app/dist` 文件夹拖拽到网页上
3. 自动获得网址

### 步骤 3：连接 Git（可选）

1. 将代码推送到 GitHub
2. 在 Netlify 选择 "Add new site" → "Import an existing project"
3. 选择 GitHub 仓库
4. 构建命令：`cd demo-app && npm run build`
5. 发布目录：`demo-app/dist`

---

## 方案三：GitHub Pages

### 步骤 1：推送到 GitHub

```bash
cd /workspace/keep-thought
git remote add github https://github.com/你的用户名/keep-thought.git
git push github master
```

### 步骤 2：开启 GitHub Pages

1. 打开 GitHub 仓库
2. Settings → Pages
3. Source 选择 "Deploy from a branch"
4. Branch 选择 `gh-pages` / `root`
5. 保存

**网址格式**：
```
https://你的用户名.github.io/keep-thought/
```

---

## 方案四：Cloudflare Pages

### 步骤 1：连接仓库

1. 打开 https://dash.cloudflare.com
2. Pages → Create a project
3. 连接 GitHub 仓库

### 步骤 2：配置构建设置

- **构建命令**：`cd demo-app && npm run build`
- **构建输出目录**：`demo-app/dist`

### 步骤 3：部署

点击保存，自动部署完成。

---

## 推荐方案对比

| 平台 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Vercel** | 极速、自动部署、CLI友好 | 国内访问较慢 | ⭐⭐⭐⭐⭐ |
| **Netlify** | 拖拽部署、功能丰富 | 国内访问较慢 | ⭐⭐⭐⭐ |
| **GitHub Pages** | 免费、与GitHub集成 | 仅静态、无CI/CD | ⭐⭐⭐ |
| **Cloudflare** | 全球最快、无限请求 | 配置稍复杂 | ⭐⭐⭐⭐ |

---

## 国内访问优化

如果主要面向国内用户，建议：

1. **使用国内 CDN**：腾讯云 COS + CDN、阿里云 OSS + CDN
2. **Vercel 自定义域名**：绑定国内备案域名，走国内 CDN
3. **Netlify 镜像**：使用 netlify.app 的国内镜像

---

## 需要帮助？

告诉我你选择的平台，我可以提供更详细的部署指导。
