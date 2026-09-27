export default { async fetch(request,env){
const origin=request.headers.get('Origin')||'';const allowed=env.ALLOWED_ORIGIN||'https://mr-aiza.github.io';const headers={'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','Cache-Control':'no-store'};
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{...headers,'Content-Type':'application/json'}});
if(origin!==allowed)return json({error:'Origin not allowed'},403);if(request.method==='OPTIONS')return new Response(null,{status:204,headers});const path=new URL(request.url).pathname;
if(path==='/api/health'&&request.method==='GET')return json({connected:!!env.GROQ_API_KEY,models:[env.AI_MODEL||'llama-3.3-70b-versatile']});
if(path!=='/api/chat'||request.method!=='POST')return json({error:'Not found'},404);if(!env.GROQ_API_KEY)return json({error:'Missing API key'},503);
if(Number(request.headers.get('Content-Length')||0)>80000)return json({error:'Request too large'},413);
let body;try{body=await request.json()}catch{return json({error:'Invalid JSON'},400)}
if(!Array.isArray(body.messages)||body.messages.length>35||body.messages.some(m=>!m||!['system','user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>14000))return json({error:'Invalid messages'},400);
try{const res=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${env.GROQ_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.AI_MODEL||'llama-3.3-70b-versatile',messages:body.messages,max_tokens:1000,temperature:0.8})});if(!res.ok)return json({error:res.status===429?'AI rate limit reached':'AI provider unavailable'},res.status===429?429:502);const data=await res.json();return json({message:data.choices?.[0]?.message?.content||''})}catch{return json({error:'AI connection failed'},502)}
}};
