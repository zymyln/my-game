# 美术素材放这里

第一章结尾 CG 终稿已归档到 [cg/README.md](cg/README.md)，尚未接入 manifest 或剧情代码，接入由主力机负责。

瓶中六段幸福的二次元 CG 已全部接入主线，见 [六段插画与点击预览](memories/README.md)。原图、提示词和校验记录均已归档。

伊蕾娜骑扫帚原图、参考与四向预览见 [骑扫帚素材](sprites/elaina/broom-trial/README.md)。正面已用于主线开场飞入，背面用于尾声前飞离；中间探索仍步行，左右朝向保留预览。

伊蕾娜已接入四种姿势、站立五种表情，共八张透明立绘。村长已接入平静和愤怒，不耐烦透明版已登记预留。艾米尔三张已接入，现有“嘟嘴”暂用平常图；妮诺新版正常、微笑、哭泣、空洞四张已接入，见 `portraits/nino/processed-v2/`；旧六张保留作历史备份。场景由程序绘制。全立绘备份目录和离线校对页见 [portraits/README.md](portraits/README.md)。

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

以下是现行主线表情表中的文件名。四种姿势底图已由用户确认，归档于 `portraits/elaina/approved/`；站立五种表情已收到并制作透明处理版，见 `portraits/elaina/standing/`。其余三个姿势的透明处理版见 `portraits/elaina/poses/`。八张处理版均已登记进运行清单，按当前主线标记切换。

| 角色 | face（四位角色均已接入） |
|---|---|
| 伊蕾娜·站立 | `elaina_standing`、`elaina_standing_smile`、`elaina_standing_blank`、`elaina_standing_surprised`、`elaina_standing_serious` |
| 伊蕾娜·其他姿势 | `elaina_thinking`、`elaina_explaining`、`elaina_confident` |
| 艾米尔 | `emil_bright`、`emil_down`；`emil_neutral` 为平常，`emil_pout`、`emil_serious` 暂时复用平常图 |
| 妮诺 | 新四张映射六标记：`nino_down`、`nino_flustered` 共用正常；`nino_terrified`、`nino_teary` 共用哭泣；微笑 `nino_smiletiny`、空洞 `nino_empty` |
| 村长 | `chief_calm`、`chief_angry`；`chief_impatient` 已登记预留 |

最新四种姿势见 [确认底图与差分清单](portraits/elaina/approved/README.md)，原图用 `_source.png` 后缀归档；旧三张初稿仍保存在 `portraits/elaina/drafts/`。站立五表情与其他三个姿势均已另存透明处理版；保留全部归档原图，`portraits` 已登记上述八个小写 face。缺表情时优先回退同姿势，再回退角色默认立绘，避免异步加载顺序影响结果。

站立差分最新进展：2026-10-17 已替换为用户修正发色的新版，五张新原图在 `portraits/elaina/approved/standing-hair-update-2026-10-17/`；旧游戏版在 `portraits/elaina/standing/history/2026-10-17-before-hair-update/`。透明处理版、处理说明和校对页见 [standing/README.md](portraits/elaina/standing/README.md)。可直接双击其中的 `preview.html`，比较浅色、深色、棋盘背景及表情切换。使用内置 imagegen 编辑，可能存在细微线条变化；现已接入游戏素材清单。其他三个姿势的处理提示词和验证记录见 [poses/README.md](portraits/elaina/poses/README.md)。

## 调查物特写

`manifest.json` 的 `objects` 类别使用调查点 ID：`painting`、`apron`、`table`。现有三张特写已登记，对应 `objects/hall/` 的 PNG。厨房门口暂时仅显示文字。

调查图片加载失败时，调查卡自动使用纯文字，原文和操作不受影响。图片只用于调查卡，不替换地图中的家具或碰撞区域。
