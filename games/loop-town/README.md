# 循环小镇开发起步环境

这是独立的 Phaser 浏览器项目，和仓库根目录的《瓶中的幸福》分开运行。当前只验证环境、地图、行走、碰撞、调查和对白；地图、小人及测试句子均为占位，不代表正式剧情、美术或循环规则。

## 这台电脑已准备好什么

| 工具 | 当前情况 | 用途 |
|---|---|---|
| Node.js | 24.19.0，已有运行时 | 启动本地预览 |
| pnpm | 11.25.0，已有运行时 | 安装并锁定项目依赖 |
| Phaser | 固定为 3.90.0，已安装在本项目 | 2D 场景、镜头、角色与碰撞 |
| Git | 使用现有仓库 | 同步程序、说明和依赖锁文件 |
| Edge / Chrome | 使用已有浏览器 | 游玩与检查 |

没有安装全局软件，没有修改系统 PATH。只添加项目依赖 Phaser 及其依赖 eventemitter3，版本写入 package.json 和 pnpm-lock.yaml。node_modules 由现有忽略规则排除，不上传 Git。

## 最简单的启动方法

双击本目录的 **启动循环小镇.cmd**。

脚本在本项目内运行，优先使用已有 Node；本机找不到系统命令时会使用 Codex 的已有运行时。另一台电脑首次启动如缺少依赖，会尝试用已有 pnpm 或 npm 安装，首次需要联网。安装完成后游戏仅请求本机文件，不使用 CDN。启动后浏览器自动打开，终端保持开启；关闭终端或按 Ctrl+C 停止预览。

默认地址是 **http://127.0.0.1:4180**。若端口已占用，终端会显示实际递增后的端口。它与《瓶中的幸福》的启动脚本和端口互不混用。

开发时请通过启动脚本打开，不直接双击本目录 index.html。本地预览不会把项目发布到互联网上。

## 操作与检查

- WASD / 方向键行走；井和树干有碰撞。
- 靠近广场右侧告示牌，按 E 查看测试对白。
- 对白开启时角色停止；按 E、Esc 或点“继续行走”关闭。
- 切到其他窗口会停止移动。

本轮以电脑键盘操作为目标，手机尺寸只检查布局，没有制作触屏方向按钮。

## 常规开发命令

已有 Node 和 pnpm 的电脑，在本目录执行：

```powershell
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
pnpm check
```

本机若找不到 pnpm 命令，可使用已有完整路径：

```powershell
& "$env:USERPROFILE/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm.cmd" install --frozen-lockfile --ignore-scripts
node tools/dev.mjs
```

其他电脑只需 Node.js 22 或更新版本，以及 npm 或 pnpm，不依赖某个固定用户名。环境准备和制作原型需要开发工具；将来发给玩家时另做发行包，玩家无需安装这些工具。

## 文件分工

- `src/main.js`：Phaser 场景、像素占位图、行走与交互。
- `src/data/demo.js`：本轮独立测试地图参数和测试对白，不是正式剧本。
- `src/style.css`：网页、对白框和提示布局。
- `tools/dev.mjs`：仅绑定本机的预览服务，并提供本地 Phaser 文件。
- `docs/validation.json`：浏览器运行检查，截图在同目录。

正式企划仍位于 `../../content/planning/loop-town/`；本轮未改企划、第一章代码、素材或共同契约。新项目的正式剧本格式、循环状态、失败回滚、双视角事件等，等用户确认后逐项设计；不要把测试句子当成定稿。

## 依赖与验证

Phaser 3.90.0（MIT）及 eventemitter3（MIT）通过 npm registry、pnpm 锁文件获取，未从模板安装其他包。依赖许可证随各自 node_modules 包保留，后续制作发行包时需附带相应许可证。

已在 Edge 检查 Phaser 本地加载、实际键盘移动、井碰撞、告示牌交互、对白阻止移动、E/Esc/按钮关闭和失焦停止，无页面错误、无外部网络请求；1280px 与 390px 截图复核。此阶段没有接入正式日程、循环和结局。
