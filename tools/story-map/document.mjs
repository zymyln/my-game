export const colors = ['lavender', 'sage', 'sand', 'rose'];

export function validateDocument(value) {
  const fail = (message) => { throw new Error(message); };
  const string = (value, max, label) => {
    if (typeof value !== 'string' || value.length > max) fail(`${label}格式不正确或过长`);
    return value;
  };
  if (!value || value.version !== 1 || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) fail('请选择剧情画板的 JSON 文件（version: 1）');
  if (value.nodes.length > 2000 || value.edges.length > 5000) fail('画板最多支持 2000 个节点、5000 条连线');
  const ids = new Set();
  const nodes = value.nodes.map(node => {
    if (!node || typeof node !== 'object') fail('节点格式不正确');
    const id = string(node.id, 100, '节点 ID');
    if (!id || ids.has(id)) fail('节点 ID 为空或重复');
    ids.add(id);
    if (![node.x, node.y].every(n => Number.isFinite(n) && Math.abs(n) <= 50000)) fail('节点位置超出范围');
    if (!colors.includes(node.color)) fail('节点颜色不正确');
    return { id, title: string(node.title, 200, '节点标题'), text: string(node.text, 20000, '节点正文'), x: Math.round(node.x), y: Math.round(node.y), color: node.color };
  });
  const edgeIds = new Set();
  const pairs = new Set();
  const edges = value.edges.map(edge => {
    if (!edge || typeof edge !== 'object') fail('连线格式不正确');
    const id = string(edge.id, 100, '连线 ID');
    const pair = JSON.stringify([edge.from, edge.to]);
    if (!id || edgeIds.has(id) || !ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to || pairs.has(pair)) fail('连线重复或指向了不存在的节点');
    edgeIds.add(id); pairs.add(pair);
    return { id, from: edge.from, to: edge.to, label: string(edge.label, 200, '箭头文字') };
  });
  return { version: 1, title: string(value.title, 200, '画板名称'), nodes, edges };
}

export function serializeDocument(value) {
  return JSON.stringify(validateDocument(value), null, 2) + '\n';
}
