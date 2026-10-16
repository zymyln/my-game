# 美术素材放这里

现在没有正式美术也可以运行。游戏会显示程序绘制的像素占位场景和人物。

## 立绘

使用透明背景 PNG，文件名沿用剧本，不含空格。例如：

- `elaina_standing.png`、`elaina_standing_smile.png`、`elaina_thinking.png`、`elaina_confident.png`
- `emil_bright.png`、`emil_pout.png`、`emil_down.png`
- 完整清单以 `content/script/ch1.md` 的表情表为准。命名规则：伊蕾娜用「角色_姿势」加可选表情，其他三位只有一张姿势，用「角色_表情」。

建议同一角色所有图片使用相同画布（例如 768 × 1024），脚底或半身像底边对齐，帽子不裁切，人物尽量占满画布。这个尺寸是出图建议，不是强制限制。

把图片放在本目录，然后由程序端在 `manifest.json` 的 `portraits` 中登记：

```json
{
  "portraits": {
    "elaina_standing": "elaina_standing.png",
    "elaina_standing_smile": "elaina_standing_smile.png"
  },
  "backgrounds": {}
}
```

新增表情尚未准备好时，会优先复用该角色已登记的其他立绘；整个角色都没有图片时才使用像素占位。图片读不到也不会让剧情中断。

## 背景

约定名称：`field_day.png`、`hall.png`、`gate_dusk.png`、`field_dusk.png`。推荐横向 16:9（例如 1920 × 1080）。

在 `backgrounds` 中登记，如 `"field_day": "field_day.png"`，对话时会按数据切换。探索地图仍由程序绘制；背景插画不会自动成为可走动的地图。

不用为了跑第一版而一次生成全部素材。先交付 `elaina_standing`、`elaina_standing_smile` 和 `emil_bright` 三张，就可以检查两侧立绘的效果。

## 当前立绘接入清单

以下是现行主线表情表中的文件名。四种姿势底图已由用户确认，归档于 `portraits/elaina/approved/`；站立五种表情已收到并制作透明处理版，见 `portraits/elaina/standing/`。其他姿势仍为有背景原图。当前处理版尚未登记进运行清单，游戏继续显示能区分表情的像素占位。

| 角色 | 待接入的 face |
|---|---|
| 伊蕾娜·站立 | `elaina_standing`、`elaina_standing_smile`、`elaina_standing_blank`、`elaina_standing_surprised`、`elaina_standing_serious` |
| 伊蕾娜·其他姿势 | `elaina_thinking`、`elaina_explaining`、`elaina_confident` |
| 艾米尔 | `emil_bright`、`emil_pout`、`emil_down`、`emil_serious`（支线预留） |
| 妮诺 | `nino_down`、`nino_flustered`、`nino_terrified`、`nino_smiletiny`、`nino_teary`、`nino_empty` |
| 村长 | `chief_calm`、`chief_angry` |

最新四种姿势见 [确认底图与差分清单](portraits/elaina/approved/README.md)，原图用 `_source.png` 后缀归档；旧三张初稿仍保存在 `portraits/elaina/drafts/`。站立五表情现已另存透明处理版，其他三个姿势尚未处理。正式接入时保留归档原图，在 `portraits` 中登记上述小写 face 与实际路径的对应关系，避免缺失差分时误用其他表情。

站立差分最新进展：用户提供的五张原图保存在 `portraits/elaina/approved/standing-expressions/`，透明处理版、处理说明和校对页见 [standing/README.md](portraits/elaina/standing/README.md)。可直接双击其中的 `preview.html`，比较浅色、深色、棋盘背景及表情切换。使用内置 imagegen 编辑，可能存在细微线条变化；本轮不覆盖游戏素材清单。

## 调查物特写

`manifest.json` 的 `objects` 类别使用调查点 ID：`painting`、`apron`、`table`。现有三张特写已登记，对应 `objects/hall/` 的 PNG。厨房门口暂时仅显示文字。

调查图片加载失败时，调查卡自动使用纯文字，原文和操作不受影响。图片只用于调查卡，不替换地图中的家具或碰撞区域。
