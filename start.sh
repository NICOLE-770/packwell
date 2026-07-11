#!/usr/bin/env bash
# 行囊 Packwell — 一键启动脚本
# 用途：启动本地预览服务器并自动打开默认浏览器
# 用法：./start.sh

set -e

# ===== 配置区 =====
PORT=4173                 # 预览服务器端口
APP_URL="http://localhost:${PORT}"
# ==================

# 获取本机局域网 IP（用于手机访问）
get_lan_ip() {
  if command -v hostname >/dev/null 2>&1; then
    hostname -I 2>/dev/null | awk '{print $1}' | head -n1
  elif command -v ip >/dev/null 2>&1; then
    ip -4 addr 2>/dev/null | grep -oP 'inet \K[\d.]+' | grep -v '^127\.' | head -n1
  fi
}
LAN_IP=$(get_lan_ip)

# 定位脚本所在目录（即项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  行囊 · Packwell  启动中..."
echo "=========================================="

# 1. 检查 Node 是否安装
if ! command -v node >/dev/null 2>&1; then
  echo "[错误] 未检测到 Node.js，请先安装 Node 18+：https://nodejs.org/"
  read -p "按回车键退出..."
  exit 1
fi

# 2. 检查依赖是否已安装，没有则自动安装
if [ ! -d "node_modules" ]; then
  echo "[初始化] 首次运行，正在安装依赖（约 30-60 秒）..."
  npm install --silent
  echo "[初始化] 依赖安装完成。"
fi

# 3. 检查是否已构建 dist 目录，没有则自动构建
if [ ! -d "dist" ]; then
  echo "[构建] 正在构建生产版本..."
  npm run build
  echo "[构建] 构建完成。"
fi

# 4. 如果端口已被占用，先尝试杀掉旧进程
if command -v lsof >/dev/null 2>&1; then
  PID=$(lsof -ti:${PORT} 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "[提示] 端口 ${PORT} 被占用，正在清理旧进程..."
    kill -9 $PID 2>/dev/null || true
    sleep 1
  fi
fi

# 5. 启动预览服务器（后台运行）
echo "[启动] 预览服务器：${APP_URL}"
nohup npm run preview -- --port "${PORT}" --host > /tmp/packwell-server.log 2>&1 &
SERVER_PID=$!

# 6. 等待服务器就绪
echo -n "[等待] 服务启动中"
for i in $(seq 1 20); do
  if curl -s "${APP_URL}" >/dev/null 2>&1; then
    echo " 就绪"
    break
  fi
  echo -n "."
  sleep 0.5
done

# 7. 自动打开默认浏览器
echo "[浏览器] 正在打开默认浏览器..."
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${APP_URL}" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "${APP_URL}" >/dev/null 2>&1 || true
elif command -v start >/dev/null 2>&1; then
  start "${APP_URL}" >/dev/null 2>&1 || true
else
  echo "[提示] 未能自动打开浏览器，请手动访问：${APP_URL}"
fi

echo ""
echo "=========================================="
echo "  ✓ 行囊 Packwell 已启动"
echo "  本机访问：${APP_URL}"
if [ -n "${LAN_IP}" ]; then
  echo "  手机访问：http://${LAN_IP}:${PORT}"
fi
echo "  服务器日志：/tmp/packwell-server.log"
echo "  关闭服务：在终端执行 kill ${SERVER_PID}"
echo "=========================================="
echo ""
if [ -n "${LAN_IP}" ]; then
  echo "📱 手机安装步骤："
  echo "   1. 手机与电脑连接同一 WiFi"
  echo "   2. 用手机浏览器打开 http://${LAN_IP}:${PORT}"
  echo "   3. iOS：Safari 分享按钮 → 添加到主屏幕"
  echo "      Android：Chrome 菜单 → 添加到主屏幕 / 安装应用"
  echo "   4. 桌面会出现「行囊」图标，点击即用，离线可用"
  echo ""
fi
echo "（此窗口可保持打开以查看运行状态，直接关闭窗口不会停止服务）"
read -p "按回车键停止服务并退出..." _
kill ${SERVER_PID} 2>/dev/null || true
echo "服务已停止。"
