import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { handleApi } from '../backend/api.mjs';
const buckets=new Map();
export function createApp({databasePath}={}){
 const db=new DatabaseSync(databasePath||':memory:');
 db.exec('PRAGMA foreign_keys=ON');
 if(!db.prepare("SELECT name FROM sqlite_master WHERE name='users'").get()){
  for(const file of readdirSync(new URL('../database/migrations/',import.meta.url)).filter(x=>x.endsWith('.sql')).sort())db.exec(readFileSync(new URL('../database/migrations/'+file,import.meta.url),'utf8'));
 }
 const binding={prepare(query){const stmt={args:[],bind(...args){return {...stmt,args}},async first(){return db.prepare(query).get(...this.args)||null},async run(){return this.execute()},async all(){return {results:db.prepare(query).all(...this.args)}},execute(){const s=db.prepare(query);return {results:s.columns().length?s.all(...this.args):(s.run(...this.args),[])}}};return stmt;},async batch(statements){db.exec('BEGIN IMMEDIATE');try{const results=statements.map(s=>s.execute());db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}}};
 const objects=buckets.get(databasePath)||new Map();buckets.set(databasePath,objects);const bucket={async put(key,bytes,meta){objects.set(key,{...meta,arrayBuffer:async()=>bytes})},async get(key){return objects.get(key)}};
 const server=http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://'+req.headers.host);
   if(!/^\/(api|uploads)\//.test(url.pathname)){const file=readFileSync(new URL('../frontend/'+(url.pathname==='/'?'index.html':url.pathname.slice(1)),import.meta.url));res.setHeader('Content-Type',url.pathname.endsWith('.js')?'text/javascript':'text/html');res.end(file);return;}
   let chunks=[];for await(const chunk of req)chunks.push(chunk);
   const request=new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
   const response=await handleApi(request,{DB:binding,BUCKET:bucket});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch(e){console.error(e);res.writeHead(500);res.end(String(e));}
 });
 return {server,db,binding,close:()=>new Promise(resolve=>server.close(()=>{db.close();resolve()}))};
}
