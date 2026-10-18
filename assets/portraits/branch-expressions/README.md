# 支线迟疑与决心立绘 · 2026-10-18

用户提供两张黑底全身图并授权处理、接入。`source/` 原字节保存上传图片；`processed/` 为内置 imagegen 的透明背景处理版，1024×1536。未使用 CLI/API、未安装依赖。生成式处理会有少量线条、阴影变化，原图保留供复核。

- 妮诺：`nino_hesitant`。SH-23 两句原标注哭泣的“……”和“对不……”使用迟疑图，后续“……谢谢您。”仍使用已有微笑。SH-17 及主线不变。
- 艾米尔：`emil_serious` 由旧平常图别名改为新决心图。SH-21 开场与三次发言使用新图，前后的沮丧、灿烂按原稿保留。
- 程序侧使用 `speakingPortrait` 映射，未修改 `content/` 的标注或台词。

`edge-review.png` 是浏览器对真实 RGBA 文件在浅色/深色底上的渲染校对，透明区的隐藏 RGB 不参与显示。`*-game-*.png` 为桌面/手机实际布局截图。`browser-validation.json` 记录四处台词定点验证；测试只临时拦截浏览器响应定位剧情，没有把调试入口写入游戏。

51 项 Node 测试通过；Edge 1440/390px 验证两张新图加载、妮诺迟疑转微笑、无页面错误。此次没有重跑完整剧情，路由与选择未改。旧离线 ZIP 未重新打包。

## 最终处理提示词

### 妮诺

Use case: background-extraction. Edit target: the attached full-body anime girl portrait for a game. Remove the black background and every stray red/yellow/white fringe outside her silhouette, including the red artifact between ankles; deliver real transparent alpha background. PRESERVE her exact character design, hesitant expression, red eye, black hair covering one eye, cream head scarf, dusty rose laced vest, white sleeves, clasped hands, brown long skirt and shoes, linework and colors, full-body pose and proportions. CHANGE only background and contaminated edge pixels; retain crisp dark outline and fine hair. No redesign, no text, no shadow, no extra objects. Full figure centered with small transparent margin.

### 艾米尔

Use case: background-extraction. Edit target: provided full-body anime boy game portrait. Remove only black background, including gaps between legs and arms, and remove stray red/yellow/white fringe contaminating the outer silhouette. Deliver real transparent alpha PNG. PRESERVE exact firm determined eyebrows, blue-grey eyes, small closed mouth, blond bowl cut, cream sleeves, blue tunic with dark gold-trimmed collar, belt, grey trousers, brown boots, body, hands, pose, original crisp anime linework and colors. Preserve 1024x1536 canvas, original character scale and alignment, hair top near y=48 and boots bottom near y=1500. CHANGE background and damaged edge pixels only; no redesign or repainting of face/costume, no scenery/shadow/text/checkerboard. Full body visible.
