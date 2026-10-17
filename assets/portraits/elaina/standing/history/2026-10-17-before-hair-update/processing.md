# 图像处理提示词

工具：内置 `image_gen.imagegen`，五次编辑均设置 `transparent_background: true`，无 CLI/API 路径。

## 1. 微笑基准

编辑目标：`../approved/standing-expressions/elaina_standing_smile_source.png`。

```text
Use case: background-extract. Asset type: transparent PNG visual novel character sprite, Elaina standing, smiling expression. Image 1 is the EDIT TARGET, an approved final illustration. Perform a precise background-removal edit, NOT a redesign. Remove only the peach/tan background, the peach haze at the bottom, and any thin outer border; output genuine RGBA transparency, including gaps between hair strands, hands, and robe. Preserve the original face, purple eyes, small closed-mouth smile, hair, braid, hat, pink hat bands, blue brooch, coat decorations, hands, pose, linework, colors, and lighting exactly as closely as possible. Keep the original hat framing, do not invent new clothing or complete feet. Keep the same head-to-thigh composition, centered, at the same scale relative to the frame. Output a 1024 by 1536 transparent canvas; proportionally fit the entire existing illustration within it without additional cropping. No background, no checkerboard drawn into pixels, no text, no shadows outside the character, no decorative glow. This sprite will be the fixed body reference for four expression variants, so keep all geometry and details unchanged.
```

## 2. 平常

Image 1 为微笑处理版，Image 2 为用户平静原图。

```text
Use case: identity-preserve. Game expression sprite edit. Image 1 is the EDIT TARGET: approved transparent standing sprite at 1024x1536. Image 2 is ONLY the expression reference for a calm neutral face (平静), not a source for body or background. Change ONLY the eyes, eyebrows and mouth within the face of Image 1 to closely match Image 2's calm relaxed neutral expression, mouth more level and less smiling than Image 1. Keep Image 1's exact face outline, head angle, body pixels, geometry, hat, braid, jewelry, clothing folds, hands, lighting, colors, placement, bottom edge and transparent alpha silhouette unchanged. Same 1024x1536 canvas, same character scale and exact position. Do not resize, recenter, repaint, improve or redesign the character or any item. Do not add a background, glow, black cloud, white matte, checkerboard, shadow or text. Output one RGBA PNG with genuine transparent background, retaining the target's transparency. Must register perfectly with Image 1 for visual-novel expression switching.
```

## 3–5. 无语、惊讶、正色

每张单独调用。Image 1 均为微笑处理版，Image 2 为各自用户原图。共同提示词：

```text
Use case: identity-preserve. Asset type: one transparent visual-novel expression sprite. Image 1 is the EDIT TARGET, the approved transparent standing character master on a 1024x1536 canvas. Image 2 is ONLY the facial-expression reference; do not copy its body, scale or background. Change ONLY the eyebrows, eyes, and mouth inside the face of Image 1. Keep Image 1's exact face outline, head angle, hair, hat outline and bands, braid, turquoise brooch, clothing details, folds, hands, lower edge, colors, lighting, full silhouette, scale and character position UNCHANGED. Keep the SAME 1024x1536 RGBA canvas and its existing genuine transparent alpha. Do not recenter, resize, redesign, repaint or improve any body details. Do not add a background, black cloud, glow, drawn checkerboard, matte, new shadow or text. The sprite must register with Image 1 during expression switching.
```

无语追加：

```text
Match Image 2's unimpressed, mildly exasperated expression (无语): half-lidded purple eyes, level slightly weary eyebrows and a short flat closed mouth. Subtle dry humor, not anger, not sadness. Preserve the approved reference expression.
```

惊讶追加：

```text
Match Image 2's surprised expression (惊讶): purple eyes widened slightly, eyebrows raised, and a small open rounded mouth. Keep the eyes recognizably the same character; no exaggerated comic symbols or blush.
```

正色追加：

```text
Match Image 2's serious composed expression (正色): alert focused purple eyes, eyebrows drawn slightly inward, lips closed and slightly downturned. Calm firmness rather than rage or comedy. Keep the emotion subtle and close to the reference.
```
