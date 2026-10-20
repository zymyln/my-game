// Run with Node's built-in modules only. These diagrams are planning artifacts.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const dir = new URL('./', import.meta.url);
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
let p;
const add = s => p.push(s);
const text = (x,y,s,size=17,fill='#33413e',weight='normal') => add(`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}">${esc(s)}</text>`);
const rect = (x,y,w,h,fill,stroke='none',r=8,dash='') => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"`:''}/>`);
const path = (d,color,width,dash='') => add(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"`:''}/>`);
const dot = (x,y,label,color='#996243') => { add(`<circle cx="${x}" cy="${y}" r="14" fill="${color}"/>`); text(x-5,y+5,label,14,'#fff'); };
function start(title,subtitle) {
  p = [`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200"><style>text{font-family:'Microsoft YaHei','Noto Sans CJK SC',sans-serif} </style>`];
  rect(0,0,1600,1200,'#f5f1e7','none',0); text(40,48,title,30,'#263d38','bold'); text(40,80,subtitle,16);
}
function end(name){ add('</svg>'); writeFileSync(new URL(name,dir),p.join('\n')); }
function house(x,y,w,h,id,name,note='') {
  rect(x,y,w,h,'#fffaf0','#9b8b74',4); rect(x+5,y+5,w-10,7,'#c6ab89','none',1);
  text(x+9,y+33,`${id} ${name}`,16,'#35433f','bold'); if(note) text(x+9,y+55,note,13,'#746c60');
  path(`M${x+w/2-6} ${y+h} h12`,'#a36243',5);
}
function zone(x,y,label){text(x,y,label,22,'#3e5548','bold');}
start('循环小镇 · 地面空间草案 02','2026-10-20 ｜ 六区扩展 · 建筑外轮廓与探索口袋 ｜ 地形、用途、封印位置均为候选，非比例关卡');
rect(40,105,1200,990,'#dce4d2','#a7b59b',50);
rect(145,150,570,245,'#dad9cb'); rect(815,140,380,255,'#d1dcc5');
rect(140,435,355,360,'#cbdcbc'); rect(525,435,290,360,'#eadab8');
rect(850,435,350,365,'#dcd0b9'); rect(420,840,430,225,'#ead6bf');
path('M96 145 Q60 350 92 530 T92 860 Q82 1000 110 1080','#91bfc9',32);
// A legible street network, with a north and south bypass.
path('M655 1090 V615 V390 L455 390 V145','#f9edcf',42);
path('M140 615 H1205','#f9edcf',38);
path('M350 615 V410 H1080 V615 M350 615 V815 H1080 V615','#f9edcf',27);
path('M145 555 H470 V735 H165 M370 475 V775 M905 500 V755 H1170 M1005 500 V755 M465 910 H590 M720 910 H815 M610 220 H755 V410','#d0bd97',15);
path('M455 390 V410 M1080 410 V350 M350 815 H90','#f9edcf',23);
path('M75 815 H120','#8d795d',15);
zone(165,180,'05 旧城区'); zone(840,175,'06 林缘与旧路');
zone(155,460,'03 住宅区'); zone(535,460,'02 中心街'); zone(865,460,'04 工坊区'); zone(445,867,'01 镇口与旅人街');
house(160,205,220,85,'O1','旧公共建筑','前廊 · S2 封闭侧门');
house(490,200,205,75,'O2','旧档案屋','用途候选 · 无历史定稿');
house(170,310,205,65,'O3','旧屋与门廊','生活痕迹 / 修补差异');
house(500,300,195,70,'O4','封闭院落','可见内院 · 开放待定');
house(155,480,175,65,'H1–2','井边民居','合用井 / 门前小凳');
house(390,480,95,65,'H3','小宅','菜园');
house(155,645,175,75,'H4–5','连排住宅','共用后院 / 晾衣');
house(390,645,95,70,'H6','民居','窄门');
house(160,745,170,45,'H7–8','坡脚住宅');
house(540,480,105,70,'C1','面包店','出炉窗');
house(690,480,115,70,'C2','杂货店','门外货架');
house(540,665,105,75,'C3','餐馆','侧门');
house(690,665,115,75,'C4','公共屋','布告/寄存');
house(870,480,205,90,'W1','魔道具店','伊森归属仅制作标注');
house(1090,480,105,80,'W4','材料铺','散料架');
house(870,650,120,70,'W3','修理作坊','临街工作台');
house(1025,650,170,70,'W2','仓库','卸货 / S1 地窖');
house(1030,745,165,45,'W5','小作坊组');
house(445,930,155,100,'T1','旅馆','前厅/客房仅预留');
house(715,930,120,80,'T2','车棚','马厩候选');
house(715,1025,120,45,'T3','小商店');
// Edges and exploration pockets, distinguishable from buildings.
rect(850,210,145,85,'#e6dfc6','#a39172'); text(862,239,'E1 旧路台地',16);text(862,265,'B2 战斗封印候选',13);
rect(1020,210,170,85,'#c4d2bc','#8da086');text(1031,239,'E2 林下石构',16);text(1031,265,'地下遗迹范围预留',13);
path('M1080 350 V310 H940 V295','#baa37d',12);
rect(155,875,200,95,'#e5dfca','#a9987a');text(167,904,'E3 岸边作业空地',16);text(167,930,'B1 战斗封印候选',13);text(167,950,'留安全演出视野',13);
path('M255 875 V815','#d0bd97',14);
add('<circle cx="655" cy="615" r="48" fill="#f2e6c9" stroke="#a39372" stroke-width="2"/><circle cx="655" cy="615" r="15" fill="#9dafaa"/>');
text(570,590,'摊位带',14);text(690,590,'告示栏',14);text(594,650,'中心地标待定',14);
dot(340,580,'a');text(155,588,'共用井与洗衣角',14);
dot(405,760,'b');text(390,789,'穿院近路',13);
dot(825,770,'c');text(665,795,'南侧生活支路 / 货运绕行',14);
dot(770,345,'d');text(733,375,'高窗观察角',14);
dot(620,1000,'e');text(455,1055,'旅馆后院 · 寄存与晾晒',14);
dot(1220,710,'S','#ae5f69');text(1204,744,'S1',14,'#984a55');
dot(400,300,'S','#ae5f69');text(386,330,'S2',14,'#984a55');
dot(125,740,'S','#ae5f69');text(112,772,'S3',14,'#984a55');
text(465,429,'北横街：绕过广场连接旧城与工坊',13);
text(610,1130,'镇口 ↓ 来客道路',18);text(43,1145,'河渠、桥与坡地均待确认；镇界封锁天空与地下，任何入口都不默认能离镇。',16);
// Right margin is deliberately reserved for readable planning notes.
text(1275,140,'N ↑ 北',24,'#324c42','bold');
text(1275,195,'规模草案',21,'#324c42','bold');
['21 组建筑轮廓','住宅 / 作坊组含多户','8 处户外探索口袋','6 区以街网相连','尺寸与加载分区未定'].forEach((s,i)=>text(1275,230+i*30,s,16));
text(1275,425,'密度的三种回报',21,'#324c42','bold');
['看：生活与用途痕迹','查：物件与追问线索','走：近路与视线变化','不要求每件装饰可点'].forEach((s,i)=>text(1275,460+i*30,s,16));
text(1275,625,'地下候选接口',21,'#324c42','bold');
['S1 仓库地窖','S2 旧建筑侧门','S3 河渠检修口','是否连通见遗迹图','E2 不等于正式入口'].forEach((s,i)=>text(1275,660+i*30,s,16));
text(1275,855,'全部开放范围待定',20,'#984a55','bold');
['实线：地面路网','棕点：探索口袋','红点：地下入口候选','B1 / B2：位置提案','玩家不会看到制作编号'].forEach((s,i)=>text(1275,890+i*30,s,16));
end('town-layout-v02.svg');

start('循环小镇 · 地下遗迹空间草案 02','2026-10-20 ｜ 功能分区与高低层示意，不与地面按坐标叠合 ｜ 最终封印位置已定，其余命名、用途、通路均为提案');
rect(40,105,1200,990,'#d8dcd6','#9ba8a0',35);
// Floor corridors: ring route connects side rooms without passing the final hall.
path('M245 310 V420 H550 V320 H710 V420 H1090 V310','#a4b0a8',32);
path('M245 420 V660 H1090 V420 M550 420 V865 H710 V660 M900 420 V865 H710','#a4b0a8',32);
path('M245 660 V865 H550 M1090 660 V865 H900','#a4b0a8',26);
// Candidate surface links are not approved connections.
path('M180 145 V215 M620 145 V215 M1090 145 V215','#ae5f69',4,'8 7');
text(100,135,'S3 河渠检修口？',16,'#984a55');text(550,135,'S2 旧建筑侧门？',16,'#984a55');text(1010,135,'S1 仓库地窖？',16,'#984a55');
function room(x,y,w,h,id,name,lines,accent=false){
  rect(x,y,w,h,accent?'#e9d3b1':'#eef0e7',accent?'#a57847':'#7a9184');
  text(x+14,y+30,`${id} ${name}`,18,accent?'#81572d':'#3a5747','bold');
  lines.forEach((s,i)=>text(x+14,y+58+i*23,s,14));
}
room(110,215,280,105,'U1','排水检修前室',['生活设施过渡','仅 S3 候选连接']);
room(485,215,270,105,'U2','旧建筑下层',['台阶 / 掩门 / 旧标记','仅 S2 候选连接']);
room(955,215,255,105,'U3','储藏地窖',['箱架与用途痕迹','仅 S1 候选连接']);
room(110,475,280,120,'U4','旧分流设施',['普通设施与异常附着的过渡','P1 解谜封印候选'],true);
room(445,460,185,130,'U5','维修间',['拆卸件 / 操作痕迹','感应调查口袋']);
room(710,470,260,120,'U6','回廊观察台',['可望见中心，当前不能直达','日常设施 → 人工改造线索']);
room(1015,470,200,120,'U7','器材间',['支路尽端有发现','不放关键必需道具']);
room(110,735,280,115,'U8','配列设施室',['符文或机关对应，形式待定','P2 解谜封印候选'],true);
room(445,735,185,105,'U9','维护侧廊',['返回捷径候选','开启时机待定']);
room(710,730,260,115,'U10','改造工作区',['伊森关联物证候选','不先编写揭露内容']);
room(1020,735,195,115,'U11','支撑基座',['材料与结构回报','可省略的小支室']);
room(110,925,280,105,'U12','旧记录壁龛',['可选背景 / 感应碎片','关键解谜提示不藏于此']);
path('M245 925 V865','#a4b0a8',26);
room(490,925,460,125,'U13','地下遗迹中心 · 最终封印',['第 5 天显现：企划已定；此前表现为普通中心遗构的候选','留前庭、跟踪视线、出手距离与两人合作位置；不定分镜'],true);
path('M710 865 V925','#a4b0a8',32);
path('M950 995 H1050','#ae5f69',4,'8 7');
text(1030,945,'后续衔接预留',16,'#984a55');text(1030,975,'决战场地待定',15);text(1030,1005,'不自动通向镇外',15);
text(410,372,'上层回廊：入口分流与方位辨认',16);
text(405,695,'维护环路：绕过中心，连接调查与解谜支翼',16);
text(790,902,'下行前庭（高差与遮挡待细化）',15);
text(1275,145,'空间阅读顺序',21,'#324c42','bold');
['01 日常地下设施','02 古老结构与用途','03 后期改造的痕迹','04 封印与中心异常','这些是提案层次','不预设遗迹起源'].forEach((s,i)=>text(1275,185+i*30,s,16));
text(1275,425,'探索节奏',21,'#324c42','bold');
['前室 → 回廊 → 支翼','可见目标，绕行调查','尽端有可选信息回报','中心有独立接近前庭','沿途有短暂安静空间'].forEach((s,i)=>text(1275,465+i*30,s,16));
text(1275,675,'线型与规则',21,'#324c42','bold');
['粗实线：内部候选通路','红虚线：待定跨图接口','P1 / P2：封印位置提案','图中连接整体待确认','不包含出镇逃生通道'].forEach((s,i)=>text(1275,715+i*30,s,16));
text(1275,925,'本轮只验证结构',21,'#984a55','bold');
['不制作室内像素地图','不确定具体机关答案','不确定剧情揭露顺序'].forEach((s,i)=>text(1275,965+i*30,s,16));
text(45,1135,'五天对应：D1 B1 / D2 P1 / D3 B2 / D4 P2 / D5 中心最终封印；只有时间线已定，地点均属候选。',16);
text(45,1165,'重要：遗迹与普通地下设施是否采用同一网络、三个入口是否保留，都需用户确认；这张图是一种可讨论的方案。',16);
end('ruins-layout-v02.svg');
console.log(`Generated planning SVGs in ${fileURLToPath(dir)}`);
