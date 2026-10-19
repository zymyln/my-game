import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const phaser=path.join(root,'node_modules/phaser/dist/phaser.min.js');
try{await stat(phaser);}catch{console.error('Phaser is missing. Run the project launcher to install dependencies, or run pnpm install --frozen-lockfile.');process.exit(1);}
const portArg=process.argv.indexOf('--port'),port=portArg<0?4180:Number(process.argv[portArg+1]);
if(!Number.isInteger(port)||port<1024||port>65525)throw new Error('Invalid port');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname.includes('\\')||pathname.split('/').some(s=>s.startsWith('.'))){res.writeHead(403);res.end('Forbidden');return;}
    const vendor=pathname==='/vendor/phaser.min.js';
    if(!vendor&&pathname!=='/'&&pathname!=='/index.html'&&!pathname.startsWith('/src/')){res.writeHead(404);res.end('Not found');return;}
    const file=vendor?phaser:path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    const type=mime[path.extname(file)];
    if(!file.startsWith(root+path.sep)||!type||!(await stat(file)).isFile()){res.writeHead(404);res.end('Not found');return;}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404);res.end('Not found');}
});
let tries=0;
server.on('error',error=>{if(error.code==='EADDRINUSE'&&tries<9){tries++;server.listen(port+tries,'127.0.0.1');}else{console.error(error.message);process.exitCode=1;}});
server.on('listening',()=>{
  const url=`http://127.0.0.1:${server.address().port}`;
  console.log(`\nLoop Town / Phaser 3.90\n${url}\nKeep this terminal open. Ctrl+C stops the preview.\n`);
  if(process.argv.includes('--open')&&!process.argv.includes('--no-open')){const app=spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{stdio:'ignore',windowsHide:true});app.on('error',()=>console.log(`Open ${url} in your browser.`));}
});
server.listen(port,'127.0.0.1');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
