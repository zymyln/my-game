// The text computer owns content/. This module only reads its existing contract.
export function validateDialogue(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Object.keys(data).length) {
    throw new Error('对话数据为空，请先在 content/dialogue.json 中准备对话。');
  }
  for (const [id, node] of Object.entries(data)) {
    if (!/^ch\d+_.+_\d+$/.test(id) || !node || typeof node !== 'object') throw new Error(`对话格式不正确：${id}`);
    for (const field of ['speaker', 'text', 'bg']) {
      if (typeof node[field] !== 'string' || !node[field].trim()) throw new Error(`${id} 缺少有效的 ${field}。`);
    }
    if (node.face !== null && (typeof node.face !== 'string' || !node.face)) throw new Error(`${id} 的 face 必须是文件名或 null。`);
    if (node.next !== null && (typeof node.next !== 'string' || !Object.hasOwn(data, node.next))) throw new Error(`${id} 指向了不存在的下一句：${node.next}`);
  }
  const checked = new Set();
  for (const id of Object.keys(data)) {
    const visiting = new Set();
    let next = id;
    while (next !== null && !checked.has(next)) {
      if (visiting.has(next)) throw new Error(`对话形成了循环：${next}`);
      visiting.add(next);
      next = data[next].next;
    }
    for (const visited of visiting) checked.add(visited);
  }
  return data;
}

export class DialogueSession {
  constructor(data) {
    this.data = validateDialogue(data);
    const destinations = new Set(Object.values(data).map(node => node.next));
    this.firstId = Object.keys(data).find(id => !destinations.has(id));
    this.currentId = null;
    this.ended = false;
  }
  get current() { return this.currentId === null ? null : this.data[this.currentId]; }
  start(id = this.firstId) {
    if (!Object.hasOwn(this.data, id)) throw new Error(`找不到对话：${id}`);
    this.currentId = id;
    this.ended = false;
    return this.current;
  }
  advance() {
    if (this.current === null) return null;
    this.currentId = this.current.next;
    this.ended = this.currentId === null;
    return this.current;
  }
}
