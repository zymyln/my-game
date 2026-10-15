import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DialogueSession, validateDialogue } from './dialogue.mjs';

const sample = JSON.parse(await readFile(new URL('../content/dialogue.json',import.meta.url),'utf8'));
const makeNode = (next = null) => ({speaker:'旁白',text:'一页旅途。',face:null,bg:'field_day',next});

test('the checked-in sample follows next links through every line and ends at null',()=>{
  const session=new DialogueSession(sample),seen=[];
  for(let node=session.start();node;node=session.advance()) {
    assert.ok(!seen.includes(session.currentId));seen.push(session.currentId);
    assert.equal(node,sample[session.currentId]);
  }
  assert.equal(seen.length,Object.keys(sample).length);
  assert.equal(session.ended,true);assert.equal(session.advance(),null);
  assert.equal(session.start(),sample[session.firstId]);assert.equal(session.ended,false);
});
test('entry point comes from links rather than JSON property order',()=>{
  const session=new DialogueSession({ch1_test_02:makeNode(),ch1_test_01:makeNode('ch1_test_02')});
  assert.equal(session.firstId,'ch1_test_01');
});
test('missing targets and cyclic chains fail with a useful error',()=>{
  assert.throws(()=>validateDialogue({ch1_test_01:makeNode('ch1_missing_02')}),/不存在/);
  assert.throws(()=>validateDialogue({ch1_test_01:makeNode('ch1_test_02'),ch1_test_02:makeNode('ch1_test_01')}),/循环/);
});
test('invalid payloads fail before the first scene; null narrator faces are valid',()=>{
  for(const data of [null,[],{}, {ch1_test_01:{...makeNode(),face:undefined}}, {ch1_test_01:{...makeNode(),text:3}}]) assert.throws(()=>validateDialogue(data));
  assert.doesNotThrow(()=>validateDialogue({ch1_test_01:makeNode()}));
});
test('starting from an unknown line does not overwrite an active session',()=>{
  const session=new DialogueSession(sample);session.start();const original=session.currentId;
  assert.throws(()=>session.start('ch1_missing_99'),/找不到/);assert.equal(session.currentId,original);
});
