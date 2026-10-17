# 伊蕾娜已确认的四个姿势底图

更新：2026-10-17 用户另提供发色修正版，见 `standing-hair-update-2026-10-17/`，当前游戏已使用新版。早期站立五种表情现已全部收到，原图见 [standing-expressions/README.md](standing-expressions/README.md)，透明处理版见 [../standing/README.md](../standing/README.md)。下方差分计划保留作制作记录，不代表仍需重新生成。

2026-10-16 用户确认四个姿势。本目录保存原图副本，统一资源名；未抠图、裁切、重绘或压缩。旧 `drafts/` 保留为历史初稿。

| 来源文件 | 本目录原图 | 姿势 | 后续游戏 face |
|---|---|---|---|
| `pose4.png` | `elaina_standing_source.png` | 双手自然垂下，站立 | `elaina_standing` 及站立表情差分 |
| `pose1.png` | `elaina_confident_source.png` | 扶帽、叉腰，得意 | `elaina_confident` |
| `Elaina_Pose02_Thinking.png` | `elaina_thinking_source.png` | 手抵下巴，思考 | `elaina_thinking` |
| `Elaina_Pose03_Explaining.png` | `elaina_explaining_source.png` | 单手摊开，微笑解释 | `elaina_explaining` |

`_source` 表示归档原图，不是剧本里的新表情。原图保持不变；透明处理版分别位于 `../standing/`、`../poses/`，八张均已登记到 `assets/manifest.json`，按主线姿势和表情切换。下方保留原差分制作计划。

## 当前主线需要的差分

优先只围绕站立底图改脸。现有站立浅笑可先作为微笑版，另外补平常、无语、惊讶、正色四张；不需要重新生成四套身体。

| 表情 | 正式文件名 | 表现与用途 | 当前主线使用次数 |
|---|---|---|---|
| 微笑 | `elaina_standing_smile.png` | 现图浅笑可用；友善招呼、道谢、安慰 | 14 |
| 平常 | `elaina_standing.png` | 嘴角放平、自然闭嘴，眉眼放松；倾听和普通询问 | 7 |
| 无语 | `elaina_standing_blank.png` | 眼皮略压低、嘴角平直；轻微吐槽或无奈，避免夸张表情符号 | 7 |
| 正色 | `elaina_standing_serious.png` | 收起笑容、目光认真，眉头稍收；严肃谈话与内心反应，不必画成暴怒 | 2 |
| 惊讶 | `elaina_standing_surprised.png` | 眉毛抬起、眼睛略睁大、嘴微张；得知妮诺身世时的意外 | 1 |

次数按本次主线有效部分统计，包含内心话，不含附录与未接入支线。微笑已具备，新增制作可优先无语、正色，再补平常与惊讶；五种最终都需要齐备。

思考、摊手、扶帽在现行表情表中各只有一种表情，现图即可，不要求额外差分。未来剧情需要时再扩展。

## 差分输出要求

- 在同一姿势的底图上仅修改眉毛、眼睛和嘴，保持脸型、头发、帽子、服装、身体、手、光源及人物位置一致。
- 同一姿势的全部差分使用相同画布尺寸和人物位置，不要按每张脸单独重新裁切或缩放；保留有背景的原始版本，另导出透明 PNG 供接入。
- 平常与微笑要有可辨认的嘴角差异；无语与正色要靠眉眼区分，避免两张都只把笑容擦掉。
- 四种姿势可分别使用各自底图；全体画布对齐与游戏内显示位置可在正式接入时再检查。
