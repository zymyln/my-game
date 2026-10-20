# 循环小镇

以伊蕾娜与原创角色莉迪娅为双主角的剧情探索同人游戏。像素地图与人物、立绘对话为主，辅以少量 CG 演出。

当前正式企划为 v0.7；程序只有独立 Phaser 起步测试场景，地图第三稿是规划图，尚未制作成可行走小镇。没有完整封印、循环、双视角、日程或结局系统。

## 从哪里看

- [当前交接](docs/交接.md)、[状态记录](docs/state.md)、[协作规则](AGENTS.md)
- [剧情企划 v0.7](content/planning/loop-town/剧情企划.md)、[设定速查](content/planning/loop-town/循环小镇-设定速查表-v0.7.md)
- [小镇与地上遗迹第三稿](docs/planning/小镇与地上遗迹统一-v03.md)
- [地下古代遗迹第三稿](docs/planning/古代遗迹布局-v03.md)
- [莉迪娅素材记录](assets/style-references/lydia/莉迪娅-立绘归档与接续-2026-10-19.md)

## 本地预览

已有 Node.js 22 或更新版本及 pnpm 的环境，在本目录执行：

```powershell
pnpm install --frozen-lockfile --ignore-scripts
pnpm check
pnpm dev
```

Phaser 固定 3.90.0，沿用现有锁文件，不安装其他依赖。Windows 可双击 `启动循环小镇.cmd`；已有依赖时直接运行，缺少依赖会尝试已有包管理器安装。默认服务为本机 `http://127.0.0.1:4180`，占用时递增，以终端显示地址为准。保持终端开启，不直接双击 index.html。

操作：WASD/方向键移动，靠近告示牌按 E，E/Esc/按钮关闭测试对白；井与树干有碰撞，失焦停止移动。当前没有手机触屏方向控制。

## 协作与状态

主力机负责程序与接入；其他电脑只修改素材、文本和非程序文档。阅读 [AGENTS.md](AGENTS.md) 后再工作。企划尚未接入占位程序，正式剧本格式与素材接口需另行确认，不沿用旧游戏契约。

`docs/validation.json`、预览截图和 archive 中的文档是迁移前验证与历史记录，不等同于新目录通过验收。迁移后结果记入 state。

`assets/style-references/lydia/` 当前只有文字与提示词记录，提到的本地图片路径不随 Git 同步；图片原件需要另行选择补入。非商业剧情向同人项目，不自动附加未确认的开源授权。
