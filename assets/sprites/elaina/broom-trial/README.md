# 伊蕾娜骑扫帚 · 像素试作

用户提供骑扫帚的姿势参考，希望测试用像素小人在草地低空飞入的效果。现有侧面、正面和背面三张透明骑姿，左侧由右侧翻转显示，共四向独立草地动态预览；主线进场、原步行小人和剧情逻辑未替换。

直接双击 [preview.html](preview.html) 即可离线观看。以现有 640×360 草地图为背景，骑姿在画布上按 64×48 像素显示。正面从远处朝屏幕方向飞来，背面从近处背向屏幕飞去，侧面从左右滑入；约 4.2 秒到达原玩家起点 x=281、地面 y=245。角色与影子相隔约 9–11 像素，停下仍有轻微悬浮。四个按钮或方向键选择朝向，支持重播、暂停/空格；系统减少动态效果时默认暂停。

## 文件

- [pose-reference.png](pose-reference.png)：用户原参考图的原字节副本。
- [elaina_broom_source.png](elaina_broom_source.png)：内置 image_gen 生成的透明像素风骑姿，1448×1086 PNG，保留生成原件。
- [elaina_broom_front_source.png](elaina_broom_front_source.png)：正面朝屏幕的骑姿，完整脸、前侧衣服和向前伸出的扫帚柄。
- [elaina_broom_back_source.png](elaina_broom_back_source.png)：背面远去骑姿，银白长发、披风与扫帚尾，无脸。
- [generation.json](generation.json)：完整生成提示词、模式、参考角色与输出信息。使用内置工具，未使用 CLI/API。
- [directions-generation.json](directions-generation.json)：正背面完整提示词；以原侧面像素图作服装、比例与画风参考，独立生成两张。
- [grass-preview.png](grass-preview.png)：从现有 `src/art.js` 程序地图导出的预览背景，不改变主线地图。
- [validation.json](validation.json)：原件 SHA-256、尺寸、透明通道统计和预览验证。
- [directions-validation.json](directions-validation.json)：正背面原件统计和当前四向预览验证。两张新图同为 1448×1086 PNG，原侧面图片 SHA-256 保持不变。

保留银白长发、紫眼、黑紫宽檐帽与披风、粉帽带和扫帚。生成器输出为较大的像素风原图，预览通过关闭平滑的画布在 64×48 尺寸显示；不宣称原件本身严格为 64 格或固定色数。真实透明底，人物主要 alpha 接近不透明，边缘有部分透明像素。

当前各方向为单张骑姿配合位移、左侧翻转和整体起伏，尚无头发/披风逐帧摆动、转弯或落地过渡。新正背面为独立 AI 生成，细部与侧面有小幅变化，供用户比较效果。可在用户看过造型后继续制作正式进场演出。未安装依赖。
