// Planning diagram only; no game runtime or external dependencies.
import { writeFileSync } from 'node:fs';
const out = new URL('./', import.meta.url);
const p = [];
const add = s => p.push(s);
const C = {bg:'#f5f0e5',ink:'#33443e',muted:'#68746c',stone:'#d6dac9',floor:'#eee8d5',wall:'#83917e',new:'#b16954',seal:'#c39d58',route:'#657c62',sight:'#7297a1'};
const esc = s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const txt=(x,y,s,size=18,color=C.ink,bold=false)=>add(`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${bold?'bold':'normal'}">${esc(s)}</text>`);
const rect=(x,y,w,h,fill,stroke='none',r=8)=>add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`);
const line=(d,c,w,dash='',arrow='')=>add(`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''} ${arrow?`marker-end="url(#${arrow})"`:''}/>`);
const corridor=(d,w=43)=>{line(d,C.wall,w+7);line(d,C.floor,w);};
const poly=(d,fill=C.floor)=>add(`<path d="${d}" fill="${fill}" stroke="${C.wall}" stroke-width="3" stroke-linejoin="round"/>`);
const ellipse=(x,y,rx,ry,fill,stroke=C.wall,dash='')=>add(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="3" ${dash?`stroke-dasharray="${dash}"`:''}/>`);
const label=(x,y,id,name,lines=[])=>{txt(x,y,`${id}  ${name}`,20,C.ink,true);lines.forEach((s,i)=>txt(x,y+29+i*24,s,16,C.muted));};
const patch=(x,y,name)=>{rect(x,y,145,31,'#f5dfd0',C.new,3);txt(x+9,y+22,name,15,C.new,true);};
const steps=(x,y,n=5)=>{for(let i=0;i<n;i++)line(`M${x} ${y+i*9} h64`,C.wall,2);};
add('<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1480" viewBox="0 0 1800 1480"><defs><marker id="green" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="#657c62"/></marker><marker id="red" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="#b16954"/></marker><marker id="blue" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="#7297a1"/></marker></defs><style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif}</style>');
rect(0,0,1800,1480,C.bg);
txt(45,49,'循环小镇 · 古代魔女研究遗迹 / 地图第三稿',31,C.ink,true);
txt(45,83,'依据 v0.7 ｜ 古代研究结构 + 伊森后期利用痕迹 ｜ 房间用途、路线、入口与封印落点均为规划候选',18);
rect(40,110,1320,1170,'#dce1d5','#abb6a2',38);
// Uneven surrounding bedrock, deliberately leaving a compact circulation core.
poly('M82 170 L360 145 L505 220 L480 370 L390 400 L260 315 L80 350 Z','#c6cfbb');
poly('M1070 145 L1300 165 L1320 400 L1180 370 L1090 290 Z','#c6cfbb');
poly('M70 930 L220 1010 L285 1215 L90 1225 Z','#c6cfbb');
poly('M1080 1130 L1295 1000 L1310 1220 L1120 1235 Z','#c6cfbb');
// Continuous ring bypasses the center. Side rooms join this loop by short stems.
corridor('M700 420 H510 L465 470 V940 L535 1085 H970 L1030 1005 V500 L945 420 H700',48);
corridor('M750 270 V350',45);
corridor('M750 455 V510',40);
corridor('M510 460 H410 V410',36);
corridor('M465 700 H400',40);
corridor('M465 875 H400',36);
corridor('M490 1025 H410 V1100',34);
corridor('M1030 565 H1100',36);
corridor('M1030 815 H1100',40);
corridor('M970 1085 V1140',36);
corridor('M750 1085 V985',48);
// Entry transition and research vestibule.
line('M750 126 V175',C.new,4,'8 7','red');
txt(560,145,'旧城区相关地面废墟 · 主入口候选',18,C.new,true);
poly('M600 175 H900 V255 L855 280 H635 L600 245 Z');
label(625,210,'R01','掩门与下行梯',['新旧门框交叠；地面具体接口待定']);
steps(718,286,5);
poly('M585 350 H920 V438 L875 460 H625 L585 425 Z');
label(610,385,'R02','研究前厅',['辨认方向 / 仪式结构的初步痕迹']);
// Ancient western study wing, not an urban drainage network.
poly('M135 330 H365 L410 365 V460 H170 L135 425 Z');
label(155,365,'R04','刻记与抄录室',['刻记 / 抄录面 / 缺损书架','研究方法旁证，不直给真相']);
for(let i=0;i<4;i++)rect(150+i*48,437,32,12,'#b1baa3');
poly('M120 590 L315 565 L400 610 V755 L345 785 H150 L120 735 Z');
label(145,620,'R05','西侧试验庭',['P1 · 解谜封印 1 候选','原有环槽 / 后加标记 / 操作构件']);
ellipse(255,721,61,30,'#e5d7b5',C.seal);line('M197 721 H313',C.seal,2);line('M255 698 V745',C.seal,2);
patch(150,798,'后加定位记号');
poly('M155 865 H400 V940 L365 968 H155 Z');
label(175,898,'R06','残件与比对间',['匹配用途的旁证；P1 提示就近']);
poly('M220 1060 H420 V1180 L375 1200 H245 L220 1160 Z');
label(240,1093,'R07','背风小室',['短独白 / 整理线索','莉迪娅停留处候选','不先定成住所']);
// Main void and upper observation balcony: no direct walk edge between them.
poly('M610 510 H905 V568 L865 595 H650 L610 568 Z');
label(630,545,'R03','上层观察廊',['先见中央轮廓；栏边不可直接通行']);
ellipse(754,795,225,181,'#abb8ac','#7e9081');
ellipse(754,795,180,139,'#ddd7c2','#85927e');
ellipse(754,795,138,100,'#e9dfc7','#a89772');
line('M754 589 V650',C.sight,3,'5 8','blue');
txt(664,686,'中央下沉研究场',22,C.ink,true);
txt(669,718,'R13 · 中心遗构',20,C.ink,true);
txt(634,770,'第五天：最终封印显现',21,'#896a34',true);
txt(644,804,'两人合作处理 · 企划已定',17);
txt(653,841,'不设独立魔力库',17,C.new,true);
txt(647,881,'此前可见 / 可进范围待定',16,C.muted);
// Four column positions leave a clear area for portraits/dialogue staging.
for(const [x,y] of [[603,750],[904,750],[610,860],[897,860]])ellipse(x,y,11,16,'#b6bea9');
// Eastern workspaces show occupation of existing rooms, not a second builder.
poly('M1090 425 H1285 V605 H1100 L1075 575 V465 Z');
label(1110,462,'R08','旧研究侧室',['伊森临时工作区候选','木桌 / 撑架 / 纸片 / 灯具','置入古代结构，不重造遗迹']);
rect(1120,557,98,21,'#b9856c',C.new,2);patch(1100,620,'多年利用的痕迹');
poly('M1100 720 L1245 700 L1295 755 V930 H1120 L1090 895 V750 Z');
label(1110,756,'R09','东侧配列室',['P2 · 解谜封印 2 候选','原有刻槽与可替换构件','和 P1 采用不同观察逻辑']);
for(let i=0;i<3;i++)rect(1130+i*44,870,29,28,'#d8c79c',C.seal,3);
poly('M1110 1005 H1270 V1095 H1140 L1110 1060 Z');
corridor('M1030 1005 H1110',30);
label(1125,1038,'R10','封闭小龛',['可选痕迹 / 未定']);
// Southern approach: two turns, then a shared short approach to the seal.
poly('M675 1010 H850 V1125 H675 Z');
label(693,1045,'R11','下行前庭',['柱列遮挡 / 接近前的停顿']);
steps(720,955,5);
poly('M850 1140 H1075 V1245 H850 Z');
label(868,1172,'R12','侧向维护廊',['回程捷径候选','开启与保持规则待定']);
// A hidden observation niche, no exclusive player mechanics implied.
poly('M555 1150 H655 V1235 H555 Z');corridor('M605 1085 V1150',26);
txt(563,1183,'R14',18,C.ink,true);txt(563,1208,'侧龛',17);
// Old motifs and newer marks are limited to concrete surfaces.
line('M480 656 L480 720 L505 720',C.new,4,'6 6');
line('M1050 650 V700 H1080',C.new,4,'6 6');
txt(452,565,'上层回廊',16,C.muted);
txt(450,991,'西翼回程',16,C.muted);
txt(865,1000,'柱列',15,C.muted);
txt(1020,1130,'转角后汇入前庭',15,C.muted);
// D5 suggested route; follows corridors and shares the same approach.
line('M770 308 V335',C.route,3,'','green');
line('M965 423 L1015 510 V980 L958 1070 H870',C.route,3,'8 6','green');
line('M838 1080 H782 V1000',C.route,3,'8 6','green');
line('M1038 675 V985 L980 1105 H855',C.new,3,'3 8','red');
txt(1115,672,'跟踪同一路线',15,C.new);
// Optional lateral connections deliberately stay off the main entrance network.
line('M1300 560 H1338',C.new,3,'7 6');txt(1130,407,'S1 地窖连接？',16,C.new);
line('M90 890 H140',C.new,3,'7 6');txt(70,1015,'S3 接口仅预留',16,C.new);
// Right panel: legend + explanatory section view.
rect(1390,110,370,1170,'#ede7d9','none',18);
txt(1415,150,'这次调整的重点',23,C.ink,true);
['研究空间围绕中心展开','中心从“走廊末端”移到中间','西翼：记录、比对、试验','东翼：配列、后期利用','保留古代石构与原有刻槽','伊森痕迹用可移入物表达','房间名与用途均为候选'].forEach((s,i)=>txt(1415,190+i*30,s,18));
txt(1415,445,'线型与年代',23,C.ink,true);
line('M1420 475 H1480',C.wall,18);txt(1500,481,'古代通路 / 石构',17);
line('M1420 516 H1480',C.new,4,'6 6');txt(1500,522,'后加痕迹 / 候选接口',17);
line('M1420 557 H1480',C.route,3,'8 6','green');txt(1500,563,'D5 接近路线提案',17);
line('M1420 598 H1480',C.new,3,'3 8','red');txt(1500,604,'跟踪路线示意',17);
line('M1420 639 H1480',C.sight,3,'5 8','blue');txt(1500,645,'视线，不能当通路',17);
txt(1415,707,'高差示意 · 非剖面施工图',21,C.ink,true);
line('M1425 752 H1515 V805 H1610 V860 H1730',C.wall,5);
txt(1420,740,'地面入口',16);txt(1510,793,'研究回廊',16);txt(1610,890,'中心下沉场',16);
txt(1415,935,'仍然保留的边界',23,C.ink,true);
['只有最终封印中心位置已定','P1 / P2 落点、具体机关待定','不把屏障当成永久锁门规则','古代魔女身份与年代待定','S1 / S3 不默认连通','所有空间仍在结界封锁内','不新增战斗、潜行或跳跃系统'].forEach((s,i)=>txt(1415,975+i*30,s,17));
txt(45,1324,'探索节奏：主入口 → 看见中心轮廓 → 分翼调查与解谜 → 回廊回访 → 第五天接近中心。',21,C.ink,true);
txt(45,1364,'密度来自可辨用途、局部操作、线索关联与回访；古代遗迹的破损为原有状态，不是循环导致每日腐坏。',18);
txt(45,1400,'本图是空间提案，非比例关卡：尚未验证碰撞、步行时间、遮挡视线、跨层投影；决战场地不在本轮定稿。',18);
txt(45,1436,'旧镇图不改；主入口具体接入哪处旧城地面废墟另议。R 编号只用于本稿讨论，不映射旧 U 编号或正式事件 ID。',18,C.muted);
add('</svg>');
writeFileSync(new URL('ruins-layout-v03.svg',out),p.join('\n'));
console.log('Generated ruins-layout-v03.svg');
