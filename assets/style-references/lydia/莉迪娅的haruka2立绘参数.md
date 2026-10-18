# 莉迪娅的haruka2立绘参数

保存日期：2026-10-18。

本文件保存用户认可的最后一轮 **Haruka v2 原始造型探索**，用于备用与复现。不是后续 Tsubaki.3 Flash 画风迁移实验的参数。

## 结果与来源

- 用户认可该批次的第 1、3 张；本文件种子对应用户提供参数截图中显示的这张图片。
- 已保存的原始立绘文件名：`莉迪娅 微笑2.png`。
- 造型：红色下颌短发、左右两枚小棕色缎带、绿色眼睛、白衬衫与棕领结、棕色黄铜扣腰封、蓝绿百褶裙与金色裙边、黑裤袜、棕色系带短靴。
- 实际出图的棕色发饰、棕色腰封与提示词中的部分配色描述有差异；为保留这次实验，不按结果反向改写原提示词。
- 英文正面与负面提示词来自本会话最后一次 Haruka v2 提示词交付；截图仅显示提示词开头与部分负面词，未逐字核验网站内的完整内容。若实际生成前手动改过提示词，应以网站保存的完整内容为准。

## 截图确认的实际参数

| 项目 | 值 |
|---|---|
| 模型 | Haruka v2 |
| 模型版本 | v2 |
| Seed／种子 | `4775385404143189` |
| 尺寸 | **768 × 1280** |
| 宽高比 | 3:5 |
| 采样方法 | Euler a |
| 采样步数 | 20 |
| CFG 强度 | 5 |
| 提交时间 | 2026-10-18 19:45（截图显示） |
| 生成时间 | 19 秒 |

注意：实际尺寸为截图显示的 **768×1280**，不是此前建议中的 768×1152。当前种子只对应截图选中的这一张，不代表同批其他图片的种子。

## 会话建议过、但截图未确认的设置

这些项目保留作排查线索，不当作已核实的实际参数：

| 项目 | 会话建议／状态 |
|---|---|
| 生成方式 | 无底图，独立文生图；截图未完整展示生成面板 |
| 生成张数 | 建议随机四张；截图为批次中的选中结果 |
| Offset／偏移 | 建议 4；实际值截图未显示 |
| Rescale CFG | 建议关闭；截图未显示 |
| VAE | 建议默认；具体 VAE 名称未确认 |
| LoRA | 建议不添加；截图未显示完整列表 |
| 细节增强／高清／面部优化 | 建议关闭；截图未显示 |

## 正面提示词（保留当轮完整版本）

```text
masterpiece, best quality, anime illustration, visual novel character,
1girl, solo, 17-year-old girl, natural teenage proportions,
delicate face, softly tapered chin, balanced facial proportions,
gray-green eyes, gentle expression, small closed-mouth smile,
warm red hair, chin-length bob, softly layered hair, light bangs,
two matching dark teal hair ribbons,
one small ribbon bow on the left side of her head,
one small ribbon bow on the right side of her head,
symmetrical ribbon placement above the ears, both ribbon bows visible, short ribbon tails,
ivory blouse, simple small rounded collar, narrow teal collar trim,
small brown ribbon tie,
dark teal sleeveless bodice, fitted waist, brass double-breasted buttons,
matching dark teal A-line skirt, skirt ending just above knees,
soft broad pleats, simple narrow gold hemline,
opaque black pantyhose, matte tights,
brown lace-up ankle boots, low heels,
simple fantasy town outfit,
standing straight, front view, head facing forward,
arms relaxed at sides, empty hands,
full body, feet visible, centered composition,
plain light gray background, soft even lighting,
clean lineart, restrained cel shading, natural fabric folds
```

## 负面提示词（保留当轮完整版本）

包含用户提供的默认负面词及当轮补充词。当轮为纯色底，已移除与目标冲突的 `simple background`；重复的 `nsfw` 合并为一次。

```text
nsfw, worst quality, bad quality, low quality, lowres, anatomical nonsense, artistic error, bad anatomy, interlocked fingers, extra fingers, text, artist name, signature, bad feet, extra toes, ugly, poorly drawn, censor, blurry, watermark, transparent background, old, oldest, glitch, deformed, mutated, disfigured, long body, bad hands, missing fingers, extra digit, fewer digits, cropped, very displeasing, sketch, jpeg artifacts, username, censored, bar_censor, mosaic_censor, conjoined, bad ai-generated, long neck, skin blemishes, skin spots, acne, the wrong limb, error, black line, excess hands,
child, toddler, chibi, baby face, oversized head, oversized eyes, very short limbs,
single hair ribbon, asymmetrical hair accessories, metal hair clips, hairpins, oversized hair bow,
long hair, ponytail, twintails, braids, hair bun,
frilled collar, lace collar, ruffled bib, petticoat, hoop skirt, excessive frills,
bare legs, thighhighs, sheer tights, fishnet tights, garter straps,
plunging neckline, exposed shoulders, high heels,
cape, cloak, witch hat, staff, broom, weapon, knife, dagger, sword,
multiple girls, multiple views, decorative border, ornate frame, cropped feet, out of frame
```

## 备用说明

复现时先使用截图确认的模型、尺寸、采样器、步数、CFG 和种子，并粘贴本文件的完整正负提示词。未确认参数尽量从网站该条生成记录中补齐；仅凭种子和上述部分参数，不能保证逐像素重现。
