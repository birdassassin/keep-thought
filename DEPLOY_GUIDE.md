# Keep Thought 部署指南

由于 Gitee Pages 已停止服务，以下是部署到替代平台的详细步骤。

## 方案一：Vercel（推荐）

Vercel 是部署前端应用的最佳选择，支持自动部署、自定义域名。

### 步骤：

1. **访问 Vercel 官网**
   - 打开 https://vercel.com
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择 "Import Git Repository"
   - 如果 Gitee 仓库无法直接导入，先将代码推送到 GitHub

3. **配置构建设置**
   - **Framework Preset**: Vite
   - **Root Directory**: `demo-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约 1-2 分钟）
   - 获得类似 `https://keep-thought-xxx.vercel.app` 的域名

### 自动部署

配置完成后，每次推送到 GitHub 都会自动重新部署。

---

## 方案二：Netlify

Netlify 提供类似的静态网站托管服务。

### 步骤：

1. **访问 Netlify**
   - 打开 https://www.netlify.com
   - 注册/登录账号

2. **部署方式**
   - 方式 A：拖拽 `demo-app/dist` 文件夹到 Netlify 部署页面
   - 方式 B：连接 Git 仓库自动部署

3. **Git 部署配置**
   - Build command: `npm run build`
   - Publish directory: `demo-app/dist`
   - Base directory: `demo-app`

---

## 方案三：Cloudflare Pages

Cloudflare Pages 提供全球 CDN 加速。

### 步骤：

1. **访问 Cloudflare**
   - 打开 https://pages.cloudflare.com
   - 登录 Cloudflare 账号

2. **创建项目**
   - 点击 "Create a project"
   - 连接 Git 仓库

3. **构建设置**
   - Build command: `cd demo-app && npm run build`
   - Build output directory: `demo-app/dist`

---

## 方案四：GitHub Pages

如果你使用 GitHub 存储代码。

### 步骤：

1. **将代码推送到 GitHub**
   ```bash
   # 在 keep-thought 目录下
   git remote add github https://github.com/你的用户名/keep-thought.git
   git push github main
   ```

2. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

3. **创建工作流文件**
   已为你创建 `.github/workflows/deploy.yml`

---

## 快速部署检查清单

- [ ] 项目已构建（`demo-app/dist` 文件夹存在）
- [ ] 已选择部署平台并注册账号
- [ ] 已配置正确的构建设置
- [ ] 部署成功并获取在线 URL

## 当前项目状态

✅ 项目已构建完成
✅ Vercel 配置文件已创建 (`demo-app/vercel.json`)
✅ 构建输出位于 `demo-app/dist`

你只需要将项目导入到选择的平台即可！
