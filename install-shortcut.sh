#!/usr/bin/env bash
# 行囊 Packwell — 桌面快捷方式安装脚本
# 用途：在桌面/应用菜单创建快捷方式，双击即可启动应用
# 用法：./install-shortcut.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 确保启动脚本有可执行权限
chmod +x "${SCRIPT_DIR}/start.sh"

# 选择图标
ICON_PATH="${SCRIPT_DIR}/public/favicon.svg"
DESKTOP_FILE="${HOME}/.local/share/applications/packwell.desktop"

mkdir -p "${HOME}/.local/share/applications"

cat > "${DESKTOP_FILE}" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=行囊 Packwell
GenericName=旅行物品清单
Comment=旅行物品清单管理应用
Exec=${SCRIPT_DIR}/start.sh
Icon=${ICON_PATH}
Terminal=true
Categories=Utility;Office;
Keywords=travel;checklist;packwell;旅行;清单;行李;
StartupNotify=true
EOF

chmod +x "${DESKTOP_FILE}"

# 刷新桌面数据库
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "${HOME}/.local/share/applications" 2>/dev/null || true
fi

echo "=========================================="
echo "  ✓ 桌面快捷方式已创建"
echo "=========================================="
echo ""
echo "现在你可以通过以下方式启动「行囊 Packwell」："
echo ""
echo "  1. 应用菜单中搜索「行囊」或「Packwell」"
echo "  2. 桌面环境的应用列表中找到「行囊 Packwell」图标"
echo "  3. 或直接双击运行：${SCRIPT_DIR}/start.sh"
echo ""
echo "快捷方式文件位置：${DESKTOP_FILE}"
echo ""
