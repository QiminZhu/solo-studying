import assert from 'node:assert/strict';
const base='http://127.0.0.1:5187';
for(const path of ['/api/setup','/api/course-folders','/api/library/folders','/api/library/folders/old-id']) {
  assert.equal((await fetch(base+path)).status,410);
  assert.equal((await fetch(base+path,{method:'POST',body:'{}'})).status,410);
}
const html=await(await fetch(base+'/')).text();assert.ok(!html.includes('Step 1 of 3'));assert.ok(!html.includes('Select your year'));
console.log('PASS: first-login initialization and folder routes are retired; the entry page has no setup wizard.');
