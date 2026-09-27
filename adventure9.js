
/* Phase 9: compact game view, contextual tools. Existing modules remain untouched. */
'use strict';(()=>{
const game=document.getElementById('game');if(!game)return;
const $=s=>game.querySelector(s), main=$('.game-main'), layout=$('.game-layout');
if(!main||!layout)return;
const head=document.createElement('div');head.className='a9-head';head.innerHTML='<div><strong>⚜ INFINITE REALMS</strong><small id="a9-sub">ماجراجویی در جریان</small></div><div><button type="button" id="a9-hero">♥ قهرمان</button> <button type="button" id="a9-settings">⚙</button></div>';layout.before(head);
const scrim=document.createElement('div');scrim.className='a9-scrim';scrim.hidden=true;
const panel=document.createElement('div');panel.className='a9-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.innerHTML='<div class="a9-panel-head"><h3 id="a9-title">ابزارهای بازی</h3><button id="a9-close" type="button">✕ بستن</button></div><div id="a9-menu" class="a9-menu"></div><div id="a9-content"></div>';
game.append(scrim,panel);
const content=$('#a9-content'),menu=$('#a9-menu'),title=$('#a9-title');
const dock=document.createElement('nav');dock.className='a9-dock';dock.setAttribute('aria-label','منوی بازی');dock.innerHTML='<button type="button" data-a9="story" class="a9-main">✦ داستان</button><button type="button" data-a9="context">⚡ اقدام</button><button type="button" data-a9="dice">⚄ تاس</button><button type="button" data-a9="more">☰ منو</button>';game.append(dock);
const side=$('.game-side'),stage=$('.adv-stage'),setup=$('.a8-setup'),tabs=$('.adv-tabs');
const homes=new Map();[side,stage,setup].filter(Boolean).forEach(node=>{const mark=document.createComment('phase9 original location');node.before(mark);homes.set(node,mark);node.classList.add('a9-tool')});
if(side)side.classList.add('a9-tool');if(stage)stage.classList.add('a9-tool');if(setup)setup.classList.add('a9-tool','a9-setup-wrap');
let previous=null;
function restore(){for(const [node,mark] of homes){mark.after(node);node.classList.remove('a9-open')}content.replaceChildren();menu.replaceChildren()}
function close(){panel.hidden=true;scrim.hidden=true;restore();previous?.focus?.()}
function open(name,node){restore();previous=document.activeElement;title.textContent=name;if(node){content.append(node);node.classList.add('a9-open')}panel.hidden=false;scrim.hidden=false;$('#a9-close').focus()}
function actions(name,items){open(name);for(const [label,fn] of items){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;menu.append(b)}}
function showTab(key){if(!stage)return;open(({map:'🗺 نقشه و مأموریت',battle:'⚔ مبارزه',inventory:'🎒 کوله‌پشتی',dialogue:'♜ گفتگو',journal:'☷ دفتر وقایع',npcs:'♟ شخصیت‌ها',rules:'✧ قوانین و جادو'})[key]||'ابزار بازی',stage);tabs?.querySelector('[data-adv-tab="'+key+'"]')?.click()}
function roll(n){$('[data-roll="'+n+'"]')?.click();actions('⚄ نتیجه تاس',[['D'+n+' ↻',()=>roll(n)],['📣 اعلام به DM',()=>{$('#game-send-roll')?.click();close()}],['بازگشت',close]]);const p=document.createElement('p');p.textContent=$('#game-roll-result')?.textContent||'تاس انداخته شد';content.append(p)}
function dice(){actions('⚄ تاس سرنوشت',[4,6,8,10,12,20].map(n=>['D'+n,()=>roll(n)]))}
function more(){actions('☰ منوی بازی',[
['🗺 نقشه و مأموریت',()=>showTab('map')],['⚔ مبارزه',()=>showTab('battle')],
['🎒 کوله‌پشتی',()=>showTab('inventory')],['♜ گفتگو',()=>showTab('dialogue')],
['♟ شخصیت‌های جهان',()=>showTab('npcs')],['✧ مهارت و جادو',()=>showTab('rules')],
['☷ دفتر وقایع',()=>showTab('journal')],['♥ برگه قهرمان',()=>{if(side)open('♥ برگه قهرمان',side)}],
['⚙ تنظیمات کمپین',()=>{if(setup)open('⚙ تنظیمات',setup)}],
['☁ بازیابی ابری',()=>{close();$('#game-sync')?.click()}],
['↓ پشتیبان بازی',()=>{close();$('#game-export')?.click()}]
])}
function contextual(){const text=[...game.querySelectorAll('#game-story .game-narrator p')].at(-1)?.textContent||'';if(/نبرد|مبارزه|دشمن|حمله|اژدها/i.test(text)){actions('⚔ اقدام در نبرد',[['⚔ میدان نبرد',()=>showTab('battle')],['⚄ تاس D20',()=>roll(20)],['⛨ دفاع',()=>send('در موضع دفاعی قرار می‌گیرم.')],['✧ جادو',()=>showTab('rules')]])}else if(/گفتگو|صحبت|نگهبان|بازرگان|میخانه/i.test(text)){actions('♜ گفتگو',[['گفتگو با شخصیت',()=>showTab('dialogue')],['شخصیت‌های جهان',()=>showTab('npcs')],['بررسی نیت',()=>send('سعی می‌کنم نیت او را تشخیص بدهم.')]])}else if(/سفر|جاده|روستا|نقشه|شهر/i.test(text)){actions('🗺 سفر',[['نقشه',()=>showTab('map')],['بررسی محیط',()=>send('اطراف را بررسی می‌کنم.')],['دفتر وقایع',()=>showTab('journal')]])}else{actions('⚡ اقدام سریع',[['بررسی محیط',()=>send('اطراف را بررسی می‌کنم.')],['گفتگو',()=>showTab('dialogue')],['نقشه',()=>showTab('map')],['تاس D20',()=>roll(20)]])}}
function send(text){close();const input=$('#game-input');if(input){input.value=text;$('#game-form')?.requestSubmit()}}
dock.onclick=e=>{const b=e.target.closest('[data-a9]');if(!b)return;const n=b.dataset.a9;if(n==='story'){close();$('#game-story')?.scrollIntoView({behavior:'smooth',block:'start'})}if(n==='context')contextual();if(n==='dice')dice();if(n==='more')more()};
$('#a9-hero').onclick=()=>side&&open('♥ قهرمان و تاس',side);$('#a9-settings').onclick=()=>setup&&open('⚙ کمپین و قهرمان',setup);
$('#a9-close').onclick=close;scrim.onclick=close;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()});
const status=$('#a9-sub');const update=()=>{const c=$('#game-campaign')?.selectedOptions?.[0]?.textContent||'';status.textContent=c||'ماجراجویی در جریان'};
$('#game-campaign')?.addEventListener('change',update);update();
})();
