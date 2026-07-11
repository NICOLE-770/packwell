# 行囊 · Packwell — 旅行物品清单

一款专注于旅行物品清单管理的 Web 应用，帮助你出行前快速对照、分类整理行李，并通过链接与联系人共享清单协同打包。支持作为 PWA 安装到手机桌面，离线可用，体验接近原生 App。

## ✨ 核心功能

- **清单工作台**：分类列表、物品勾选、进度统计、快速检索、批量操作
- **多清单管理**：新建/切换/复制为模板/重命名/删除多份旅行清单
- **分类管理**：内置常用旅行分类，支持自定义新增分类与图标
- **共享中心**：生成可分享链接、二维码导出、复制清单为纯文本
- **备份与恢复**：导出 JSON 文件备份、从 JSON 文件导入恢复
- **从共享链接导入**：一键将他人分享的只读清单转为本地可编辑副本
- **PWA 手机应用**：可安装到手机桌面，全屏运行、离线可用

## 📱 安装到手机桌面（PWA）

本应用是 PWA（渐进式 Web 应用），可一键安装到手机桌面，像原生 App 一样使用。首次加载后自动缓存，离线也能打开。

### 推荐：公网部署（一次部署，随处可用）

将应用部署到公网静态托管，获得一个永久网址，手机随时访问，还能「添加到主屏幕」做全屏 App。

