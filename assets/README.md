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

以下是现行主线表情表中的文件名。除已归档的三张动作初稿外，正式透明图及差分暂未交付。缺失图片不写进运行清单，避免启动时请求不存在的文件；游戏继续显示能区分表情的像素占位。

| 角色 | 待接入的 face |
|---|---|
| 伊蕾娜·站立 | `elaina_standing`、`elaina_standing_smile`、`elaina_standing_blank`、`elaina_standing_surprised`、`elaina_standing_serious` |
| 伊蕾娜·其他姿势 | `elaina_thinking`、`elaina_explaining`、`elaina_confident` |
| 艾米尔 | `emil_bright`、`emil_pout`、`emil_down`、`emil_serious`（支线预留） |
| 妮诺 | `nino_down`、`nino_flustered`、`nino_terrified`、`nino_smiletiny`、`nino_teary`、`nino_empty` |
| 村长 | `chief_calm`、`chief_angry` |

三张伊蕾娜动作初稿保存在 `portraits/elaina/drafts/`，原文件名和原图保持不变。暂未抠图或登记，避免浅色背景遮挡场景，以及不完整差分导致严肃台词复用微笑图。准备好后可保留归档原图，另存正式透明版，再在 `portraits` 中登记上述小写 face 与实际路径的对应关系。

## 调查物特写

`manifest.json` 的 `objects` 类别使用调查点 ID：`painting`、`apron`、`table`。现有三张特写已登记，对应 `objects/hall/` 的 PNG。厨房门口暂时仅显示文字。

调查图片加载失败时，调查卡自动使用纯文字，原文和操作不受影响。图片只用于调查卡，不替换地图中的家具或碰撞区域。
