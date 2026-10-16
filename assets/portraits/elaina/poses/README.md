# 伊蕾娜其他三个姿势

已制作透明处理版，并在 `assets/manifest.json` 登记到当前游戏。

| 文件 | 姿势 | 原图 |
|---|---|---|
| `elaina_confident.png` | 扶帽、另一手叉腰 | `../approved/elaina_confident_source.png` |
| `elaina_thinking.png` | 托腮思考 | `../approved/elaina_thinking_source.png` |
| `elaina_explaining.png` | 摊手说明 | `../approved/elaina_explaining_source.png` |

三张均为 1024 × 1536 RGBA PNG。原图单独保留；内置 imagegen 移除底色、清理下缘，可能有局部线条和装饰变化。完整提示词见 [processing.md](processing.md)。

游戏按原剧本切换姿势，不改台词。使用 CSS 以帽子至腰部为主要显示范围，下半身在对白框附近裁去；PNG 本身保留到大腿的内容。其他角色仍为像素占位。

透明通道与八张立绘的载入检查见 [validation.json](validation.json)。最终构图需要结合用户实际试玩反馈继续调整。
