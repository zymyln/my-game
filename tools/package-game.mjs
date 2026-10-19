// Dependency-free standalone export. Source game files and story remain untouched.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const destination=path.join(root,'releases');
const htmlName='开始游戏.html',archiveName='魔女之旅-第一章-离线试玩版.zip';
const read=relative=>readFile(path.join(root,...relative.split('/')),'utf8');
const sha256=data=>createHash('sha256').update(data).digest('hex');
function replaceRequired(source,pattern,replacement,label){
  if(!pattern.test(source))throw new Error(`Standalone adapter needs updating: ${label}`);
  return source.replace(pattern,replacement);
}
const modules={};
async function includeModule(file){
  if(Object.hasOwn(modules,file))return;
  if(!/^src\/[\w-]+\.(m?js)$/.test(file)||file.endsWith('.test.mjs')||file==='src/server.mjs')throw new Error(`Unexpected browser module: ${file}`);
  let source=await read(file);modules[file]='';const dependencies=[];
  source=source.replace(/(\bfrom\s*)(['"])(\.{1,2}\/[^'"]+)\2/g,(_,prefix,quote,relative)=>{
    const target=path.posix.normalize(path.posix.join(path.posix.dirname(file),relative));dependencies.push(target);
    return `${prefix}${quote}majonotabi/${target}${quote}`;
  });
  if(/\bimport\s*\(/.test(source))throw new Error(`Review dynamic imports before packaging ${file}`);
  source=source.replace(/import\.meta\.url/g,JSON.stringify(`https://offline.majonotabi.invalid/${file}`));
  if(file==='src/main.js')source=replaceRequired(source,/^\s*if \(location\.protocol==='file:'\) throw new Error\([^\r\n]+\);/m,'','file-protocol guard');
  if(file==='src/assets.js'){
    source=replaceRequired(source,/if \(url\.origin !== location\.origin\) return;/,'if (!Object.hasOwn(globalThis.__offlineGameImages,path)) return;','asset allowlist');
    source=replaceRequired(source,/item\.src = url\.href;/,'item.src = globalThis.__offlineGameImages[path];','embedded image lookup');
  }
  modules[file]=source;
  for(const dependency of dependencies)await includeModule(dependency);
}
await includeModule('src/main.js');
const manifest=JSON.parse(await read('assets/manifest.json')),images={},imageRecords=[];
for(const relative of new Set(Object.values(manifest).flatMap(category=>Object.values(category)))){
  if(typeof relative!=='string'||!relative.endsWith('.png')||relative.split('/').some(part=>part==='..'||part.startsWith('.'))||path.isAbsolute(relative))throw new Error(`Unexpected asset path: ${relative}`);
  const data=await readFile(path.join(root,'assets',...relative.split('/')));
  images[relative]=`data:image/png;base64,${data.toString('base64')}`;
  imageRecords.push({path:relative,bytes:data.length,sha256:sha256(data)});
}
const activeScript=(await read('content/script/ch1.md')).split(/^##\s+附录/m)[0];
const branchScript=await read('content/script/ch1_branch_b.md');
const branchStart=branchScript.search(/^##\s+SC-02/m);
if(branchStart<0)throw new Error('Branch script is missing its first scene');
const files={
  '/assets/manifest.json':JSON.stringify(manifest),
  '/content/script/ch1.md':activeScript,
  '/content/script/ch1_branch_b.md':branchScript.slice(branchStart),
};
const payload=JSON.stringify({modules,images,files}).replace(/</g,'\\u003c');
const boot=`<script id="offline-game-data" type="application/json">${payload}</script>
<script>
(() => {
  const dataNode=document.getElementById('offline-game-data');
  const data=JSON.parse(dataNode.textContent);dataNode.remove();
  globalThis.__offlineGameImages=Object.freeze(data.images);
  const files=data.files,originalFetch=globalThis.fetch.bind(globalThis);
  globalThis.fetch=(input,options)=>{
    const url=new URL(input instanceof Request?input.url:String(input),location.href);
    if(url.origin==='https://offline.majonotabi.invalid'){
      if(!Object.hasOwn(files,url.pathname))return Promise.resolve(new Response('Missing packaged resource',{status:404}));
      return Promise.resolve(new Response(files[url.pathname],{headers:{'Content-Type':url.pathname.endsWith('.json')?'application/json; charset=utf-8':'text/plain; charset=utf-8'}}));
    }
    return originalFetch(input,options);
  };
  const imports={};
  for(const [name,code] of Object.entries(data.modules))imports['majonotabi/'+name]=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
  const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports});document.head.append(map);
  const entry=document.createElement('script');entry.type='module';entry.textContent='import "majonotabi/src/main.js";';document.body.append(entry);
})();
</script>`;
let html=await read('index.html');
// Use function replacements so literal $ characters in CSS/JS cannot become replacement patterns.
const css=await read('src/styles.css');
html=replaceRequired(html,/<link rel="stylesheet" href="\.\/src\/styles\.css"\s*\/>/,()=>`<style>${css}</style>`,'stylesheet');
html=replaceRequired(html,/<script type="module" src="\.\/src\/main\.js"><\/script>/,()=>boot,'entry module');
html=html.replace('同人小游戏 · 制作中','第一章 · 离线试玩版').replace('第一章 · 角色素材逐步接入','第一章 · 离线试玩版');
const htmlData=Buffer.from(html,'utf8');
const instructions=Buffer.from('\ufeff魔女之旅 · 瓶中的幸福\r\n第一章离线试玩版\r\n\r\n1. 先将压缩包完整解压到任意文件夹。\r\n2. 双击“开始游戏.html”，使用电脑上的 Microsoft Edge 或 Google Chrome 打开。\r\n3. 点击“开始旅行”即可游玩；无需联网、安装程序或安装 Node.js。\r\n\r\n操作：WASD / 方向键移动，E 交互，空格继续，Esc 暂停，F 全屏。\r\n按住 Ctrl 可快进，松开恢复；也可点击画面内“快进”按钮切换。遇到选项、行走和暂停会自动停止。\r\n分支选项只能用鼠标左键点击，键盘不会替你选择。\r\n右上角可调整声音和音量。第一章包含主线与不送瓶子的支线、剧情行走与调查、人物立绘、六段幸福插画、完整 CG 和开场/离场飞行。\r\n餐厅中的调查会影响后续选项；声音面板可试听配乐。\r\n\r\n如果打开后看到代码或没有运行，请右键“开始游戏.html”→打开方式→Microsoft Edge / Google Chrome。\r\n请不要直接在压缩包预览窗口里运行，也不要用聊天软件内置的文件预览器打开。\r\n关闭浏览器页面即可退出。当前版本无进度存档，刷新页面会回到标题。\r\n\r\n这是《魔女之旅》同人游戏的第一章试玩版。\r\n本包仅含当前运行所需内容，不含开发仓库、素材历史备份或未接入的支线草稿。\r\n手机及聊天软件内置浏览器尚未作为发行目标验证；建议使用电脑浏览器。\r\n','utf8');

// ZIP with UTF-8 filenames and raw DEFLATE, using only Node built-ins.
const crcTable=Array.from({length:256},(_,value)=>{for(let bit=0;bit<8;bit++)value=(value&1)?0xedb88320^(value>>>1):value>>>1;return value>>>0;});
function crc32(data){let crc=0xffffffff;for(const byte of data)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
function zip(entries){
  const local=[],central=[];let offset=0;
  const date=new Date(),dosTime=(date.getHours()<<11)|(date.getMinutes()<<5)|(date.getSeconds()>>1),dosDate=((date.getFullYear()-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate();
  for(const [filename,data] of entries){
    const name=Buffer.from(filename,'utf8'),packed=deflateRawSync(data,{level:9}),crc=crc32(data);
    if(data.length>0xffffffff||packed.length>0xffffffff)throw new Error('Archive requires ZIP64');
    const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(dosTime,10);header.writeUInt16LE(dosDate,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(packed.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(name.length,26);
    local.push(header,name,packed);
    const record=Buffer.alloc(46);record.writeUInt32LE(0x02014b50,0);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt16LE(8,10);record.writeUInt16LE(dosTime,12);record.writeUInt16LE(dosDate,14);record.writeUInt32LE(crc,16);record.writeUInt32LE(packed.length,20);record.writeUInt32LE(data.length,24);record.writeUInt16LE(name.length,28);record.writeUInt32LE(offset,42);central.push(record,name);offset+=header.length+name.length+packed.length;
  }
  const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,directory,end]);
}
const archive=zip([[htmlName,htmlData],['先看这里.txt',instructions]]);
await mkdir(destination,{recursive:true});await writeFile(path.join(destination,archiveName),archive);
let revision='unknown';try{revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();}catch{}
const info={createdAt:new Date().toISOString(),sourceRevision:revision,archive:{file:archiveName,bytes:archive.length,sha256:sha256(archive)},game:{file:htmlName,bytes:htmlData.length,sha256:sha256(htmlData)},target:'Desktop Microsoft Edge / Google Chrome; offline file opening',modules:Object.keys(modules),assets:imageRecords,scriptAppendixIncluded:false,dependenciesRequiredByPlayer:[]};
await writeFile(path.join(destination,'release-info.json'),JSON.stringify(info,null,2)+'\n');
console.log(JSON.stringify({archive:path.join(destination,archiveName),archiveMiB:Math.round(archive.length/1048576*10)/10,htmlBytes:htmlData.length,modules:info.modules.length,images:imageRecords.length,sha256:info.archive.sha256},null,2));
