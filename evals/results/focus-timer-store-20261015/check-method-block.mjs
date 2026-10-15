import assert from'node:assert/strict';
import{methodBlock}from'./method-block.mjs';
for(const raw of['{ return 1; }','function load() { return 1; }'])assert.equal(methodBlock(raw,{name:'load',params:[]}).block,'{ return 1; }');
for(const raw of['function other() { return 1; }','function load(a) {return 1;}','function load() {} process.exit()','async function load() {}','function* load() {}','{ return 1; } { throw 2; }','function load() { /*bad*/ return 1; }'])assert.throws(()=>methodBlock(raw,{name:'load',params:[]}));
assert.equal(methodBlock('function transact(event, now) { return event; }',{name:'transact',params:['event','now']}).block,'{ return event; }');assert.throws(()=>methodBlock('function transact(now,event) {}',{name:'transact',params:['event','now']}));console.log('11 canonical-block/signature/outer-scope checks pass');
