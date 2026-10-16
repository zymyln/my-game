# 三种姿势透明处理记录

使用内置 imagegen 编辑工具，未使用 CLI/API，未安装依赖。三张分别以 `../approved/elaina_姿势_source.png` 为编辑目标，输出 1024 × 1536 透明 PNG。原图单独保留。AI 编辑可能带来局部线条、颜色或装饰变化，不是逐像素无损抠图。

## 共用提示词

Use case: background-extract. Asset type: transparent PNG character portrait for a visual novel. Image 1 is the EDIT TARGET, an approved final Elaina illustration. Remove ONLY its beige/tan background and bottom background-colored haze, including background visible in gaps between hair, arms, clothes, and fingers. Output genuine RGBA transparency with clean anti-aliased edges, no drawn checkerboard or opaque matte. Preserve the original character identity, facial expression, exact pose and hands, hair arrangement, hat, bands, jewelry, outfit decorations, linework, colors and lighting as closely as possible. Do not redesign, repaint details, substitute features from a different pose, add glow or shadows, or change clothing. Use a 1024x1536 transparent canvas. Proportionally fit the existing hat-to-thigh character, centered, preserving body proportions and head placement, with a small transparent margin. Keep all existing content; no additional cropping, no invented feet. Clean the lower edge so it blends through alpha rather than retaining beige pixels. No text or added objects. 

## confident

Raised hand holding the hat brim, other hand resting on hip; keep the self-confident small smile, original hat medallion and front hair exactly recognizable.

## thinking

One hand at the chin in a thoughtful pose, other arm relaxed downward; keep the inquisitive face, front hair and original garment motifs from this image.

## explaining

One palm opened upward in an explaining gesture, other arm downward; keep the friendly small smile, original hand anatomy, hat and original chest emblem from this image.

