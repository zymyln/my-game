import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portIndex = process.argv.indexOf('--port');
const firstPort = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 4173;
if (!Number.isInteger(firstPort) || firstPort < 1024 || firstPort > 65525) throw new Error('Port must be an integer from 1024 to 65525.');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.md':'text/plain; charset=utf-8'};
const server = http.createServer(async (request, response) => {
  if (!['GET','HEAD'].includes(request.method)) {response.writeHead(405,{'Allow':'GET, HEAD'});response.end();return;}
  try {
    const pathname = decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
    const segments = pathname.split('/');
    if(pathname.includes('\\') || segments.some(segment=>segment.startsWith('.'))) {response.writeHead(403);response.end('Forbidden');return;}
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if(!file.startsWith(root + path.sep)) {response.writeHead(403);response.end('Forbidden');return;}
    const type = types[path.extname(file).toLowerCase()];
    if(!type || !(await stat(file)).isFile()) {response.writeHead(404);response.end('Not found');return;}
    const body = await readFile(file);
    response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Length':body.length});
    response.end(request.method==='HEAD' ? undefined : body);
  } catch(error) {
    const status = error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : error instanceof URIError ? 400 : 500;
    response.writeHead(status);response.end(status===404?'Not found':'Unable to read file');
  }
});
let attempts = 0;
server.on('error',error=>{
  if(error.code==='EADDRINUSE' && attempts<9) {attempts++;server.listen(firstPort+attempts,'127.0.0.1');}
  else {console.error('Cannot start the game server:',error.message);process.exitCode=1;}
});
server.on('listening',()=>{
  const url=`http://127.0.0.1:${server.address().port}`;
  console.log(`\nWandering Witch - local preview\nLocal: ${url}\nKeep this window open while playing. Press Ctrl+C to stop.\n`);
  if(process.argv.includes('--open')) {
    const command=process.platform==='win32'?'rundll32.exe':process.platform==='darwin'?'open':'xdg-open';
    const args=process.platform==='win32'?['url.dll,FileProtocolHandler',url]:[url];
    const browser=spawn(command,args,{stdio:'ignore',detached:true,windowsHide:true});
    browser.on('error',()=>console.log(`Open this address in your browser: ${url}`));browser.unref();
  }
});
server.listen(firstPort,'127.0.0.1');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
