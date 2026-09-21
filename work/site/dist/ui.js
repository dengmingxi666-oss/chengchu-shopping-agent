const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let state=Chengchu.fresh(),history=[],busy=false,latest=null;
const options={need:['想买洁面','想买保湿','想要简单护理','想买旅行分装瓶','想买果酸'],skin:['偏干','偏油','混合肤质','不知道肤质'],discomfort:['没有不适','现在有刺痛'],sensitive:['有敏感倾向','不敏感'],fragrance:['可以接受香味','不接受香味'],experience:['有刷酸经验','第一次用果酸'],budget:['预算200元','预算300元','预算500元','预算不限']};
const labels={need:'需求',skin:'肤质',sensitive:'敏感倾向',discomfort:'当前不适',fragrance:'接受香味',budget:'预算',experience:'果酸经验',travel:'旅行需求',forWhom:'使用人'};
function productCard(p,reason){return `<article class="product"><div class="product-top"><span class="sku">${p.id}</span><span class="price">¥${p.price}</span></div><h3>${esc(p.name)}</h3><div class="size">${esc(p.size)}</div><p>${esc(p.facts)}</p><p>${esc(reason||p.fit)}</p><p class="limit">${esc(p.limit)}</p></article>`;}
function renderSide(r){$('turn').textContent='第 '+r.profile.turn+' 轮';$('profile').innerHTML='<div class="profile-tags">'+Object.entries(labels).filter(([k])=>r.profile[k]!==null&&r.profile.evidence[k]).map(([k,v])=>`<span title="用户原话：${esc(r.profile.evidence[k])}">${v}：${esc(typeof r.profile[k]==='boolean'?(r.profile[k]?'是':'否'):r.profile[k])}</span>`).join('')+'</div>';$('result-panel').innerHTML=`<div class="status-panel"><div class="stage">${esc(r.stage.toUpperCase())}</div><h3>${esc(r.status)}</h3><p>${esc(r.engine)}${r.latencyMs!==null?' · '+r.latencyMs+' ms':''}</p>${r.handoff?'<div class="warning-panel">需要门店或专业人士确认</div>':''}${r.unknowns.length?'<p>'+r.unknowns.map(esc).join('<br>')+'</p>':''}${r.notRecommended.map(p=>'<div class="warning-panel">不推荐 '+p.id+'：'+esc(p.reason)+'</div>').join('')}${r.sources.map(s=>`<div class="evidence"><b>${s.id} · ${esc(s.rule)}</b><small>${esc(s.source)}</small></div>`).join('')}</div>`;$('trace').innerHTML=r.trace.map((x,i)=>`<div class="trace-step"><b>${i+1}. ${esc(x.tool)}</b><pre>${esc(JSON.stringify({input:x.input,output:x.output},null,2))}</pre></div>`).join('');}
function clarificationCard(r){
 const card=document.createElement('section');card.className='needs-card';
 const selected={};let activeFields=[];
 const values=()=>{const p=Chengchu.parseLocal(Object.values(selected).filter(Boolean).join('，'),r.profile);const s={...r.profile};for(const [k,v] of Object.entries(p.slots))s[k]=v.value;return s;};
 const render=()=>{
  const s=values(),fields=[];
  const add=k=>{if(r.profile[k]===null||r.profile[k]===undefined)fields.push(k)};
  add('need');
  if(s.need&&s.need!=='旅行'){
   add('discomfort');
   if(s.discomfort!==true){
    if(s.need==='果酸'){add('sensitive');if(s.sensitive!==true)add('experience');}
    else {add('skin');if(s.skin==='偏油'){add('sensitive');if(s.sensitive===false)add('fragrance');}}
   }
  }
  if(s.discomfort!==true&&!(s.need==='果酸'&&(s.sensitive===true||s.experience===false)))add('budget');
  activeFields=fields;
  for(const key of Object.keys(selected))if(!fields.includes(key))delete selected[key];
  card.innerHTML='<h3>选好这些，一次查看推荐</h3><p class="muted">点击选项不会发送消息，确认后统一提交。也可以直接在下方输入需求。</p>';
  const grid=document.createElement('div');grid.className='needs-grid';
  for(const key of fields){
   const group=document.createElement('fieldset');group.innerHTML='<legend>'+esc(labels[key])+'</legend>';group.dataset.field=key;
   const choices=document.createElement('div');choices.className='quick';
   for(const answer of options[key]||[]){const b=document.createElement('button');b.type='button';b.textContent=answer;b.setAttribute('aria-pressed',String(selected[key]===answer));b.onclick=()=>{selected[key]=answer;render()};choices.append(b)}
   group.append(choices);
   if(key==='budget'){const input=document.createElement('input');input.type='number';input.min='0';input.max='1000000';input.step='0.01';input.placeholder='或填写预算（元）';input.setAttribute('aria-label','自定义预算');if(selected.budget&&!options.budget.includes(selected.budget))input.value=selected.budget.replace('预算','').replace('元','');input.oninput=()=>{selected.budget=input.value!==''&&input.validity.valid?'预算'+input.value+'元':'';choices.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));};group.append(input);}
   grid.append(group);
  }
  card.append(grid);
  if(s.discomfort===true){const note=document.createElement('p');note.className='warning-panel';note.textContent='当前不适时先暂停挑选护理品，不需要继续填写预算。';card.append(note);}
  const error=document.createElement('p');error.className='card-error';error.setAttribute('role','alert');card.append(error);
  const submit=document.createElement('button');submit.type='button';submit.className='dark card-submit';submit.textContent=s.discomfort===true?'查看注意事项':'查看推荐';submit.onclick=async()=>{
   if(busy)return;
   if(activeFields.some(k=>!selected[k])){error.textContent='请补选卡片中尚未填写的项目。';return;}
   const message=activeFields.map(k=>selected[k]).filter(Boolean).join('，');
   const result=await send(message);
   if(result&&!result.error){card.innerHTML='<p class="muted">需求已提交：'+esc(message)+'</p>';card.classList.add('submitted');}
  };card.append(submit);
 };
 render();return card;
}

