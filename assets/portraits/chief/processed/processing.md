# 村长三表情处理提示词

使用内置 imagegen 编辑，未使用 CLI/API。平静为身体与构图基准；另外两张以该处理版为编辑目标，用户对应原图只作表情参考。

## 平静

Use case: background-extract. Image 1 is the edit target: approved village chief full-body visual novel character. Remove ONLY the tan background including gaps between arms, coat and legs, yielding a genuinely transparent RGBA PNG. Preserve the exact calm stern closed-mouth expression, blond hair, moustache, face identity, hands, green sleeveless coat with dark trim, white embroidered shirt, necklace and waist pendant, grey trousers, black boots, linework and original colors. Do not redesign or add shadow, glow, scenery or checkerboard. Output 1024x1536 canvas, scale character proportionally, horizontally centered, top of hair at y=40 and bottom of boots at y=1500, entire body visible with transparent margins. Keep clean antialiased edges without tan fringe. Preserve proportions and outfit details as closely as possible. This will be the locked body and alignment master for expression variants.

## impatient

Use case: identity-preserve, expression edit for visual novel. Image 1 is the EDIT TARGET and locked transparent body/alignment master. Image 2 is ONLY the facial expression reference from the user. Edit only the facial expression of image 1 to match image 2. Preserve exactly the canvas 1024x1536, transparent background and alpha silhouette, head/body placement, head size, hair silhouette, moustache identity, neck, hands, pose, all garment folds and details, green coat, white shirt, grey trousers, necklace and waist pendant and black boots from image 1. Do not copy the background or body framing from image 2. No opaque matte, shadow, text, checkerboard, additions or redesign. Full body remains visible. Tense eyebrows, narrowed irritated eyes and tightly bared teeth, an impatient displeased grimace, as in image 2. Preserve the subtle distinction from full anger.

## angry

Use case: identity-preserve, expression edit for visual novel. Image 1 is the EDIT TARGET and locked transparent body/alignment master. Image 2 is ONLY the facial expression reference from the user. Edit only the facial expression of image 1 to match image 2. Preserve exactly the canvas 1024x1536, transparent background and alpha silhouette, head/body placement, head size, hair silhouette, moustache identity, neck, hands, pose, all garment folds and details, green coat, white shirt, grey trousers, necklace and waist pendant and black boots from image 1. Do not copy the background or body framing from image 2. No opaque matte, shadow, text, checkerboard, additions or redesign. Full body remains visible. Strongly furrowed downward eyebrows, widened angry eyes and a wide-open shouting mouth showing teeth and tongue, as in image 2. Preserve moustache and facial identity.
