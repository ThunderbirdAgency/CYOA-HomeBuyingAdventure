import assert from 'node:assert/strict';
import {episode,locations,sources,initialState,choose,enter,unlocked} from '../dist/story-data.js';
const nodes=episode.nodes;
for(const [id,node] of Object.entries(nodes)){
 assert.ok(node.text.length&&node.choices.length,id+' must have prose and a way forward');
 if(node.source)assert.ok(sources[node.source],id+' source exists');
 for(const c of node.choices)assert.ok(c.to.startsWith('@')||nodes[c.to],id+' choice destination exists');
}
const seen=new Set();function reach(id){if(seen.has(id))return;seen.add(id);for(const c of nodes[id].choices)if(!c.to.startsWith('@'))reach(c.to);}
locations.forEach(l=>reach(l.start));assert.equal(seen.size,Object.keys(nodes).length,'all authored scenes reachable');
function follow(s,ids){for(let i=0;i<ids.length;i++){s.node=ids[i];enter(s,nodes[ids[i]]);if(i+1<ids.length){const c=nodes[ids[i]].choices.find(c=>c.to===ids[i+1]);assert.ok(c,`${ids[i]} -> ${ids[i+1]}`);choose(s,c);}}}
for(const order of [['market','guild'],['guild','market']])for(const reserve of [0,1000,3000,4000])for(const outcome of ['negotiate','self-fund','step-back']){
 const s=initialState();assert.equal(unlocked(s,locations[3]),false);
 follow(s,['letter','rowan','purpose']);
 for(const id of order){assert.ok(unlocked(s,locations.find(l=>l.id===id)));if(id==='market'){follow(s,['market','budget-choice','reserve']);s.vars.reserve=reserve;follow(s,['market-end']);}else follow(s,['guild','guild-hasty','guild-end']);}
 assert.ok(unlocked(s,locations[3]));follow(s,['archive','shortcut','dispute','archive-end']);
 follow(s,['homes','appraisal','inspection',outcome,...(outcome==='self-fund'?['homes-end']:['homes-end'])]);
 assert.ok(unlocked(s,locations[5]));follow(s,['bridge','ending']);
 assert.equal(new Set(s.done).size,6);assert.equal(s.inventory.length,4);assert.ok(s.ended);
 assert.equal(s.vars.reserve,reserve,'reserve must persist into repair scenario');
 enter(s,nodes.ending);assert.equal(s.inventory.length,4,'revisiting ending must not duplicate rewards');
}
console.log('Passed: 24 complete journey variants; all scene links and citations; quest unlocks; persistent reserves; repeat-safe rewards.');
