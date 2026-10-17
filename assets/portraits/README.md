# 角色立绘总目录

当前游戏使用 **18 张独立透明立绘：伊蕾娜 8 张、村长 3 张、艾米尔 3 张、妮诺新版 4 张**。运行清单登记 22 个标记，其中艾米尔与妮诺各有两个复用映射。另保留妮诺旧六张历史处理版，全角色校对页可比较 24 张（不含伊蕾娜更早的站立备份）。双击 [preview.html](preview.html) 可离线比较浅色、深色或棋盘背景。原图与处理版分开保存，不移动历史文件，避免已有引用失效。

| 目录 | 内容 | 用途 |
|---|---|---|
| `elaina/approved/` | 已确认四姿势底图原件副本 | 原图备份 |
| `elaina/approved/standing-expressions/` | 站立五表情原件副本 | 原图备份 |
| `elaina/approved/standing-hair-update-2026-10-17/` | 用户修正发色的新版站立五表情原件 | 新版原图备份 |
| `elaina/drafts/` | 旧三姿势初稿 | 历史备份 |
| `elaina/standing/` | 平常、微笑、无语、惊讶、正色透明版，2026-10-17 发色更新 | 当前游戏 |
| `elaina/standing/history/2026-10-17-before-hair-update/` | 发色更新前的五张游戏版与旧处理记录 | 历史备份，不用于游戏 |
| `elaina/poses/` | 扶帽、思考、摊手透明版 | 当前游戏 |
| `chief/approved/` | 村长平静、不耐烦、愤怒原件副本 | 原图备份 |
| `chief/processed/` | 村长三表情透明版 | 当前游戏及预留 |
| `nino/approved/` | 妮诺旧六表情原件副本 | 历史备份 |
| `nino/processed/` | 妮诺旧六表情透明版 | 历史备份，不用于当前游戏 |
| `nino/approved/2026-10-17-v2/` | 正常、微笑、哭泣、空洞新版原件副本 | 当前来源备份 |
| `nino/processed-v2/` | 妮诺新版四表情透明版 | 当前游戏 |
| `emil/approved/` | 艾米尔平常、沮丧、灿烂原件副本 | 原图备份 |
| `emil/processed/` | 艾米尔三表情透明版 | 当前游戏 |

透明处理版均为 1024×1536。村长 `chief_calm`、`chief_angry` 沿用现有主线标记；`chief_impatient` 已登记和归档，当前主线尚无对应标记，不擅自修改文本。不耐烦与愤怒分别保留咬牙/怒吼的区别。

各处理目录保留 `processing.md` 提示词和验证说明。使用内置 imagegen 编辑可能带来细微线条与颜色变化，原始文件完整保留。`inventory.json` 列出本目录全部 PNG 的相对路径、字节数与 SHA-256，可用于备份核对。新增文件后应重新生成清单。
