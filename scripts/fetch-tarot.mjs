import {mkdir,writeFile,access} from 'node:fs/promises';
import {CARDS} from '../frontend/js/game-engine.js';
const names=['Fool','Magician','High Priestess','Empress','Emperor','Hierophant','Lovers','Chariot','Strength','Hermit','Wheel of Fortune','Justice','Hanged Man','Death','Temperance','Devil','Tower','Star','Moon','Sun','Judgement','World'];
await mkdir('frontend/assets/tarot',{recursive:true});
const sources=[];
for(let i=0;i<names.length;i++){
 const filename=`RWS Tarot ${String(i).padStart(2,'0')} ${names[i]}.jpg`;
 const page='https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(filename.replaceAll(' ','_'));
 const dest=`frontend/assets/tarot/${CARDS[i].id}.jpg`;
 const response=await fetch(page);if(!response.ok)throw Error(page+' '+response.status);
 const html=await response.text();
 const url=html.match(/class="fullImageLink"[^>]*>\s*<a href="([^"]+)"/)?.[1]?.split('?')[0];
 if(!url||!url.startsWith('https://upload.wikimedia.org/')||!html.includes('public domain'))throw Error('Cannot verify image source '+filename);
 try{await access(dest);}catch{let image;for(let attempt=0;attempt<4;attempt++){image=await fetch(url);if(image.ok)break;if(image.status!==429)break;await new Promise(r=>setTimeout(r,15000));}if(!image.ok)throw Error(url+' '+image.status);await writeFile(dest,Buffer.from(await image.arrayBuffer()));await new Promise(r=>setTimeout(r,1800));}
 sources.push({id:CARDS[i].id,file:filename,page,url,credit:'Pamela Colman Smith, Rider–Waite–Smith deck, 1909/1910. Public domain scan via Wikimedia Commons.'});
 console.log('Saved '+CARDS[i].id);
}
await writeFile('frontend/assets/tarot/sources.json',JSON.stringify(sources,null,2)+'\n');
