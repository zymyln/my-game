import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStoryServer } from './server.mjs';
import { validateDocument, serializeDocument } from './document.mjs';
import http from 'node:http';

const example = JSON.parse(await readFile(new URL('./story.json', import.meta.url), 'utf8'));
async function fixture(t) {
  const folder = await mkdtemp(join(tmpdir(), 'story-map-test-'));
  const file = join(folder, 'story.json'); await writeFile(file, serializeDocument(example));
  const server = createStoryServer({ file });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(folder, { recursive: true }); });
  const url = `http://127.0.0.1:${server.address().port}`;
  const get = async () => (await fetch(url + '/api/document')).json();
  const post = (document, revision, headers = {}) => fetch(url + '/api/document', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ document, revision }) });
  return { file, url, get, post };
}

test('Chinese text, positions, branch convergence, and byte-stable round trips persist', async t => {
  const { get, post, file } = await fixture(t);
  const loaded = await get();
  loaded.document.title = '中文剧本 🌙'; loaded.document.nodes[0].text = '第一行\n第二行：她说“你好”。';
  loaded.document.nodes[0].x = -345;
  const response = await post(loaded.document, loaded.revision);
  assert.equal(response.status, 200);
  const saved = await get();
  assert.deepEqual(saved.document, loaded.document);
  assert.notEqual(saved.revision, loaded.revision);
  assert.equal(await readFile(file, 'utf8'), serializeDocument(loaded.document));
  assert.equal(serializeDocument(saved.document), serializeDocument(loaded.document));
});
test('a stale tab cannot overwrite an external Git/file update', async t => {
  const { get, post, file } = await fixture(t);
  const first = await get();
  const external = structuredClone(first.document); external.title = '另一台电脑的版本';
  await writeFile(file, serializeDocument(external));
  first.document.title = '过期窗口';
  assert.equal((await post(first.document, first.revision)).status, 409);
  assert.equal((await get()).document.title, external.title);
});
test('concurrent saves from the same revision allow only one writer', async t => {
  const { get, post } = await fixture(t);
  const first = await get();
  const a = structuredClone(first.document), b = structuredClone(first.document);
  a.title = 'A'; b.title = 'B';
  const responses = await Promise.all([post(a, first.revision), post(b, first.revision)]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 409]);
});
test('invalid imports cannot damage the file; bad references and duplicate IDs are rejected', async t => {
  const { get, post, file } = await fixture(t);
  const before = await readFile(file, 'utf8'); const loaded = await get();
  loaded.document.edges[0].to = 'missing';
  assert.equal((await post(loaded.document, loaded.revision)).status, 400);
  assert.equal(await readFile(file, 'utf8'), before);
  const duplicate = structuredClone(example); duplicate.nodes.push(duplicate.nodes[0]);
  assert.throws(() => validateDocument(duplicate), /重复/);
  const badPosition = structuredClone(example); badPosition.nodes[0].x = null;
  assert.throws(() => validateDocument(badPosition), /位置/);
  assert.doesNotThrow(() => validateDocument({ version: 1, title: '', nodes: [], edges: [] }));
});
test('Chinese UTF-8 characters split across HTTP chunks survive saving', async t => {
  const { url, get } = await fixture(t); const loaded = await get();
  loaded.document.title = '剧情汉字';
  const body = Buffer.from(JSON.stringify({ document: loaded.document, revision: loaded.revision }));
  const position = body.indexOf(Buffer.from('剧')) + 1;
  const status = await new Promise((resolve, reject) => {
    const req = http.request(url + '/api/document', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.on('error', reject); req.write(body.subarray(0, position)); setImmediate(() => req.end(body.subarray(position)));
  });
  assert.equal(status, 200); assert.equal((await get()).document.title, '剧情汉字');
});
test('local service serves only its page and rejects foreign-origin writes', async t => {
  const { url, get, post } = await fixture(t); const loaded = await get();
  assert.equal((await fetch(url)).status, 200);
  assert.equal((await fetch(url + '/docs/contract.md')).status, 404);
  assert.equal((await fetch(url + '/story.json')).status, 404);
  assert.equal((await post(loaded.document, loaded.revision, { Origin: 'https://other.example' })).status, 403);
});
