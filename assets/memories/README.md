# 瓶中的六片幸福

六张插画已接入主线 SH-12 的赠瓶段。每轮先播放单个光点从瓶中飞出的动画（约 1.8 秒），其余许多光点留在瓶内；随后图片与原文一起淡入（约 0.85 秒），完全显示至少两秒后可点击画面、按钮或空格继续。继续时先淡去（约 0.7 秒），再回到仍有光点的瓶子并重复下一轮，第六张淡去后恢复对白。

暂停/恢复同时冻结光点、透明度与阅读计时；连点不会跳过动画或下一张。减少动态效果时缩短释放和渐变，不取消过渡。图片按完整画面缩放，手机不裁主体；某图加载失败时保留瓶子，原文仍渐入渐出，下一张正常恢复图片。程序与浏览器验证摘要见 [integration-validation.json](integration-validation.json)，图片原件未改。

双击 [preview.html](preview.html) 可离线静态校对六张图，该页不播放游戏中的单光点演出。首批三张保持已认可的原路径与原字节；后三张放在本目录。

| 序号 | 幸福内容 | 图片 |
|---|---|---|
| 1 | 小孩诞生 | [memory_01_birth.png](trial/memory_01_birth.png) |
| 2 | 目睹壮丽景色 | [memory_02_vista.png](trial/memory_02_vista.png) |
| 3 | 与恋人漫步 | [memory_03_walk.png](trial/memory_03_walk.png) |
| 4 | 发现美丽花朵 | [memory_04_flower.png](memory_04_flower.png) |
| 5 | 克服苦难 | [memory_05_hardship.png](memory_05_hardship.png) |
| 6 | 晒太阳读书睡着 | [memory_06_reading.png](memory_06_reading.png) |

采用内置 image_gen，每张独立生成，未使用 CLI/API。延续柔和暖光的二次元 CG 风格，横向 1672×941 PNG，图片无烧录字幕。全组为匿名人物的幸福记忆，人物不绑定已确定角色。第五张以旅人爬过艰难山路后的疲惫与释然表现克服苦难。

完整六张提示词、文件映射、剧本原文见 [prompts.json](prompts.json)，后三张本轮生成记录另存 [new-prompts.json](new-prompts.json)。运行映射登记在 `assets/manifest.json` 的 `memories` 中，对应 `memory_1` 至 `memory_6`。生成原件不裁剪、不二次压缩，大小与 SHA-256 见 [validation.json](validation.json)。
