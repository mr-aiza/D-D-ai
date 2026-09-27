export default { async fetch(request,env){
const origin=request.headers.get('Origin')||'';const allowed=env.ALLOWED_ORIGIN||'https://mr-aiza.github.io';const headers={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Vary':'Origin','Cache-Control':'no-store'};
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{...headers,'Content-Type':'application/json'}});
if(origin!==allowed)return json({error:'Origin not allowed'},403);if(request.method==='OPTIONS')return new Response(null,{status:204,headers});const path=new URL(request.url).pathname;
if(path==='/api/health'&&request.method==='GET')return json({connected:!!env.GROQ_API_KEY,models:[env.AI_MODEL||'llama-3.3-70b-versatile']});
if(path==='/api/game/state'&&(request.method==='GET'||request.method==='POST')){
 if(!env.DB)return json({error:'D1 database binding missing'},503);
 const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
 if(!/^[0-9a-f]{64}$/.test(token))return json({error:'Invalid game token'},401);
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 const player=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
 let campaignId,state;
 if(request.method==='GET')campaignId=new URL(request.url).searchParams.get('campaignId');
 else {if(Number(request.headers.get('Content-Length')||0)>100000)return json({error:'State too large'},413);
   try{const body=await request.json();campaignId=body.campaignId;state=body.state}catch{return json({error:'Invalid JSON'},400)}}
 if(typeof campaignId!=='string'||campaignId.length>120||!campaignId)return json({error:'Invalid campaign'},400);
 if(request.method==='GET'){
   const row=await env.DB.prepare('SELECT state FROM game_saves WHERE player=? AND campaign=?').bind(player,campaignId).first();
   return json({state:row?JSON.parse(row.state):null});
 }
 if(!state||typeof state!=='object'||Array.isArray(state)||!Array.isArray(state.messages)||state.messages.length>60||
 state.messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>15000)||JSON.stringify(state).length>95000)return json({error:'Invalid state'},400);
 await env.DB.prepare('INSERT INTO game_saves(player,campaign,state,updated_at) VALUES(?,?,?,?) ON CONFLICT(player,campaign) DO UPDATE SET state=excluded.state,updated_at=excluded.updated_at').bind(player,campaignId,JSON.stringify(state),Date.now()).run();
 return json({saved:true});
}
if(path!=='/api/chat'||request.method!=='POST')return json({error:'Not found'},404);if(!env.GROQ_API_KEY)return json({error:'Missing API key'},503);
if(Number(request.headers.get('Content-Length')||0)>80000)return json({error:'Request too large'},413);
let body;try{body=await request.json()}catch{return json({error:'Invalid JSON'},400)}
if(!Array.isArray(body.messages)||body.messages.length>35||body.messages.some(m=>!m||!['system','user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>14000))return json({error:'Invalid messages'},400);
try{const res=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${env.GROQ_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.AI_MODEL||'llama-3.3-70b-versatile',messages:body.messages,max_tokens:1000,temperature:0.8})});if(!res.ok)return json({error:res.status===429?'AI rate limit reached':'AI provider unavailable'},res.status===429?429:502);const data=await res.json();return json({message:data.choices?.[0]?.message?.content||''})}catch{return json({error:'AI connection failed'},502)}
}};