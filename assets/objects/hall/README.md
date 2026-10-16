# 餐厅调查物特写

三张像素风物品特写，对应 `content/script/ch1.md` 餐厅调查段的三个可点击调查点。
由文本机生成并归档，程序端于 2026-10-16 接入调查卡片。

| 文件 | 对应调查点（`src/world.mjs` 的 `source`） | 剧本原文要点 |
|---|---|---|
| `hall_painting.png` | 墙上的画 | 「画得不算好，但画的人应该很喜欢那片草原」→ 画中所画刻意业余：地平线歪、太阳不圆、颜料越过山脊线 |
| `hall_apron.png` | 挂在门边的围裙 | 「对她来说太大了」→ 空挂、宽大、系带过长、下摆磨损，没有人在穿 |
| `hall_table.png` | 餐桌 | 「这么大的桌子，坐下来吃饭的却只有三个人」→ 四把椅子、三副餐具，右下一席留空 |

## 规格

- 320 × 240，RGBA，**真透明背景**（非假透明/棋盘格）。尺寸与 `index.html` 中 `#glass-prop` 道具画布一致。
- 配色逐色取自 `src/art.js` 餐厅场景（木色 `#b18a60`/`#d3ad74`、米纸 `#eee8d0`/`#e1d6b9`、鼠尾草绿 `#9cb588`/`#b3bda2` 等），与现有像素场景同色系。
- 程序逐像素绘制生成，非图像生成模型产物；硬边、无抗锯齿、有限色板。生成器即同目录的 `make-items.mjs`，零依赖（只用 node 内置 `zlib` 与 `fs`），重跑可逐字节复现这三张图：

  ```
  node assets/objects/hall/make-items.mjs assets/objects/hall
  ```

  改配色改脚本里的 `C`，改构图改 `painting` / `apron` / `table` 三个函数。所有随机效果走固定种子，结果确定。

## 接入说明（给程序端）

1. `assets/manifest.json` 的 `objects` 已登记 `painting`、`apron`、`table` 三个调查点 ID。
2. `src/assets.js` 同时加载 `portraits`、`backgrounds` 和 `objects`，未加载成功的图片跳过。
3. 调查卡使用 `#inspection-image` 显示对应特写；厨房门口或缺图时自动隐藏图片，保留原文及返回操作。
4. 特写只在调查时显示，不改变地图上的家具、碰撞或主线推进条件。

## 状态

初稿，已接入，等待用户试玩反馈。构图或配色要调整，改脚本重跑即可，不必重画。
