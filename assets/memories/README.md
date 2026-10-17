# 瓶中的六片幸福

六张插画已接入主线 SH-12 的赠瓶段。每次继续同时切换图片与剧本原文，原有每张至少两秒、暂停/恢复、配乐与后续立绘反应保留。支持点击画面、继续按钮或空格；图片按完整画面缩放，手机也不裁主体。图片加载失败时回退原文字与光点演出。

双击 [preview.html](preview.html) 可离线校对六张图。首批三张保持已认可的原路径与原字节；后三张放在本目录。

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
