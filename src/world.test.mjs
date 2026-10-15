import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SCENES, START, START_SCENE, canStand, nearestInteraction, readHallObservations } from './world.mjs';

test('all exits lead to valid scenes and unobstructed arrival points',()=>{
  assert.ok(canStand(START_SCENE,START.x,START.y));
  for(const scene of Object.values(SCENES))for(const exit of scene.interactions.filter(item=>item.kind==='exit')) {
    assert.ok(SCENES[exit.to],exit.id);
    assert.ok(canStand(exit.to,exit.spawn.x,exit.spawn.y),`${exit.id} arrival is blocked`);
  }
});
test('every interaction can be reached from the scene arrival points',()=>{
  // Explore the actual collision geometry on a two-pixel grid, rather than just checking labels.
  for(const [sceneId,scene] of Object.entries(SCENES)) {
    const arrivals=Object.values(SCENES).flatMap(other=>other.interactions.filter(item=>item.to===sceneId).map(item=>item.spawn));
    if(sceneId===START_SCENE)arrivals.push(START);
    for(const spawn of arrivals) {
      const origin={x:Math.round(spawn.x/2)*2,y:Math.round(spawn.y/2)*2};
      const queue=[origin],seen=new Set([`${origin.x},${origin.y}`]);
      for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2]]) {
        const x=queue[i].x+dx,y=queue[i].y+dy,key=`${x},${y}`;
        if(!seen.has(key)&&canStand(sceneId,x,y)){seen.add(key);queue.push({x,y});}
      }
      for(const item of scene.interactions)assert.ok(queue.some(point=>Math.hypot(point.x-item.x,point.y-item.y)<=item.radius),`${sceneId}: ${item.id} is unreachable`);
    }
  }
});
test('walls, pond, table, fence and NPC stop movement',()=>{
  for(const [scene,x,y] of [['field_day',0,200],['field_day',110,250],['field_day',378,202],['hall',330,220],['gate_dusk',110,245]])assert.equal(canStand(scene,x,y),false);
  assert.equal(canStand('gate_dusk',320,245),true);
  assert.equal(nearestInteraction('field_day',{x:355,y:220}).id,'emil');
  assert.equal(nearestInteraction('hall',{x:330,y:290}).id,'table');
});
test('restaurant observations are taken from the existing script and exclude the appendix',async()=>{
  const text=await readFile(new URL('../content/script/ch1.md',import.meta.url),'utf8');
  const observations=readHallObservations(text);
  assert.equal(observations.size,4);
  assert.match(observations.get('餐桌'),/只有三个人/);
  assert.equal(observations.has('水井'),false);
  assert.throws(()=>readHallObservations(''),/找不到/);
});
