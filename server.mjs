import http from 'node:http';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chat} from './work/site/runtime.mjs';

const envFile=fileURLToPath(new URL('./.env',import.meta.url));
if(fs.existsSync(envFile))process.loadEnvFile(envFile);

const assets=new Map(['index.html','ui.js','agent.js','knowledge.js','v2.css'].map(name=>['/'+name,fs.readFileSync(fileURLToPath(new URL('./work/site/dist/'+name,import.meta.url)))]));
export function createServer(env=process.env){
 const limits=new Map();
 return http.createServer(async(req,res)=>{
  const reply=(status,body,type='application/json')=>{res.writeHead(status,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:typeof body==='string'||Buffer.isBuffer(body)?body:JSON.stringify(body));};
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/healthz')return reply(200,{ok:true});
   if(url.pathname==='/api/status')return reply(200,{configured:!!(env.DEEPSEEK_API_KEY||(env.ARK_API_KEY&&env.ARK_MODEL)),provider:env.DEEPSEEK_API_KEY?'DeepSeek':'豆包',model:env.DEEPSEEK_API_KEY?(env.DEEPSEEK_MODEL||'deepseek-flash'):(env.ARK_MODEL||null),local:false,version:'2.1'});
   if(url.pathname==='/api/chat'){
    if(req.method!=='POST')return reply(405,{error:'请使用 POST'});
    const origin=req.headers.origin;
    if(origin&&new URL(origin).host!==req.headers.host)return reply(403,{error:'来源不允许'});
    const now=Date.now(),ip=req.socket.remoteAddress||'unknown';
    const rec=limits.get(ip)||{n:0,t:now};if(now-rec.t>60000){rec.n=0;rec.t=now}rec.n++;limits.set(ip,rec);
    if(limits.size>2000)for(const [key,value] of limits)if(now-value.t>60000)limits.delete(key);
    if(rec.n>30)return reply(429,{error:'请求较多，请一分钟后再试。'});
    let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>20000)return reply(413,{error:'内容太长'});}
    const result=await chat(new Request('http://localhost/api/chat',{method:'POST',body:raw}),env);
    return reply(result.status,await result.text());
   }
   if(!['GET','HEAD'].includes(req.method))return reply(405,{error:'方法不允许'});
   const key=url.pathname==='/'?'/index.html':url.pathname;
   if(!assets.has(key))return reply(404,{error:'Not found'});
   return reply(200,assets.get(key),key.endsWith('.html')?'text/html':key.endsWith('.css')?'text/css':'application/javascript');
  }catch{return reply(500,{error:'服务暂时不可用，请稍后重试。'});}
 });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const port=Number(process.env.PORT||10000);
 createServer().listen(port,'0.0.0.0',()=>console.log('Web service listening on 0.0.0.0:'+port));
}
