/* Infinite Realms 15: unified player entry, explicit navigation, reactive location and status. */
'use strict';(()=>{
 const game=document.getElementById('game');if(!game)return;
 const $=s=>game.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const root=document.createElement('section');root.className='ir15-shell';root.setAttribute('aria-label','مرکز فرمان ماجراجویی');
 root.innerHTML=`<div class="ir15-bar"><div class="ir15-brand"><span>✦</span><div><strong>INFINITE REALMS</strong><small>ماجراجویی تو، تصمیم تو</small></div></div><button type="button" id="ir15-site" aria-label="بازکردن صفحات اصلی">☰ <span>بخش‌ها</span></button></div>
 <div class="ir15-status"><div><small>کمپین فعال</small><strong id="ir15-campaign">—</strong></div><div><small>قهرمان</small><strong id="ir15-hero">—</strong></div><div><small>سلامت</small><strong id="ir15-hp">—</strong></div><div><small>مکان فعلی</small><strong id="ir15-location">—</strong></div></div>
 <div class="ir15-guide" id="ir15-guide" hidden><strong id="ir15-guide-title">ماجراجویی را شروع کن</strong><p id="ir15-guide-desc"></p><button type="button" id="ir15-guide-action">شروع</button></div>
 <div class="ir15-shortcuts"><button type="button" data-ir15-tool="map">🗺 نقشه</button><button type="button" data-ir15-tool="inventory">🎒 کوله</button><button type="button" data-ir15-tool="abilities">✨ توانایی</button><button type="button" data-ir15-tool="battle">⚔ مبارزه</button><button type="button" data-ir15-tool="pending">✦ رویدادها <span id="ir15-pending"></span></button></div>`;
 game.prepend(root);
 const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
 const campaign=()=>$('#game-campaign')?.value||'';const hero=()=>$('#game-hero')?.value||'';
 function navigate(id){const b=document.querySelector('#ir-site-drawer [data-page="'+id+'"]');if(b){document.getElementById('ir-site-trigger')?.click();b.click();return}const base=document.querySelector('#nav [data-page="'+id+'"]');base?.click();if(!base&&typeof window.go==='function')window.go(id)}
 function openTool(name){const sheet=$('#a10-sheet'),fab=$('#a10-fab');if(!fab)return;if(sheet&&!sheet.hidden)$('#a10-close')?.click();fab.click();$('#a10-content [data-open="'+name+'"]')?.click()}
 $('#ir15-site').onclick=()=>{const btn=document.getElementById('ir-site-trigger');if(btn)btn.click();else navigate('dashboard')};
 root.addEventListener('click',e=>{const b=e.target.closest('[data-ir15-tool]');if(b)openTool(b.dataset.ir15Tool)});
 function render(){const cid=campaign(),hid=hero(),db=read('infinite-realms-db'),rpg=read('infinite-realms-stage10').campaigns?.[cid],story=read('infinite-realms-game-v1').states?.[cid],rules=read('infinite-realms-adventure7'),h=rules[cid+'::'+hid]||rules[cid];const active=rpg?.maps?.[rpg.activeMap||'overworld'],place=active?.places?.find(x=>x.id===active.active),c=db.campaigns?.find(x=>x.id===cid),character=db.characters?.find(x=>x.id===hid);
 $('#ir15-campaign').textContent=c?.title||$('#game-campaign')?.selectedOptions?.[0]?.textContent||'انتخاب نشده';$('#ir15-hero').textContent=character?.name||$('#game-hero')?.selectedOptions?.[0]?.textContent||'انتخاب نشده';$('#ir15-hp').textContent=h?`${h.hp} / ${h.max}`:'—';$('#ir15-location').textContent=place?.name||'اردوگاه آغازین';const pending=(rpg?.pending||[]).filter(x=>x.heroId===hid).length;$('#ir15-pending').textContent=pending?'('+pending+')':'';
 const guide=$('#ir15-guide');let step=null;if(!db.campaigns?.length)step=['کمپین بساز','داستان و دنیای بازی را در سناریوساز بساز.','ساخت کمپین','generator'];else if(!db.characters?.length)step=['قهرمان بساز','کلاس و ویژگی‌های شخصیت خودت را انتخاب کن.','ساخت شخصیت','characters'];else if(!story?.messages?.length)step=['آماده ورود به داستانی؟','کمپین و قهرمان را انتخاب کن، سپس ماجراجویی را آغاز کن.','شروع ماجراجویی','begin'];guide.hidden=!step;if(step){$('#ir15-guide-title').textContent=step[0];$('#ir15-guide-desc').textContent=step[1];$('#ir15-guide-action').textContent=step[2];$('#ir15-guide-action').onclick=()=>step[3]==='begin'?$('#game-begin')?.click():navigate(step[3])}
 }
 $('#game-campaign')?.addEventListener('change',render);$('#game-hero')?.addEventListener('change',render);game.addEventListener('ir:state-change',render);window.addEventListener('ir:cloud-restored',render);window.addEventListener('storage',render);const story=$('#game-story');if(story)new MutationObserver(render).observe(story,{childList:true});render();
 // Older modules can update localStorage without dispatching a state event; refresh on focus.
 window.addEventListener('focus',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
})();
