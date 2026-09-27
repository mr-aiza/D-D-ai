/* Infinite Realms 11: persistent site navigation, independent of game tools. */
'use strict';
(()=>{
  const nav=document.getElementById('nav');
  if(!nav)return;
  const root=document.createElement('div');root.id='ir-site-navigation';
  root.innerHTML=`<button type="button" id="ir-site-trigger" aria-label="باز کردن منوی اصلی سایت" aria-controls="ir-site-drawer" aria-expanded="false"><span aria-hidden="true">☰</span><span>بخش‌ها</span></button>
  <div id="ir-site-shade" hidden></div>
  <aside id="ir-site-drawer" role="dialog" aria-modal="true" aria-labelledby="ir-site-heading" hidden>
    <div class="ir-site-head"><div><strong id="ir-site-heading">⚜ قلمروهای بی‌پایان</strong><small>منوی اصلی سایت</small></div><button type="button" id="ir-site-close" aria-label="بستن منو">✕</button></div>
    <div class="ir-site-links" role="navigation" aria-label="بخش‌های اصلی"></div>
    <p class="ir-site-note">کمپین‌ها و پیشرفت بازی در مرورگر ذخیره می‌شوند. برای برگشت به بازی، «ادامه ماجراجویی» را انتخاب کن.</p>
  </aside>`;
  document.body.append(root);
  const $=s=>root.querySelector(s), trigger=$('#ir-site-trigger'),drawer=$('#ir-site-drawer'),shade=$('#ir-site-shade'),links=$('.ir-site-links');
  const labels={game:'⚔ ادامه ماجراجویی',dashboard:'⌂ داشبورد',generator:'✧ ساخت کمپین جدید',campaigns:'▤ کمپین‌های من',characters:'♙ شخصیت‌های من',dice:'⚄ تاس و قوانین',combat:'⚔ ردیاب مبارزه'};
  let priorFocus=null;
  function close(){drawer.hidden=true;shade.hidden=true;trigger.setAttribute('aria-expanded','false');priorFocus?.focus?.()}
  function open(){priorFocus=document.activeElement;build();drawer.hidden=false;shade.hidden=false;trigger.setAttribute('aria-expanded','true');$('#ir-site-close').focus()}
  function navigate(page){close();const original=nav.querySelector('button[data-page="'+page+'"]');if(original){original.click()}else if(typeof go==='function'){go(page)}else{document.querySelector('[data-go="'+page+'"]')?.click()}}
  function build(){links.replaceChildren();for(const key of ['game','dashboard','generator','campaigns','characters','dice','combat']){const btn=document.createElement('button');btn.type='button';btn.dataset.target=key;btn.textContent=labels[key];const active=document.getElementById(key)?.classList.contains('active');if(active){btn.classList.add('current');btn.setAttribute('aria-current','page')}btn.onclick=()=>navigate(key);links.append(btn)}}
  trigger.onclick=()=>drawer.hidden?open():close();$('#ir-site-close').onclick=close;shade.onclick=close;
  document.addEventListener('keydown',e=>{if(drawer.hidden)return;if(e.key==='Escape')close();if(e.key==='Tab'){const items=[...drawer.querySelectorAll('button:not([disabled])')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
  // Keep the primary navigation available after switching to any page.
  const watch=new MutationObserver(()=>{const gameActive=document.getElementById('game')?.classList.contains('active');trigger.dataset.ingame=String(!!gameActive)});
  watch.observe(document.querySelector('main.main'),{subtree:true,attributes:true,attributeFilter:['class']});
})();
