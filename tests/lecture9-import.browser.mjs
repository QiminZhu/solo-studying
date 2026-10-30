import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { lecture9Quizzes } from '../lib/quiz-v3/lecture9.ts';
const {chromium}=await import(process.env.SOLO_PLAYWRIGHT_PATH || 'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.SOLO_CHROME_PATH});
const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const origin=process.env.SOLO_TEST_ORIGIN || 'http://127.0.0.1:5173';
const out='/private/tmp/solo-lecture9-verification';await mkdir(out,{recursive:true});
async function overflow(){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
try {
 for(const bundle of lecture9Quizzes){
  await page.goto(origin+'/subjects/itcs217/lectures/lecture-9');
  assert.equal(await page.getByRole('button',{name:'Create quiz',exact:true}).count(),0);
  assert.equal(await page.getByText('Author tools: import a six-format JSON bank',{exact:true}).count(),0);
  assert.equal(await page.getByRole('heading',{name:'Original and saved quizzes',exact:true}).count(),0);
  assert.equal(await page.getByRole('article').count(),4);
  const card=page.getByRole('article').filter({has:page.getByRole('heading',{name:bundle.quiz.title,exact:true})});
  await card.getByRole('button',{name:'Start quiz',exact:true}).click();
  await page.waitForURL(url=>url.pathname.replace(/\/$/, '').endsWith('/quizzes/run') && url.searchParams.has('attempt'));
  for(const [index,q] of bundle.questions.entries()){
   console.log(bundle.quiz.id,index,q.type);
   await page.getByText(q.prompt.replace(/\{\{([^{}]+)\}\}/g,"[blank $1]"),{exact:true}).waitFor();
   if(q.type==='single'||q.type==='multiple'){
    for(const i of q.correct){const input=page.getByRole(q.type==='single'?'radio':'checkbox',{name:q.answers[i],exact:true});await input.focus();await page.keyboard.press('Space');}
   } else if(q.type==='matching'){
    for(const [l,r] of q.matches) await page.getByRole('combobox',{name:q.leftItems[l],exact:true}).selectOption(String(r));
   } else if(q.type==='ordering'){
    const order=q.items.map((_,i)=>i);
    for(let pos=0;pos<q.correctOrder.length;pos++){
     let current=order.indexOf(q.correctOrder[pos]);
     while(current>pos){await page.getByRole('listitem',{name:`${q.items[order[current]]}, position ${current+1}`,exact:true}).focus();await page.keyboard.press('Alt+ArrowUp');[order[current-1],order[current]]=[order[current],order[current-1]];current--;}
    }
   } else if(q.type==='fill_blank'){
    for(const b of q.blanks) await page.getByRole('textbox',{name:`Blank ${b.id}${b.kind==='number'&&b.unit?` (${b.unit})`:''}`,exact:true}).fill(b.kind==='number'?String(b.value):b.acceptedAnswers[0]);
   }
   assert.equal(await page.getByRole('region',{name:'Answer feedback',exact:true}).count(),0);
   if(bundle.quiz.feedbackMode==='immediate'){
    await page.getByRole('button',{name:'Check answer',exact:true}).click();
    await page.getByRole('region',{name:'Answer feedback',exact:true}).waitFor();
    assert.match(await page.getByRole('region',{name:'Answer feedback',exact:true}).innerText(),/Correct · 1 \/ 1 point/);
    if(['single','multiple','boolean'].includes(q.type)){
     const feedback=page.getByRole('region',{name:'Answer feedback',exact:true});
     assert.equal(await feedback.locator('li.v3-part.correct').count(),q.correct.length);
     assert.equal(await feedback.locator('li.v3-part.incorrect').count(),0);
     const details=feedback.locator('details.v3-option-explanations');
     if(q.answers.length>q.correct.length){
      assert.equal(await details.getAttribute('open'),null);
      const other=q.answers.findIndex((_,i)=>!q.correct.includes(i));
      assert.equal(await details.getByText(q.optionExplanations[other],{exact:true}).isVisible(),false);
      await details.locator('summary').focus();await page.keyboard.press('Enter');
      assert.equal(await details.getByText(q.optionExplanations[other],{exact:true}).isVisible(),true);
     }
    }

   } else {
    assert.equal(await page.getByRole('button',{name:'Check answer',exact:true}).count(),0);
    assert.ok(!(await page.locator('body').innerText()).includes(q.explanation));
   }
   if(!index)for(const width of [320,768,1280]){await page.setViewportSize({width,height:900});await overflow();await page.screenshot({path:`${out}/${bundle.quiz.id}-${width}.png`,fullPage:true});}
   if(index<bundle.questions.length-1)await page.getByRole('button',{name:'Next question',exact:true}).click();
  }
  await page.getByRole('button',{name:'Final submission',exact:true}).first().click();
  await page.getByRole('dialog').getByRole('button',{name:'Submit attempt',exact:true}).click();
  await page.getByText(`${bundle.questions.length} / ${bundle.questions.length}`,{exact:false}).first().waitFor();
  console.log(bundle.quiz.title+`: ${bundle.questions.length}/${bundle.questions.length}, display and feedback verified`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
