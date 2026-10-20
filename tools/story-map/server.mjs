import http from 'node:http';
import { readFile, writeFile, rename, mkdir, unlink } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { serializeDocument, validateDocument } from './document.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const types = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/style.css': ['style.css', 'text/css; charset=utf-8'], '/document.mjs': ['document.mjs', 'text/javascript; charset=utf-8'] };

export function createStoryServer({ file = join(root, 'story.json') } = {}) {
  let queue = Promise.resolve();
  const load = async () => {
    const bytes = await readFile(file);
    return { document: validateDocument(JSON.parse(bytes.toString('utf8'))), revision: hash(bytes) };
  };
  const server = http.createServer(async (req, res) => {
    const reply = (status, data, type = 'application/json; charset=utf-8') => {
      res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'" });
      res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
    };
    try {
      // Only the local page may write; reject cross-origin requests and DNS rebinding.
      const localHost = `127.0.0.1:${server.address().port}`;
      if (req.headers.host !== localHost && req.headers.host !== `localhost:${server.address().port}`) return reply(403, { error: '只允许从本机访问' });
      if (req.headers.origin && ![`http://${localHost}`, `http://localhost:${server.address().port}`].includes(req.headers.origin)) return reply(403, { error: '来源不匹配' });
      const url = new URL(req.url, `http://${localHost}`);
      if (url.pathname === '/api/document' && req.method === 'GET') return reply(200, await load());
      if (url.pathname === '/api/document' && req.method === 'POST') {
        if (!req.headers['content-type']?.startsWith('application/json')) return reply(415, { error: '需要 JSON 数据' });
        const chunks = []; let length = 0;
        for await (const chunk of req) {
          length += chunk.length;
          if (length > 8 * 1024 * 1024) return reply(413, { error: '文件超过 8 MB，请拆分画板' });
          chunks.push(chunk);
        }
        // Buffer chunks before decoding: a Chinese character can span network chunks.
        let payload;
        try { payload = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return reply(400, { error: 'JSON 格式有误' }); }
        let bytes;
        try { bytes = serializeDocument(payload.document); } catch (error) { return reply(400, { error: error.message }); }
        const save = async () => {
          const current = await load();
          if (payload.revision !== current.revision) return reply(409, { error: '磁盘文件已被其他窗口或 Git 更新，已停止覆盖。请先导出当前修改，再读取磁盘版本。' });
          const temporary = `${file}.${randomUUID()}.tmp`;
          try {
            await mkdir(dirname(file), { recursive: true });
            await writeFile(temporary, bytes, { flag: 'wx' });
            await rename(temporary, file);
          } finally { await unlink(temporary).catch(() => {}); }
          reply(200, { revision: hash(bytes) });
        };
        const operation = queue.then(save);
        queue = operation.catch(() => {});
        return await operation;
      }
      if (req.method === 'GET' && Object.hasOwn(types, url.pathname)) {
        const [path, type] = types[url.pathname];
        return reply(200, await readFile(join(root, path)), type);
      }
      if (url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
      reply(404, { error: '页面不存在' });
    } catch (error) {
      console.error('Story map:', error.message);
      if (!res.headersSent) reply(500, { error: '无法读取或保存画板。请检查 JSON 文件和磁盘权限；当前修改可先导出备份。' });
    }
  });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--port');
  const requested = index >= 0 ? Number(process.argv[index + 1]) : 4198;
  if (!Number.isInteger(requested) || requested < 0 || requested > 65535) throw new Error('Invalid port');
  const server = createStoryServer();
  server.on('error', error => {
    if (error.code === 'EADDRINUSE') server.listen(0, '127.0.0.1');
    else { console.error(error.message); process.exitCode = 1; }
  });
  server.listen(requested, '127.0.0.1');
  server.on('listening', () => {
    const url = `http://127.0.0.1:${server.address().port}`;
    console.log(`剧情画板: ${url}\n数据文件: ${join(root, 'story.json')}\n保持此窗口开启；停止工具请按 Ctrl+C。`);
    if (process.argv.includes('--open') && !process.argv.includes('--no-open') && process.platform === 'win32') {
      const child = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { windowsHide: true, detached: true, stdio: 'ignore' });
      child.on('error', error => console.error('请手动打开上面的地址:', error.message));
      child.unref();
    }
  });
}
