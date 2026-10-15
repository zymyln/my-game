# state.md

## 2026-10-15 初始化

- 完成建仓库、建目录、建约定文件。
- 接口变动：无。
- 下一步：文本机写样例对话，主力机做对话显示 Demo。

## 2026-10-15 剧本迁入仓库

- 第一章剧本原文迁入 `content/script/ch1.md`（Markdown，此后以此为准）。
- 内容变更：删掉原 SH-05「飞行途中」段；村庄室外两段移入文末附录暂不启用；新增餐厅 4 处可点击调查；镜头数 17 → 15。
- 决策记录：结尾按原作留白，全章单线不加分支；妮诺视角闪回暂不加入。
- 接口变动：无。`content/dialogue.json` 仍为空对象，字段未动。
- 下一步：文本机把第一章转成 `content/dialogue.json`；主力机做对话显示 Demo。

## 2026-10-15 样例对话数据

- `content/dialogue.json` 填入 SH-04（草原·瓶子）的 22 条样例，供主力机今晚做对话显示 Demo。
- 新增命名约定，写在 `content/script/ch1.md` 的表情表里：face = `角色_表情`（如 `elaina_normal`、`emil_bright`）；bg = `field_day` / `hall` / `gate_dusk` / `field_dusk`。
- 待确认的约定：旁白用 `speaker:"旁白"` + `face:null`；【演出】指令、可点击调查、六片光粒子目前没有对应字段，暂未进入 json。
- 接口变动：无，`docs/contract.md` 未改动。
- 下一步：主力机据此做对话框；文本机等约定确认后批量转换整章 257 条。