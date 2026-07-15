#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

echo "📦 构建中..."
npm run build

echo "🚀 部署到 GitHub Pages..."
cd dist

REMOTE=$(git -C .. remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
  echo "❌ 未找到远程仓库，请先配置 git remote"
  exit 1
fi

git init
git config user.name "Deploy Bot"
git config user.email "deploy@localhost"
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git branch -M gh-pages
git push -f "$REMOTE" gh-pages

cd ..
rm -rf dist/.git

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址: https://NICOLE-770.github.io/packwell/"
echo ""
echo "💡 提示：GitHub Pages 可能需要 1-2 分钟生效"