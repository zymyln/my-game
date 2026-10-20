import { validateDocument, serializeDocument } from './document.mjs';

const $ = id => document.getElementById(id);
const stage = $('stage'), world = $('world'), nodesLayer = $('nodes'), edgesLayer = $('edges');
const svgNS = 'http://www.w3.org/2000/svg';
const recoveryKey = `story-map-recovery:${location.host}`;
let board, revision, selected = null, connecting = false, source = null;
let undoStack = [], redoStack = [], editingKey = null;
let dirty = false, saving = false, blocked = false, timer, generation = 0;
let view = { x: 0, y: 0, scale: 1 }, gesture = null, space = false;
const clone = value => JSON.parse(JSON.stringify(value));
const nodeById = id => board.nodes.find(node => node.id === id);
const edgeById = id => board.edges.find(edge => edge.id === id);

function status(message, state = '') {
  $('save-status').replaceChildren();
  const dot = document.createElement('span'); dot.className = `status-dot ${state}`;
  $('save-status').append(dot, document.createTextNode(message));
}
function notice(message, conflict = false, retry = false) {
  $('notice').hidden = !message; $('notice-text').textContent = message;
  $('notice').classList.toggle('info', !conflict && !retry);
  $('reload-disk').hidden = !conflict; $('retry').hidden = !retry;
}
function remember() {
  try { localStorage.setItem(recoveryKey, JSON.stringify({ document: board, revision })); }
  catch { notice('浏览器备份不可用。请保持此页面开启，等待“已保存”，或导出 JSON 备份。', false, false); }
}
function markDirty() {
  dirty = true; generation++; remember();
  clearTimeout(timer);
  if (blocked) return status('保存已暂停 · 请处理文件冲突', 'error');
  status('有修改 · 等待保存', 'pending');
  timer = setTimeout(save, 450);
}
async function save() {
  clearTimeout(timer);
  if (!board || !dirty || saving || blocked) return;
  saving = true; const savedGeneration = generation;
  status('正在保存…', 'pending');
  try {
    const response = await fetch('/api/document', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document: board, revision }) });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 409) { blocked = true; notice(result.error, true); }
      throw new Error(result.error || '保存失败');
    }
    revision = result.revision;
    if (savedGeneration === generation) {
      dirty = false;
      try { localStorage.removeItem(recoveryKey); } catch { /* Optional recovery storage. */ }
      status(`已保存到 story.json · ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
      notice('');
    } else remember();
  } catch (error) {
    status(blocked ? '文件发生变化 · 已停止覆盖' : '未保存 · 请重试或导出备份', 'error');
    if (!blocked) notice(`${error.message}。请检查启动窗口是否仍开启；当前修改可导出 JSON。`, false, true);
  } finally {
    saving = false;
    if (dirty && !blocked && savedGeneration !== generation) timer = setTimeout(save, 450);
  }
}
function checkpoint(key = null) {
  if (!key || editingKey !== key) {
    undoStack.push(clone(board)); if (undoStack.length > 100) undoStack.shift();
    redoStack = [];
  }
  editingKey = key; updateHistory();
}
function change(action, key = null) {
  checkpoint(key); action(); markDirty(); render();
}
function updateHistory() {
  $('undo').disabled = !undoStack.length; $('redo').disabled = !redoStack.length;
}
function history(direction) {
  const from = direction === 'undo' ? undoStack : redoStack;
  const to = direction === 'undo' ? redoStack : undoStack;
  if (!board || !from.length || gesture) return;
  to.push(clone(board)); board = from.pop(); editingKey = null;
  selected = null; endConnect(); markDirty(); render(); renderInspector(); updateHistory();
  $('board-title').value = board.title;
}
function selection(kind, id) {
  editingKey = null; selected = id ? { kind, id } : null;
  renderSelection(); renderInspector();
}
function renderSelection() {
  for (const card of nodesLayer.children) {
    card.classList.toggle('selected', selected?.kind === 'node' && selected.id === card.dataset.id);
    card.classList.toggle('source', source === card.dataset.id);
  }
  for (const edge of edgesLayer.children) edge.classList.toggle('selected', selected?.kind === 'edge' && selected.id === edge.dataset.id);
  for (const path of edgesLayer.querySelectorAll('.edge-line')) path.setAttribute('marker-end', path.parentElement.classList.contains('selected') ? 'url(#arrow-selected)' : 'url(#arrow)');
}
function render() {
  const fragment = document.createDocumentFragment();
  board.nodes.forEach((node, index) => {
    const card = document.createElement('article'); card.className = 'card'; card.dataset.id = node.id; card.dataset.color = node.color;
    card.style.left = `${node.x}px`; card.style.top = `${node.y}px`;
    card.tabIndex = 0; card.setAttribute('aria-label', `场景：${node.title || '未命名场景'}`);
    const top = document.createElement('div'); top.className = 'card-top';
    const dot = document.createElement('span'); dot.className = 'card-dot';
    top.append(dot, document.createTextNode(`SCENE ${String(index + 1).padStart(2, '0')}`));
    const title = document.createElement('h3'); title.textContent = node.title || '未命名场景';
    const text = document.createElement('p'); text.textContent = node.text || '双击，写下这里发生的事…';
    card.append(top, title, text); fragment.append(card);
  });
  nodesLayer.replaceChildren(fragment); renderEdges(); renderSelection();
  $('empty').hidden = board.nodes.length !== 0;
  $('counts').textContent = `${board.nodes.length} 个文本框 · ${board.edges.length} 条箭头`;
}
function svg(tag, attributes) {
  const element = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}
function renderEdges() {
  const sizes = new Map(Array.from(nodesLayer.children, card => [card.dataset.id, { w: card.offsetWidth, h: card.offsetHeight }]));
  const fragment = document.createDocumentFragment();
  for (const edge of board.edges) {
    const a = nodeById(edge.from), b = nodeById(edge.to), sa = sizes.get(a.id), sb = sizes.get(b.id);
    const ac = { x: a.x + sa.w / 2, y: a.y + sa.h / 2 }, bc = { x: b.x + sb.w / 2, y: b.y + sb.h / 2 };
    let start, end, c1, c2;
    const dx = bc.x - ac.x, dy = bc.y - ac.y;
    if (Math.abs(dx) > Math.abs(dy) * .8) {
      const sign = dx >= 0 ? 1 : -1;
      start = { x: ac.x + sign * (sa.w / 2 + 3), y: ac.y }; end = { x: bc.x - sign * (sb.w / 2 + 7), y: bc.y };
      const bend = Math.max(45, Math.abs(end.x - start.x) * .46);
      c1 = { x: start.x + sign * bend, y: start.y }; c2 = { x: end.x - sign * bend, y: end.y };
    } else {
      const sign = dy >= 0 ? 1 : -1;
      start = { x: ac.x, y: ac.y + sign * (sa.h / 2 + 3) }; end = { x: bc.x, y: bc.y - sign * (sb.h / 2 + 7) };
      const bend = Math.max(45, Math.abs(end.y - start.y) * .46);
      c1 = { x: start.x, y: start.y + sign * bend }; c2 = { x: end.x, y: end.y - sign * bend };
    }
    const d = `M${start.x},${start.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${end.x},${end.y}`;
    const group = svg('g', { class: 'edge', 'data-id': edge.id });
    group.append(svg('path', { class: 'edge-hit', d }), svg('path', { class: 'edge-line', d, 'marker-end': 'url(#arrow)' }));
    if (edge.label) {
      const label = svg('text', { class: 'edge-label', x: (start.x + 3 * c1.x + 3 * c2.x + end.x) / 8, y: (start.y + 3 * c1.y + 3 * c2.y + end.y) / 8 - 10 });
      label.textContent = edge.label; group.append(label);
    }
    fragment.append(group);
  }
  edgesLayer.replaceChildren(fragment); renderSelection();
}
function renderInspector() {
  const node = selected?.kind === 'node' && nodeById(selected.id);
  const edge = selected?.kind === 'edge' && edgeById(selected.id);
  $('welcome').hidden = !!node || !!edge; $('node-editor').hidden = !node; $('edge-editor').hidden = !edge;
  if (node) {
    $('node-title').value = node.title; $('node-text').value = node.text;
    for (const button of $('colors').children) button.setAttribute('aria-pressed', String(button.dataset.color === node.color));
  }
  if (edge) {
    $('edge-label').value = edge.label;
    $('edge-route').textContent = `${nodeById(edge.from).title || '未命名场景'} → ${nodeById(edge.to).title || '未命名场景'}`;
  }
}
function applyView() {
  world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  stage.style.backgroundSize = `${22 * view.scale}px ${22 * view.scale}px`;
  stage.style.backgroundPosition = `${view.x}px ${view.y}px`;
  $('zoom-value').textContent = `${Math.round(view.scale * 100)}%`;
}
function point(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  return { x: (clientX - rect.left - view.x) / view.scale, y: (clientY - rect.top - view.y) / view.scale };
}
function zoom(factor, x = stage.clientWidth / 2, y = stage.clientHeight / 2) {
  const next = Math.min(2, Math.max(.18, view.scale * factor));
  view.x = x - (x - view.x) * next / view.scale; view.y = y - (y - view.y) * next / view.scale;
  view.scale = next; applyView();
}
function fit() {
  if (!board?.nodes.length) { view = { x: 0, y: 0, scale: 1 }; return applyView(); }
  const cards = Array.from(nodesLayer.children);
  const left = Math.min(...board.nodes.map(n => n.x)), top = Math.min(...board.nodes.map(n => n.y));
  const right = Math.max(...cards.map(c => nodeById(c.dataset.id).x + c.offsetWidth));
  const bottom = Math.max(...cards.map(c => nodeById(c.dataset.id).y + c.offsetHeight));
  const width = stage.clientWidth, height = stage.clientHeight;
  const scale = Math.min(1, Math.max(.18, (width - 100) / (right - left)), Math.max(.18, (height - 200) / (bottom - top)));
  view = { scale, x: (width - (right - left) * scale) / 2 - left * scale, y: (height - (bottom - top) * scale) / 2 - top * scale + 15 };
  applyView();
}
function addNode(parentId = null) {
  if (!board) return;
  if (board.nodes.length >= 2000) return notice('最多支持 2000 个文本框，请另建画板。');
  const parent = parentId && nodeById(parentId);
  if (parent && board.edges.length >= 5000) return notice('最多支持 5000 条箭头，请另建画板。');
  const center = point(stage.getBoundingClientRect().left + stage.clientWidth / 2, stage.getBoundingClientRect().top + stage.clientHeight / 2);
  let x = parent ? parent.x + 340 : center.x - 120, y = parent ? parent.y : center.y - 70;
  while (board.nodes.some(n => Math.abs(n.x - x) < 30 && Math.abs(n.y - y) < 30)) { x += 25; y += 45; }
  const node = { id: crypto.randomUUID(), title: '新的场景', text: '', x: Math.max(-49000, Math.min(49000, Math.round(x))), y: Math.max(-49000, Math.min(49000, Math.round(y))), color: parent?.color || 'lavender' };
  change(() => {
    board.nodes.push(node);
    if (parent) board.edges.push({ id: crypto.randomUUID(), from: parent.id, to: node.id, label: '' });
  });
  endConnect(); selection('node', node.id);
  if (parent) fit();
  $('node-title').focus(); $('node-title').select();
}
function deleteSelected() {
  if (!selected) return;
  change(() => {
    if (selected.kind === 'node') {
      board.nodes = board.nodes.filter(n => n.id !== selected.id);
      board.edges = board.edges.filter(e => e.from !== selected.id && e.to !== selected.id);
    } else board.edges = board.edges.filter(e => e.id !== selected.id);
    selected = null;
  });
  endConnect(); renderInspector();
}
function endConnect() {
  connecting = false; source = null; stage.classList.remove('connecting'); $('connect').classList.remove('active');
  $('connect').setAttribute('aria-pressed', 'false'); renderSelection();
  if (!blocked && !$('retry').hidden) return;
  if (!blocked) notice('');
}
function connectNode(id) {
  if (!source) {
    source = id; selection('node', id); renderSelection();
    notice('已选起点。现在点击终点文本框；按 Esc 取消。'); return;
  }
  if (source === id) return notice('请选择另一个文本框作为终点；按 Esc 取消。');
  if (board.edges.some(e => e.from === source && e.to === id)) return notice('这两个文本框之间已有同方向的箭头。');
  if (board.edges.length >= 5000) return notice('最多支持 5000 条箭头，请另建画板。');
  const edge = { id: crypto.randomUUID(), from: source, to: id, label: '' };
  change(() => board.edges.push(edge)); endConnect(); selection('edge', edge.id); $('edge-label').focus();
}

$('add').onclick = () => addNode();
$('add-child').onclick = () => addNode(selected?.kind === 'node' ? selected.id : null);
$('delete-node').onclick = deleteSelected; $('delete-edge').onclick = deleteSelected;
for (const button of document.querySelectorAll('.deselect')) button.onclick = () => selection(null, null);
$('connect').onclick = () => {
  if (connecting) return endConnect();
  connecting = true; source = null; stage.classList.add('connecting'); $('connect').classList.add('active');
  $('connect').setAttribute('aria-pressed', 'true'); notice('依次点击起点和终点文本框，创建箭头。按 Esc 取消。');
};
$('undo').onclick = () => history('undo'); $('redo').onclick = () => history('redo');
$('zoom-in').onclick = () => zoom(1.2); $('zoom-out').onclick = () => zoom(1 / 1.2);
$('zoom-value').onclick = () => zoom(1 / view.scale); $('fit').onclick = fit;
stage.addEventListener('wheel', event => {
  event.preventDefault(); if (gesture) return;
  const rect = stage.getBoundingClientRect(); zoom(Math.exp(-event.deltaY * .0015), event.clientX - rect.left, event.clientY - rect.top);
}, { passive: false });
stage.addEventListener('pointerdown', event => {
  if (!board || ![0, 1].includes(event.button) || gesture) return;
  const card = event.target.closest('.card'), edge = event.target.closest('.edge');
  if (connecting && card && event.button === 0) { event.preventDefault(); connectNode(card.dataset.id); return; }
  if (edge && !space && event.button === 0) { selection('edge', edge.dataset.id); return; }
  if (connecting && !space) return;
  const node = card && !space && event.button === 0 ? nodeById(card.dataset.id) : null;
  if (node) selection('node', node.id); else selection(null, null);
  stage.focus({ preventScroll: true }); event.preventDefault();
  gesture = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, node, x: node?.x ?? view.x, y: node?.y ?? view.y, moved: false };
  (node ? card : stage).setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove', event => {
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  const dx = event.clientX - gesture.clientX, dy = event.clientY - gesture.clientY;
  if (!gesture.moved && Math.hypot(dx, dy) < 3) return;
  if (!gesture.moved) { gesture.moved = true; if (gesture.node) checkpoint(); }
  if (gesture.node) {
    gesture.node.x = Math.round(Math.max(-50000, Math.min(50000, gesture.x + dx / view.scale)));
    gesture.node.y = Math.round(Math.max(-50000, Math.min(50000, gesture.y + dy / view.scale)));
    const card = Array.from(nodesLayer.children).find(c => c.dataset.id === gesture.node.id);
    card.style.left = `${gesture.node.x}px`; card.style.top = `${gesture.node.y}px`; renderEdges();
  } else { view.x = gesture.x + dx; view.y = gesture.y + dy; applyView(); }
});
function finishGesture() {
  if (gesture?.node && gesture.moved) markDirty();
  gesture = null;
}
stage.addEventListener('pointerup', finishGesture); stage.addEventListener('pointercancel', finishGesture); stage.addEventListener('lostpointercapture', finishGesture);
stage.addEventListener('dblclick', event => {
  if (connecting) return;
  const card = event.target.closest('.card');
  if (card) { selection('node', card.dataset.id); $('node-text').focus(); }
});
stage.addEventListener('keydown', event => {
  const card = event.target.closest('.card');
  if (card && event.key === 'Enter') { event.preventDefault(); selection('node', card.dataset.id); $('node-title').focus(); }
});

function bindField(id, target, property) {
  const element = $(id);
  element.addEventListener('focus', () => { editingKey = null; });
  element.addEventListener('input', () => {
    const object = target(); if (!object) return;
    checkpoint(`${id}:${selected?.id || 'board'}`); object[property] = element.value;
    markDirty(); render();
  });
  element.addEventListener('blur', () => { editingKey = null; });
}
bindField('board-title', () => board, 'title');
bindField('node-title', () => selected?.kind === 'node' && nodeById(selected.id), 'title');
bindField('node-text', () => selected?.kind === 'node' && nodeById(selected.id), 'text');
bindField('edge-label', () => selected?.kind === 'edge' && edgeById(selected.id), 'label');
for (const button of $('colors').children) button.onclick = () => {
  const node = selected?.kind === 'node' && nodeById(selected.id);
  if (!node || node.color === button.dataset.color) return;
  change(() => { node.color = button.dataset.color; }); renderInspector();
};
document.addEventListener('keydown', event => {
  if (event.isComposing || !board) return;
  const input = event.target.closest('input,textarea,[contenteditable=true]');
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); return; }
  if (event.key === 'Escape') { endConnect(); selection(null, null); if (input) input.blur(); return; }
  if (input) return;
  if ((event.ctrlKey || event.metaKey) && ['z', 'y'].includes(event.key.toLowerCase())) {
    event.preventDefault(); history(event.shiftKey || event.key.toLowerCase() === 'y' ? 'redo' : 'undo'); return;
  }
  if (event.code === 'Space') { event.preventDefault(); space = true; }
  if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteSelected(); }
  if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === 'n') { event.preventDefault(); addNode(); }
});
document.addEventListener('keyup', event => { if (event.code === 'Space') space = false; });
window.addEventListener('blur', () => { space = false; finishGesture(); });
window.addEventListener('beforeunload', event => {
  if (gesture?.node && gesture.moved) finishGesture();
  if (dirty || saving) { remember(); event.preventDefault(); event.returnValue = ''; }
});
$('export').onclick = () => {
  if (!board) return;
  const url = URL.createObjectURL(new Blob([serializeDocument(board)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'story.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};
$('import').onclick = () => $('file-input').click();
$('file-input').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 8 * 1024 * 1024) throw new Error('文件超过 8 MB，请拆分画板');
    const next = validateDocument(JSON.parse(await file.text()));
    if (!confirm('用这个文件替换当前画板？替换后会自动保存，可用撤销恢复。')) return;
    change(() => { board = next; selected = null; });
    endConnect(); $('board-title').value = board.title; renderInspector(); fit();
  } catch (error) { notice(`未导入：${error.message}`); }
  finally { event.target.value = ''; }
};
$('retry').onclick = () => save();
$('reload-disk').onclick = async () => {
  if (saving) return;
  if (dirty && !confirm('读取磁盘版本会放弃本页尚未保存的修改。请先点右上角“导出 JSON”保留它们。确定继续？')) return;
  try {
    const response = await fetch('/api/document'); const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    board = validateDocument(result.document); revision = result.revision;
    dirty = false; blocked = false; selected = null; undoStack = []; redoStack = [];
    try { localStorage.removeItem(recoveryKey); } catch { /* Optional storage. */ }
    endConnect(); $('board-title').value = board.title; render(); renderInspector(); updateHistory(); fit(); status('已读取磁盘版本');
  } catch (error) { notice(`读取失败：${error.message}`, true); }
};
async function pollDisk() {
  if (!board || dirty || saving || gesture || document.hidden || blocked) return;
  const previousGeneration = generation;
  try {
    const response = await fetch('/api/document'); if (!response.ok) return;
    const result = await response.json();
    if (dirty || saving || gesture || previousGeneration !== generation || result.revision === revision) return;
    board = validateDocument(result.document); revision = result.revision;
    undoStack = []; redoStack = []; editingKey = null;
    if (selected && !(selected.kind === 'node' ? nodeById(selected.id) : edgeById(selected.id))) selected = null;
    $('board-title').value = board.title;
    render(); renderInspector(); updateHistory(); status('已读取外部更新的 story.json');
  } catch { /* Saving reports actionable network errors; polling stays quiet. */ }
}
async function start() {
  try {
    const response = await fetch('/api/document'); const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    board = validateDocument(result.document); revision = result.revision;
    let cached;
    try { cached = JSON.parse(localStorage.getItem(recoveryKey)); } catch { /* Optional storage. */ }
    if (cached?.document) {
      try {
        const recovered = validateDocument(cached.document);
        if (serializeDocument(recovered) !== serializeDocument(board)) {
          board = recovered; dirty = true;
          if (cached.revision !== revision) { revision = cached.revision; blocked = true; notice('恢复了上次未保存的编辑，但磁盘文件也有更新。请先导出当前修改，再读取磁盘版本。', true); }
          else timer = setTimeout(save, 1000);
        } else localStorage.removeItem(recoveryKey);
      } catch { notice('浏览器中的恢复副本无效，已读取磁盘文件。'); }
    }
    $('board-title').value = board.title;
    for (const id of ['board-title', 'add', 'connect', 'import', 'export']) $(id).disabled = false;
    render(); renderInspector(); fit();
    status(blocked ? '已恢复编辑 · 需要处理文件冲突' : dirty ? '已恢复上次编辑 · 等待保存' : '已读取 story.json · 修改自动保存', blocked ? 'error' : dirty ? 'pending' : '');
    setInterval(pollDisk, 4000);
  } catch (error) {
    status('读取失败 · 尚未开始编辑', 'error'); notice(error.message, false, true);
    $('retry').onclick = () => location.reload();
  }
}
new ResizeObserver(() => { if (board) applyView(); }).observe(stage);
start();
