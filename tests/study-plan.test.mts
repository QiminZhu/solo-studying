import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTopics, planSchema, readPlan, visibleTopics } from '../lib/study-plan.ts';
import type { MaterialDetail } from '../lib/material-processing.ts';
function material(id:string,names:string[]):MaterialDetail {
 return {id,name:id+'.txt',setId:'set',course:'set',year:1,semester:1,category:'Lectures',kind:'txt',size:100,pageCount:1,chunkCount:names.length,createdAt:'2026-10-23',approvedConceptIds:[],archived:false,pages:[],notes:[],warnings:[],options:{notes:'summarized',split:'headings'},concepts:names.map((name,i)=>({id:'c'+i,name,chunkId:'chunk-'+i,locator:'Page 1'})),chunks:names.map((name,i)=>({id:'chunk-'+i,page:1,locator:'Page 1',text:name+' source text'}))};
}
test('same normalized heading consolidates while preserving sources and stable IDs',()=>{
 const original=buildTopics([material('a',['Logic','Gates'])]);const expanded=buildTopics([material('a',['Logic','Gates']),material('b',['  LOGIC  ','Simulation'])]);
 assert.equal(expanded.length,3);assert.equal(expanded[0].id,original[0].id);assert.equal(expanded[0].sources.length,2);assert.equal(expanded[0].approved,false);
});
test('study modes use explicit priorities and never mutate or discard the full topic list',()=>{
 const topics=buildTopics([material('a',['Logic','Gates','Simulation'])]);const plan=readPlan('{}');plan.priorities[topics[0].id]='essential';plan.priorities[topics[2].id]='extra';
 assert.equal(visibleTopics(topics,plan).length,3);assert.equal(visibleTopics(topics,{...plan,mode:'standard'}).length,2);assert.equal(visibleTopics(topics,{...plan,mode:'cram'}).length,1);assert.equal(topics.length,3);
});
test('uploaded sources do not imply coverage or mastery, and invalid progress/settings are rejected',()=>{
 const plan=readPlan('{}');assert.deepEqual(plan.covered,[]);assert.deepEqual(plan.recalls,{});assert.equal(planSchema.safeParse({mastered:['topic-Logic']}).success,false);assert.equal(planSchema.safeParse({mode:'imaginary'}).success,false);assert.equal(planSchema.safeParse({exams:[{id:'x',title:'Exam',date:'2026-02-30',topicIds:[]}]}).success,false);
});
