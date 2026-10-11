import {POST_ARCANA,postArcana} from './post-arcana.js';

export function arcanaBadge(post,escape) {
  const key=postArcana(post),a=POST_ARCANA[key];
  return `<span class="post-arcana" title="${escape(a.theme)}"><img src="/assets/tarot/${key}.jpg" alt="" loading="lazy"><span>${a.name} · ${a.persona}</span></span>`;
}
export function mediaHTML(post,{escape,safeURL},detail=false) {
  const image=safeURL(post.image,true),video=safeURL(post.video,true);
  if(video)return `<div class="post-video"><video ${detail?'controls':'muted'} playsinline preload="metadata" ${image?`poster="${escape(image)}"`:''} src="${escape(video)}" aria-label="${escape(post.title)}"><a href="${escape(video)}">Open video</a></video>${detail?'':'<span class="video-label" aria-hidden="true">▶ VIDEO</span>'}</div>`;
  if(image)return `<img src="${escape(image)}" alt="${escape(post.title)}" loading="lazy" decoding="async">`;
  return `<div class="reflection-card"><span class="eyebrow">${escape(post.kind||'IDEA')}</span><p class="serif">${escape(detail?post.caption:(post.caption||post.title).slice(0,140))}</p></div>`;
}
export function activityHTML(affinities,escape) {
  return `<div class="activity-signals"><span class="eyebrow">FROM YOUR ACTIVITY</span>${affinities?.length?`<div class="pill-row">${affinities.slice(0,3).map(item=>{const a=POST_ARCANA[item.arcana];return `<span class="chip" title="${escape(a.name)} · ${item.postCount} distinct ${item.postCount===1?'post':'posts'}">${a.persona} · ${a.name}</span>`;}).join('')}</div><p>Interest signals from your posts, reposts, likes, and comments. Your questionnaire arcana and game bonuses stay the same.</p>`:'<p>Share or interact with a post to discover another side of your interests.</p>'}</div>`;
}
