# 艾米尔三表情处理提示词

使用内置 imagegen 编辑，未使用 CLI/API，未安装依赖。先处理平常透明基准，再以其为目标编辑另两表情，用户原图作表情参考。重点要求保留基准的金发、蓝色外衣及身体构图；AI 编辑仍可能引入细微颜色和线条变化。

## 平常

Use case: background-extract. Image 1 is the EDIT TARGET: user's approved full-body illustration of Emil. Remove ONLY the flat tan background, including gaps around arms and between legs, preserving the entire boy, exact neutral face, blond bowl-cut hair and blue-grey eyes, blue tunic, cream sleeves, dark collar with gold trim, brown belt, grey trousers and brown boots. Preserve original linework, flat anime shading and exact colors; especially do not shift the golden-yellow hair hue or blue tunic hue. No redesign or added lighting. Output genuine RGBA transparent PNG on a 1024x1536 canvas. Proportionally fit entire body with top of hair at y=40, boot bottom at y=1500, horizontally centered. Small transparent margins, full boots visible. Clean antialias edges, no tan fringe, no shadow, glow, scenery, checkerboard, objects or text. This image will be the locked body/hair/color master for expression edits.

## down

Use case: identity-preserve, expression edit. Image 1 is the EDIT TARGET and locked transparent Emil body/hair/color master. Image 2 is ONLY the user's facial-expression reference. Change only the eyebrows, eyes, mouth and cheek blush within the face on image 1 to match image 2. Preserve image 1's exact canvas 1024x1536, body/head alignment and size, hair silhouette and golden-yellow hair hue, all hair shading and highlights, skin tone, outfit, blue tunic hue, all body pixels, hands, pose, boots and genuine transparent alpha. Do not copy image 2's background, framing, body, hair colors or shading. No repainting of hair or clothing; no lighting changes. No opaque matte, checkerboard, shadows, glow, text or objects. Full boots and hair remain visible. Drooping half-lidded blue-grey eyes, sad raised inner eyebrows and small downturned closed mouth, visibly dejected as in image 2.

## bright

Use case: identity-preserve, expression edit. Image 1 is the EDIT TARGET and locked transparent Emil body/hair/color master. Image 2 is ONLY the user's facial-expression reference. Change only the eyebrows, eyes, mouth and cheek blush within the face on image 1 to match image 2. Preserve image 1's exact canvas 1024x1536, body/head alignment and size, hair silhouette and golden-yellow hair hue, all hair shading and highlights, skin tone, outfit, blue tunic hue, all body pixels, hands, pose, boots and genuine transparent alpha. Do not copy image 2's background, framing, body, hair colors or shading. No repainting of hair or clothing; no lighting changes. No opaque matte, checkerboard, shadows, glow, text or objects. Full boots and hair remain visible. Eyes closed in happy upward arcs, small cheek blush marks, wide open smiling mouth, bright joyful laugh as in image 2.