**Vercel（推荐，最快）**
1. 将项目推送到 GitHub 仓库
2. 打开 [vercel.com](https://vercel.com/) 注册/登录
3. 点击「Add New...」→「Project」→ 选择你的 GitHub 仓库
4. 框架选 Vite，其他保持默认，点击「Deploy」
5. 约 1 分钟后部署完成，获得网址（如 `your-project.vercel.app`）

项目已包含 [vercel.json](file:///workspace/vercel.json)，自动配置 SPA 路由回退和 PWA 响应头。

**Netlify**
1. 将项目推送到 GitHub 仓库
2. 打开 [netlify.com](https://www.netlify.com/) 注册/登录
3. 点击「Add new site」→「Import an existing project」→ 连接 GitHub
4. 选择仓库，构建命令 `npm run build`，发布目录 `dist`
5. 点击「Deploy site」

项目已包含 [netlify.toml](file:///workspace/netlify.toml)，自动配置 SPA 路由回退和 PWA 响应头。

**GitHub Pages**
1. 将项目推送到 GitHub 仓库
2. 在仓库 Settings → Pages 中，Source 选「GitHub Actions」
3. 创建 `.github/workflows/deploy.yml` 工作流构建并部署
4. 获得 `username.github.io/repo-name` 网址

> 注意：GitHub Pages 部署在子路径下时，需在 [vite.config.ts](file:///workspace/vite.config.ts) 中设置 `base: '/repo-name/'`。

### 手机安装到桌面

部署完成后，用手机浏览器访问你的网址：

**iOS（iPhone / iPad）**
1. 用 **Safari** 打开网址（必须用 Safari，Chrome 不支持）
2. 点击底部「分享」按钮（方框向上箭头）
3. 选择「添加到主屏幕」
4. 点击「添加」，桌面即出现「行囊」图标

**Android**
1. 用 **Chrome** 浏览器打开网址
2. 点击右上角菜单（⋮）
3. 选择「安装应用」或「添加到主屏幕」
4. 桌面出现「行囊」图标

### 使用

点击桌面图标即可全屏启动应用，无需浏览器地址栏，离线也能用（首次加载后自动缓存）。数据存在手机本地。

### 局域网临时访问（不推荐长期使用）

如果不想公网部署，也可以在电脑上本地启动，手机连同一 WiFi 访问：

```bash
./start.sh
```

脚本会输出手机访问地址。但电脑需保持开机，且 PWA 安装功能在局域网 IP 下可能受限。

## 🚀 电脑端一键启动

### 方式一：启动脚本（最简单）

```bash
./start.sh
```

脚本会自动完成：
1. 检查并安装依赖（首次运行）
2. 构建生产版本（如未构建）
3. 启动本地预览服务器
4. 自动打开默认浏览器访问应用
5. 输出手机访问地址与安装指引

### 方式二：创建桌面快捷方式

```bash
./install-shortcut.sh
```

执行后即可在系统应用菜单中搜索「行囊」或「Packwell」，点击图标启动应用。

> 创建的快捷方式文件位于：`~/.local/share/applications/packwell.desktop`

### 方式三：开发模式

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（带热更新）
```

浏览器访问 `http://localhost:5173/`

## 📂 项目结构

```
.
├── start.sh                # 一键启动脚本（含手机安装指引）
├── install-shortcut.sh     # 桌面快捷方式安装脚本
├── vercel.json             # Vercel 部署配置
├── netlify.toml            # Netlify 部署配置
├── scripts/
│   └── generate-icons.mjs  # PWA 图标生成脚本（sharp）
├── dist/                   # 构建产物（含 manifest.webmanifest 与 sw.js）
├── public/
│   ├── icon.svg            # 应用图标源文件（512x512）
│   ├── favicon.svg         # 浏览器标签图标
│   ├── pwa-192x192.png     # PWA 图标 192
│   ├── pwa-512x512.png     # PWA 图标 512
│   ├── maskable-512x512.png # PWA 自适应图标
│   └── apple-touch-icon.png # iOS 主屏幕图标
├── src/
│   ├── components/         # UI 组件
│   │   ├── CategoryBlock.tsx     # 分类区块
│   │   ├── CategoryDrawer.tsx    # 分类管理抽屉
│   │   ├── ItemFormModal.tsx     # 物品添加/编辑弹窗
│   │   ├── Modal.tsx             # 通用弹窗组件
│   │   ├── ProgressHeader.tsx    # 进度头部卡片
│   │   ├── SearchBar.tsx         # 检索栏
│   │   ├── ShareModal.tsx        # 共享中心弹窗
│   │   └── TripSwitcher.tsx      # 多清单切换抽屉
│   ├── hooks/
│   │   └── useClipboard.ts       # 复制到剪贴板
│   ├── lib/
│   │   ├── backup.ts             # 导出/导入备份
│   │   ├── icons.ts              # 图标映射
│   │   ├── progress.ts           # 进度计算
│   │   ├── share.ts              # 共享编解码
│   │   └── utils.ts              # 通用工具
│   ├── pages/
│   │   ├── Home.tsx              # 清单工作台主页
│   │   └── Share.tsx             # 只读共享视图
│   ├── store/
│   │   └── usePackStore.ts       # Zustand 状态管理
│   ├── types.ts                  # 类型定义
│   ├── App.tsx                   # 路由配置
│   ├── main.tsx                  # 入口文件
│   └── index.css                 # 全局样式
└── .trae/documents/              # 产品与技术文档
    ├── PRD.md
    └── TechnicalArchitecture.md
```

## 💾 数据存储说明

- **存储位置**：浏览器本地 localStorage，键名 `packwell-store`
- **存储内容**：所有清单（支持多份）、当前选中清单 ID
- **保存时限**：长期保留，除非手动清除浏览器数据
- **跨设备**：不同浏览器/设备数据不互通，可通过「备份」功能导出 JSON 文件迁移
- **隐私**：数据完全存于本地，不上传任何服务器

## 🔗 共享机制

共享通过 URL 传递压缩后的清单数据：

1. 在主清单点击「共享给联系人」打开共享中心
2. 选择三种方式之一：
   - **分享链接**：复制链接发送给联系人
   - **二维码**：扫码即可查看，可下载 PNG
   - **纯文本**：复制清单文本粘贴到聊天
3. 联系人打开链接看到的是**只读视图**，不会修改你的数据
4. 联系人可点击「导入为我的清单」将其转为自己的可编辑副本

## 🛠 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS 3（自定义旅行纸质质感主题）
- Zustand（状态管理 + localStorage 持久化）
- lz-string（共享链接压缩）
- qrcode（二维码生成）
- lucide-react（图标库）

## 📝 常用命令

| 命令 | 说明 |
|------|------|
| `./start.sh` | 一键启动（推荐日常使用） |
| `./install-shortcut.sh` | 创建桌面快捷方式 |
| `npm run dev` | 开发模式（热更新） |
| `npm run build` | 构建生产版本到 dist/（含 PWA） |
| `npm run preview` | 预览构建产物 |
| `npm run check` | TypeScript 类型检查 |
| `npm run icons` | 重新生成 PWA 图标 PNG（修改 icon.svg 后执行） |

## ❓ 常见问题

**Q：换电脑后怎么迁移数据？**
A：在原电脑导出 JSON 备份文件，拷贝到新电脑后用「导入」按钮恢复。

**Q：清理浏览器缓存会丢数据吗？**
A：会。建议定期用「备份」功能导出 JSON 文件存档。

**Q：可以离线使用吗？**
A：可以。应用启动后所有功能均离线可用，仅首次加载需要网络（加载字体）。

**Q：支持手机使用吗？**
A：界面已做响应式适配，手机浏览器访问同一路径即可使用。

**Q：如何停止后台服务？**
A：在终端执行 `kill $(lsof -ti:4173)` 或关闭启动脚本窗口后按回车。

**Q：手机和电脑上的清单数据是同步的吗？**
A：不是。手机和电脑各自有独立的浏览器存储，数据不互通。如需在手机上用电脑的清单，用「共享」功能生成链接，手机打开后点「导入为我的清单」即可。

**Q：手机安装后电脑关机还能用吗？**
A：首次打开后应用会被 Service Worker 缓存，离线可打开界面。但因为是局域网部署，电脑关机后无法首次安装。建议先在电脑开机时完成手机安装。如需公网访问，可将 dist/ 部署到 Vercel/Netlify/GitHub Pages 等静态托管服务。
