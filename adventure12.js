/* Stage 12 — game-first home and reactive map. No AI inference of position. */
'use strict';(()=>{
const game=document.getElementById('game');if(!game)return;
const $=s=>game.querySelector(s),scene=$('.game-scene'),layout=$('.game-layout');if(!scene||!layout)return;
const top=document.createElement('div');top.className='ir12-top';top.innerHTML='<div><strong>⚜ INFINITE REALMS</strong><small id="ir12-campaign">ماجراجویی تو</small></div><button id="ir12-site" type="button" aria-label="باز کردن بخش‌های سایت">☰ بخش‌ها</button>';layout.before(top);
const world=document.createElement('div');world.className='ir12-world';scene.before(world);world.append(scene);
const mini=document.createElement('button');mini.className='ir12-mini';mini.type='button';mini.setAttribute('aria-label','نمایش اطلس و موقعیت فعلی');mini.innerHTML='<strong>🗺 موقعیت فعلی قهرمان</strong><small id="ir12-realm">قلمرو در حال بارگذاری</small><div class="ir12-map" id="ir12-map" aria-hidden="true"></div><span class="ir12-place" id="ir12-place">⛺ اردوگاه آغازین</span><small>برای بازکردن اطلس کامل لمس کن ←</small>';world.append(mini);
const actions=document.createElement('div');actions.className='ir12-actions';actions.innerHTML='<button type="button" data-tool="context">⚡ اقدام مناسب صحنه</button><button type="button" data-tool="inventory">🎒 کوله‌پشتی</button><button type="button" data-tool="abilities">✨ توانایی‌ها</button><button type="button" data-tool="battle">⚔ نبرد</button>';world.after(actions);
const maps={overworld:'🌍 قلمرو اصلی',underworld:'🕯 اعماق تاریک',wilds:'🌲 جنگل مه‌آلود'};
const campaign=()=>$('#game-campaign')?.value||'';
function getState(){try{return JSON.parse(localStorage.getItem('infinite-realms-stage10')||'{}').campaigns?.[campaign()]||null}catch{return null}}
function getMap(){const state=getState(),id=state?.activeMap||'overworld',m=state?.maps?.[id];return {id,m,state}}
function render(){const {id,m}=getMap();$('#ir12-campaign').textContent=$('#game-campaign')?.selectedOptions?.[0]?.textContent||'یک کمپین انتخاب کن';$('#ir12-realm').textContent=maps[id]||id;
const area=$('#ir12-map');area.replaceChildren();const places=m?.places||[{id:'initial',name:'اردوگاه آغازین',x:50,y:65,known:true}];const here=places.find(p=>p.id===m?.active)||places[0];
for(const p of places){const dot=document.createElement('span');dot.className='ir12-pin'+(p.id===here?.id?' current':'')+(!p.known?' unknown':'');dot.style.left=Math.min(95,Math.max(5,Number(p.x)||50))+'%';dot.style.top=Math.min(95,Math.max(5,Number(p.y)||50))+'%';dot.title=p.known?p.name:'ناشناخته';area.append(dot)}
$('#ir12-place').textContent=here?'📍 '+(here.name||'مکان فعلی'):'📍 موقعیت اولیه؛ اطلس را باز کن';}
function tool(name){const fab=$('#a10-fab');if(!fab)return;fab.click();const btn=$('#a10-content [data-open="'+name+'"]');if(btn)btn.click();else if(name==='map'){const b=$('#a10-content [data-open="map"]');b?.click()}}
mini.onclick=()=>tool('map');actions.onclick=e=>{const b=e.target.closest('[data-tool]');if(b)tool(b.dataset.tool)};
$('#ir12-site').onclick=()=>document.getElementById('ir-site-trigger')?.click();
function syncPage(){document.body.classList.toggle('ir12-playing',game.classList.contains('active'))}
new MutationObserver(syncPage).observe(game,{attributes:true,attributeFilter:['class']});syncPage();
game.addEventListener('ir:state-change',render);window.addEventListener('storage',e=>{if(e.key==='infinite-realms-stage10')render()});$('#game-campaign')?.addEventListener('change',render);$('#game-hero')?.addEventListener('change',render);render();
})();