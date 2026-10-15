# 美术素材放这里

现在没有正式美术也可以运行。游戏会显示程序绘制的像素占位场景和人物。

## 立绘

使用透明背景 PNG，文件名沿用剧本，不含空格。例如：

- `elaina_normal.png`、`elaina_smile.png`
- `emil_proud.png`、`emil_panic.png`、`emil_serious.png`
- 其他表情以 `content/script/ch1.md` 的表情表为准。

建议同一角色所有图片使用相同画布（例如 768 × 1024），脚底或半身像底边对齐，帽子不裁切，人物尽量占满画布。这个尺寸是出图建议，不是强制限制。

把图片放在本目录，然后由程序端在 `manifest.json` 的 `portraits` 中登记：

```json
{
  "portraits": {
    "elaina_normal": "elaina_normal.png",
    "elaina_smile": "elaina_smile.png"
  },
  "backgrounds": {}
}
```

新增表情尚未准备好时，会优先复用该角色已登记的其他立绘；整个角色都没有图片时才使用像素占位。图片读不到也不会让剧情中断。

## 背景

约定名称：`field_day.png`、`hall.png`、`gate_dusk.png`、`field_dusk.png`。推荐横向 16:9（例如 1920 × 1080）。

在 `backgrounds` 中登记，如 `"field_day": "field_day.png"`，对话时会按数据切换。探索地图仍由程序绘制；背景插画不会自动成为可走动的地图。

不用为了跑第一版而一次生成全部素材。先交付伊蕾娜平常、微笑，以及艾米尔得意的一张图，就可以检查两侧立绘的效果。
