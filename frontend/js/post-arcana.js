// Creative interest labels, separate from the questionnaire's game persona.
export const POST_ARCANA = Object.freeze({
  chariot: {name:'The Chariot', persona:'Hero', theme:'Heroes & adventure', words:['marvel','superhero','superheroes','avengers','hero','heroes','batman','superman','spider-man','spiderman','iron man','comic','comics','courage','sport','sports']},
  moon: {name:'The Moon', persona:'Dreamweaver', theme:'Fantasy & imagination', words:['fantasy','magic','magical','dragon','dragons','dream','dreams','myth','mythology','wizard','cosplay','fiction','sci-fi','science fiction','worldbuilding']},
  magician: {name:'The Magician', persona:'Maker', theme:'Ideas & making', words:['design','art','drawing','illustration','painting','make','making','build','building','coding','code','craft','diy','idea','ideas','photography']},
  empress: {name:'The Empress', persona:'Cultivator', theme:'Nature & care', words:['nature','garden','gardening','plant','plants','flower','flowers','forest','cooking','food','care','wellness','animal','animals']},
  hermit: {name:'The Hermit', persona:'Seeker', theme:'Learning & reflection', words:['learn','learning','book','books','reading','study','research','history','science','philosophy','reflection','journal','journaling']},
  star: {name:'The Star', persona:'Muse', theme:'Music & expression', words:['music','song','songs','concert','singing','dance','dancing','poetry','performance','album','film','cinema','movie','movies']},
  sun: {name:'The Sun', persona:'Connector', theme:'Community & celebration', words:['community','friends','friendship','family','volunteer','volunteering','festival','celebration','birthday','together','meetup']},
  fool: {name:'The Fool', persona:'Explorer', theme:'Discovery & experience', words:['travel','trip','journey','adventure','explore','exploring','experience','hike','hiking','city','road trip','first time']}
});
export function suggestPostArcana(post={}) {
  const text=[post.title,post.caption,...(Array.isArray(post.tags)?post.tags:[])].join(' ').toLowerCase();
  const ranked=Object.entries(POST_ARCANA).map(([id,a])=>({id,score:a.words.reduce((n,word)=>n+(new RegExp('(^|[^a-z0-9])'+word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^a-z0-9])','i').test(text)?1:0),0)})).sort((a,b)=>b.score-a.score);
  return ranked[0].score?ranked[0].id:'fool';
}
export function postArcana(post) { return Object.hasOwn(POST_ARCANA,post?.arcana)?post.arcana:suggestPostArcana(post); }
export function activityAffinities(posts,userId,likes=[],reposts=[],comments=[]) {
  const liked=new Set(likes.map(p=>typeof p==='string'?p:p.postId));
  const shared=new Set(reposts.filter(r=>r.profileId===userId).map(r=>r.postId));
  const commented=new Set(comments.filter(c=>(c.profileId||c.creatorId)===userId).map(c=>c.postId));
  const totals=new Map();
  for(const p of posts){
    const authored=(p.profileId||p.creatorId)===userId;
    const score=Math.min(5,(authored?3:0)+(liked.has(p.id)?1:0)+(shared.has(p.id)?2:0)+(commented.has(p.id)?1:0));
    if(!score)continue;
    const key=postArcana(p),item=totals.get(key)||{arcana:key,score:0,postCount:0};
    item.score+=score;item.postCount++;totals.set(key,item);
  }
  return [...totals.values()].sort((a,b)=>b.score-a.score||a.arcana.localeCompare(b.arcana));
}
