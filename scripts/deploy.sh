#!/bin/bash
# ============================================================================
# deploy.sh - 自动部署脚本
# ============================================================================
# 用法:
#   bash scripts/deploy.sh                    # 完整部署（构建+推送代码+更新Pages）
#   bash scripts/deploy.sh --code-only        # 只推送代码到 master
#   bash scripts/deploy.sh --pages-only       # 只更新 Pages
#   bash scripts/deploy.sh --build-only       # 只构建
# ============================================================================

set -e  # 任何命令失败时退出

# ============================================================================
# 读取配置
# ============================================================================
WORKSPACE="/workspace/keep-thought"
CONFIG="$WORKSPACE/.gitee-config.json"

if [ ! -f "$CONFIG" ]; then
  echo "❌ 配置文件不存在: $CONFIG"
  echo "请创建 .gitee-config.json 文件"
  exit 1
fi

# 从配置文件读取（使用 node 解析 JSON）
TOKEN=$(node -e "const c=require('$CONFIG'); console.log(c.gitee.token)")
REPO_URL="https://oauth2:${TOKEN}@gitee.com/birdassassin/keep-thought.git"
DEMO_APP="$WORKSPACE/demo-app"

echo "🚀 Keep Thought 部署脚本"
echo "========================"

# ============================================================================
# 解析参数
# ============================================================================
BUILD=true
PUSH_CODE=true
PUSH_PAGES=true

for arg in "$@"; do
  case $arg in
    --build-only)   PUSH_CODE=false; PUSH_PAGES=false ;;
    --code-only)    BUILD=false; PUSH_PAGES=false ;;
    --pages-only)   BUILD=false; PUSH_CODE=false ;;
    --help)         echo "用法: bash deploy.sh [--build-only|--code-only|--pages-only]"; exit 0 ;;
  esac
done

# ============================================================================
# 步骤 1: 构建
# ============================================================================
if [ "$BUILD" = true ]; then
  echo ""
  echo "📦 步骤 1/3: 构建静态文件..."
  cd "$DEMO_APP"
  npm install --silent 2>/dev/null
  npm run build
  echo "✅ 构建完成"
fi

# ============================================================================
# 步骤 2: 推送代码到 master
# ============================================================================
if [ "$PUSH_CODE" = true ]; then
  echo ""
  echo "📝 步骤 2/3: 推送代码到 master 分支..."
  cd "$WORKSPACE"
  git add .
  git diff --cached --quiet || git commit -m "Update demos - $(date '+%Y-%m-%d %H:%M')"
  git push "$REPO_URL" master
  echo "✅ 代码已推送到 master"
fi

# ============================================================================
# 步骤 3: 更新 Gitee Pages
# ============================================================================
if [ "$PUSH_PAGES" = true ]; then
  echo ""
  echo "🌐 步骤 3/3: 更新 Gitee Pages..."
  cd "$DEMO_APP"

  # 保存当前的 gh-pages 配置
  if [ -d ".git" ]; then
    rm -rf .git
  fi

  git init -b gh-pages
  git config user.email "demo@example.com"
  git config user.name "Demo User"

  # 复制构建产物
  cp -r dist/* .

  git add .
  git commit -m "Update Pages - $(date '+%Y-%m-%d %H:%M')" --allow-empty
  git push -f "$REPO_URL" gh-pages

  echo "✅ Pages 已更新"
fi

# ============================================================================
# 完成
# ============================================================================
echo ""
echo "========================"
echo "🎉 部署完成！"
echo "📍 仓库: https://gitee.com/birdassassin/keep-thought"
echo "🌐 Pages: https://birdassassin.gitee.io/keep-thought/"
echo "========================"
