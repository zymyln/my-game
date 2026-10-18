# 《瓶中的幸福》立绘画风参考包

- 来源：游戏 `assets/manifest.json` 的现行 portraits 清单，整理日期 2026-10-18。
- 22 个素材标记按实际图片路径去重，共 18 张独立 PNG；包括村长不耐烦预留图。
- 伊蕾娜使用现行发色修正版；妮诺使用 processed-v2 新版。旧造型、历史备份、像素小人和 CG 不在本包范围内。
- `single-images/` 是原尺寸透明 PNG 的逐字节副本，均为 1024×1536 RGBA；未经过生成式重绘、改色或去背。
- `portrait-overview.png` / `.jpg` 是中性浅底总览，仅等比缩小、排版和加标签。
- `index.json` 记录原路径、别名、尺寸及 SHA-256，全部副本与源文件哈希一致。

## 图片清单

| 编号 | 内容 | 素材名 | 单张原图 |
|---|---|---|---|
| 01 | 伊蕾娜 · 站立／平常 | `elaina_standing` | [PNG](single-images/elaina_standing.png) |
| 02 | 伊蕾娜 · 站立／微笑 | `elaina_standing_smile` | [PNG](single-images/elaina_standing_smile.png) |
| 03 | 伊蕾娜 · 站立／无语 | `elaina_standing_blank` | [PNG](single-images/elaina_standing_blank.png) |
| 04 | 伊蕾娜 · 站立／惊讶 | `elaina_standing_surprised` | [PNG](single-images/elaina_standing_surprised.png) |
| 05 | 伊蕾娜 · 站立／正色 | `elaina_standing_serious` | [PNG](single-images/elaina_standing_serious.png) |
| 06 | 伊蕾娜 · 扶帽／得意 | `elaina_confident` | [PNG](single-images/elaina_confident.png) |
| 07 | 伊蕾娜 · 思考 | `elaina_thinking` | [PNG](single-images/elaina_thinking.png) |
| 08 | 伊蕾娜 · 摊手／微笑 | `elaina_explaining` | [PNG](single-images/elaina_explaining.png) |
| 09 | 村长 · 平静 | `chief_calm` | [PNG](single-images/chief_calm.png) |
| 10 | 村长 · 不耐烦（预留） | `chief_impatient` | [PNG](single-images/chief_impatient.png) |
| 11 | 村长 · 愤怒 | `chief_angry` | [PNG](single-images/chief_angry.png) |
| 12 | 艾米尔 · 平常 | `emil_neutral` | [PNG](single-images/emil_neutral.png) |
| 13 | 艾米尔 · 灿烂 | `emil_bright` | [PNG](single-images/emil_bright.png) |
| 14 | 艾米尔 · 沮丧 | `emil_down` | [PNG](single-images/emil_down.png) |
| 15 | 妮诺 · 正常（新版） | `nino_down` | [PNG](single-images/nino_down.png) |
| 16 | 妮诺 · 哭泣（新版） | `nino_teary` | [PNG](single-images/nino_teary.png) |
| 17 | 妮诺 · 微笑（新版） | `nino_smiletiny` | [PNG](single-images/nino_smiletiny.png) |
| 18 | 妮诺 · 空洞（新版） | `nino_empty` | [PNG](single-images/nino_empty.png) |

## PixAI 使用范围

当前仅整理候选参考，未指定某张为最终画风基准，未上传图片或调用 PixAI。
确定模型与入口后，再按用户指定写明参考图负责画风、角色或构图。
用于莉迪娅时，可明确只提取线稿、上色与材质表现；莉迪娅的造型细节另行设计和确认。
总览用于选择图片；需要看清笔触与脸部细节时，使用单张原尺寸 PNG。
