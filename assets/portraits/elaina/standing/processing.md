# 2026-10-17 站立五表情发色更新处理记录

用户提供五张已修正发色的 1024×1536 PNG。输入五张均为全不透明黑底，故使用内置 imagegen 编辑去底，未使用 CLI/API。每张均以对应新版原图为编辑目标，要求保留发色、表情和构图，不以旧版颜色重新生成。AI 输出仍可能有细微颜色和线条变化，详见 validation.json，不能宣称逐像素不变。

原件副本：`../approved/standing-hair-update-2026-10-17/`。旧游戏版及旧处理记录：`history/2026-10-17-before-hair-update/`。现有文件名保持不变，游戏和校对页均直接读取本次处理版。

## 共用提示词

Use case: background-extract. Image 1 is the EDIT TARGET, the user's NEW HAIR-COLOR-CORRECTED Elaina standing expression image. Perform only background removal, NOT illustration regeneration. Replace the opaque black backdrop with genuine transparent RGBA, including enclosed background gaps. Preserve ALL non-background foreground colors exactly, most critically the user's corrected pale silver-lilac hair and shading: no recoloring, no warmer pink shift, no desaturation or new lighting. Preserve facial expression, linework, pose, hair strands, hat, gold trim, vivid pink woven hat bands, purple brim underside, blue sleeve embroidery, jewelry and clothing details. Keep same 1024x1536 canvas, exact scale, head/body alignment and silhouette; do not resize, recenter, crop or invent anything. Black/dark hat, coat, skirt, outlines and shadowed details are foreground and MUST NOT become transparent. Clean only the edge contamination from the black background, preserving fine hair and anti-aliased edges. No added shadows, haze, checkerboard, text or objects.

## elaina_standing

Preserve the neutral closed-mouth expression.

## elaina_standing_smile

Preserve the small closed-mouth smile.

## elaina_standing_blank

Preserve the half-lidded unimpressed eyes and straight mouth.

## elaina_standing_surprised

Preserve the open round surprised eyes and small round open mouth.

## elaina_standing_serious

Preserve serious eyebrows and closed mouth. Clean the thin stray white edge line beneath the thighs so the lower silhouette ends cleanly in alpha; do not change any other details.