function appendMessage(role,text,r){const article=document.createElement('article');article.className='message '+(role==='user'?'user':'assistant');article.innerHTML=(role==='user'?'':'<div class="avatar">澄</div>')+'<div class="message-content"><p>'+esc(text)+'</p></div>';const c=article.querySelector('.message-content');if(r){if(r.questions.length)c.append(clarificationCard(r));const items=r.recommendations.length?r.recommendations:r.comparisons;if(items.length){const cards=document.createElement('div');cards.className='products';cards.innerHTML=items.map(p=>productCard(p,p.reason)).join('');c.append(cards)}if(r.total){const sum=document.createElement('div');sum.className='summarybar'+(r.budgetGap?' warning':'');sum.innerHTML='<b>合计 ¥'+r.total+'</b><span>'+(r.budgetGap?'超出预算 ¥'+r.budgetGap:'手册标价 · 无虚构折扣')+'</span>';c.append(sum)}if(r.alternatives.length){const quick=document.createElement('div');quick.className='quick';for(const a of r.alternatives){const b=document.createElement('button');b.textContent='先选 '+a.id+' · ¥'+a.total;b.onclick=()=>send(a.id==='P101'||a.id==='P102'?'我先只买洁面':'我先只买保湿');quick.append(b)}c.append(quick)}}$('messages').append(article);$('messages').scrollTop=$('messages').scrollHeight;}
function lock(v){busy=v;document.querySelectorAll('button,select').forEach(b=>b.disabled=v||b.dataset.permanentDisabled==='true')}
async function send(text){if(busy||!text.trim())return;lock(true);$('error').hidden=true;const started=performance.now();$('connection').textContent='正在处理需求…';try{let r;if($('mode').value==='rules'){r=Chengchu.run(text,state);r.latencyMs=Math.round(performance.now()-started);}else{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,state,mode:'model'}),signal:AbortSignal.timeout(42000)});const data=await res.json();if(!res.ok)throw Error(data.error||'服务暂时不可用');r=data;}document.querySelectorAll('.needs-card:not(.submitted)').forEach(card=>{card.querySelectorAll('button,input').forEach(b=>{b.disabled=true;b.dataset.permanentDisabled='true'});card.classList.add('submitted')});state=r.profile;latest=r;history.push({input:text,output:r});appendMessage('user',text);appendMessage('assistant',r.reply,r);renderSide(r);$('input').value='';$('connection').textContent=r.engine;return r;}catch(e){$('error').textContent=e.message+' 输入已保留，可重试或明确切换规则演示。';$('error').hidden=false;$('connection').textContent='本次未完成';return {error:e.message};}finally{lock(false)}}
function reset(){state=Chengchu.fresh();history=[];latest=null;$('messages').innerHTML='';appendMessage('assistant','新对话开始了。这次想找什么？');$('profile').innerHTML='<p class="muted">等待新的需求</p>';$('result-panel').innerHTML='';$('trace').textContent='还没有执行记录';$('turn').textContent='尚未开始';$('error').hidden=true;}
$('form').onsubmit=e=>{e.preventDefault();send($('input').value)};$('input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('form').requestSubmit()}};$('reset').onclick=reset;document.querySelectorAll('[data-scenario]').forEach(b=>b.onclick=()=>{reset();send(b.dataset.scenario)});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-view]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-selected',String(x===b))});document.querySelectorAll('.view').forEach(v=>{const active=v.id===b.dataset.view+'-view';v.classList.toggle('active',active);v.hidden=!active});$('page-title').textContent={chat:'一起找到适合你的选择',catalog:'所有商品，信息透明',architecture:'技术设计与现场验收'}[b.dataset.view]});
$('catalog-grid').innerHTML=Chengchu.products.map(p=>productCard(p)).join('');$('export').onclick=()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),version:'2.0',source:'08题 澄初个人护理.pdf p1',engine:latest?.engine||'尚未运行',history},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='澄初导购_v2_自测记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
fetch('/api/status').then(r=>r.json()).then(d=>{if(d.configured){$('mode').value='model';$('connection').textContent=(d.provider||'模型')+'已配置';$('model-state').textContent='服务端已配置模型：'+d.model+'。实际调用结果以对话记录为准。'}else{$('connection').textContent='规则模式可用 · 模型待连接';$('model-state').textContent='尚未配置模型；当前可运行规则演示，真实模型验收待完成。'}if(d.local)$('settings-link').hidden=false}).catch(()=>{$('connection').textContent='离线规则演示';$('model-state').textContent='离线模式，未连接模型服务。'});
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'send_chengchu_message',description:'发送一条咨询并更新导购对话页面',inputSchema:{type:'object',properties:{message:{type:'string',minLength:1,maxLength:3000}},required:['message'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:input=>{if(!input||typeof input.message!=='string')throw Error('message必须是文字');return send(input.message)}})).catch(()=>{});}catch{}}
