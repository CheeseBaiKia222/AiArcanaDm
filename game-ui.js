import {CARDS,ATTRIBUTES,ATTRIBUTE_LABELS,cardArt,cardById,createPractice,submitPractice,advancePractice} from './game-engine.js';

const e=(value='')=>String(value).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const uid=ctx=>ctx.state.me?.id||ctx.state.me;
const profiles=ctx=>ctx.state.profiles||ctx.profiles||[];
const person=(ctx,id)=>profiles(ctx).find(p=>p.id===id)||{id,name:'A Mosaic member',username:'member'};
const myName=ctx=>ctx.state.me?.name||person(ctx,uid(ctx)).name||'You';
const when=date=>new Date(date).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const attrName=attribute=>ATTRIBUTE_LABELS[attribute]||'Imagination';
const action=(name,label,extra='',style='')=>`<button type="button" class="button ${style}" data-game="${name}" ${extra}>${label}</button>`;
const avatar=(ctx,p)=>ctx.avatar?ctx.avatar(p,36):`<span class="game-avatar">${e((p.name||'?').slice(0,1))}</span>`;
function stats(card,active){return `<div class="arcana-stats">${Object.entries(ATTRIBUTE_LABELS).map(([key,label])=>`<span class="${key===active?'is-scoring':''}" title="${label}"><small>${label}</small><b>${card[key]}</b></span>`).join('')}</div>`;}
function cardView(id,{active,selected=false,played=false,selectable=false}={}){
 const card=cardById(id);if(!card)return '';
 return `<${selectable?'button type="button"':'div'} class="arcana-card ${selected?'selected':''} ${played?'played':''}" ${selectable?`data-game="select" data-card="${card.id}" aria-pressed="${selected}" ${played?'disabled':''}`:''}>${cardArt(id)}<span class="arcana-card-name">${e(card.name)}</span>${stats(card,active)}${played?'<span class="played-label">Played</span>':''}</${selectable?'button':'div'}>`;
}
function rules(){return `<div class="game-rules"><p class="muted">A little strategy. A little imagination. A new way to say hello.</p><ol><li><strong>Five cards each.</strong> Both hands come from one shuffled, 22-card deck. There are no duplicate cards in a duel.</li><li><strong>A new focus each round.</strong> The sequence is Imagination, Courage, Insight, Imagination, Courage. Each focus is announced before you choose.</li><li><strong>Choose, then lock.</strong> Play one unused card. Both choices stay hidden until both players have submitted.</li><li><strong>Higher attribute wins.</strong> Earn one point for the higher value, or half a point each for a tie. Every card’s three attributes total 18.</li><li><strong>Five rounds, one story.</strong> The highest total wins. Equal totals are a draw. Then keep the conversation going, if you like.</li></ol><div class="game-note"><strong>Art, with a playful twist.</strong> Arcana Duels is a fictional strategy game inspired by tarot imagery. Cards do not predict real events. No stakes, purchases, or random paid rewards.</div></div>`;}
function dialogs(ctx){return `<dialog class="game-dialog" id="game-dialog" aria-labelledby="game-dialog-title"><div class="game-dialog-head"><h2 class="serif" id="game-dialog-title">Arcana Duels</h2><button type="button" class="game-close" data-game="close-dialog" aria-label="Close dialog">×</button></div><div id="game-dialog-body"></div></dialog>`;}
function invitationList(ctx){
 const mine=(ctx.state.invitations||[]).filter(i=>(i.fromId===uid(ctx)||i.toId===uid(ctx))&&i.status==='pending');
 const active=(ctx.state.matches||[]).filter(m=>m.status==='active'&&m.participantIds?.includes(uid(ctx)));
 if(!mine.length&&!active.length)return '';
 return `<section class="game-invitations"><div class="section-heading"><h2 class="serif">An open invitation</h2><span class="muted">Take your time. Play when you’re ready.</span></div>${active.map(m=>{const p=person(ctx,m.participantIds.find(id=>id!==uid(ctx)));return `<div class="game-invite-row">${avatar(ctx,p)}<div><strong>Your duel with ${e(p.name)}</strong><p class="muted">Round ${Math.min(m.round+1,5)} · asynchronous play</p></div>${action('open-match','Continue duel',`data-id="${e(m.id)}"`,'primary')}</div>`;}).join('')}${mine.map(i=>{const incoming=i.toId===uid(ctx),p=person(ctx,incoming?i.fromId:i.toId);return `<div class="game-invite-row">${avatar(ctx,p)}<div><strong>${e(p.name)}</strong><p class="muted">${i.demo?'Local demo invitation · no message was sent':incoming?'Invited you to an Arcana duel':'Invitation sent · waiting for a reply'}</p></div>${incoming?action('accept','Accept',`data-id="${e(i.id)}"`,'primary')+action('reject','Decline',`data-id="${e(i.id)}"`):action('cancel-invitation','Cancel invitation',`data-id="${e(i.id)}"`)}</div>`;}).join('')}</section>`;
}
function history(ctx){
 const local=(ctx.state.gameHistory||[]).map(m=>({...m,practice:true}));
 const server=(ctx.state.matches||[]).filter(m=>m.status!=='active'&&m.participantIds?.includes(uid(ctx)));
 const all=[...local,...server].sort((a,b)=>new Date(b.completedAt||b.updatedAt||b.createdAt)-new Date(a.completedAt||a.updatedAt||a.createdAt)).slice(0,8);
 return `<section class="game-history"><div class="section-heading"><h2 class="serif">Your recent chapters</h2><span class="eyebrow">MATCH HISTORY</span></div>${all.length?`<div class="game-history-list">${all.map(g=>{const a=g.practice?g.scores.player:g.scores[uid(ctx)],other=g.practice?'bot':g.participantIds.find(x=>x!==uid(ctx)),b=g.practice?g.scores.bot:g.scores[other];return `<div class="game-history-row"><span class="game-history-symbol">✧</span><div><strong>${g.practice?'Practice with The Muse':`Duel with ${e(person(ctx,other).name)}`}</strong><span class="muted">${when(g.completedAt||g.updatedAt||g.createdAt)} · ${g.status==='abandoned'?'Abandoned':a>b?'You won':a<b?'A chapter to learn from':'A beautifully even match'}</span></div><b>${a} <span class="muted">—</span> ${b}</b>${action(g.practice?'view-history':'open-match','Recap',`data-id="${e(g.id)}"`)}</div>`;}).join('')}</div>`:'<div class="game-empty"><span>✧</span><p>Your first chapter is unwritten.</p><p class="muted">Play a practice duel, then meet someone across the cards.</p></div>'}</section>`;
}
function lobby(ctx){
 const practice=ctx.state.practice;
 return `<div class="play-page"><header class="game-page-title"><div><span class="eyebrow">A LITTLE PLAY. A LITTLE POSSIBILITY.</span><h1 class="serif">Meet me in the cards<span class="game-spark">✧</span></h1><p class="muted">A shared moment can be the start of something lovely.</p></div><div class="game-actions">${ctx.state.mode==='server'?action('refresh-lobby','Refresh invitations'):''}${action('rules','How to play <span aria-hidden="true">↗</span>')}</div></header>
 <section class="arcana-hero"><div class="arcana-hero-copy"><span class="game-pill">✦ &nbsp; MOSAIC ORIGINAL</span><h2 class="serif">Arcana<br><i>Duels.</i></h2><p>Five cards. Five rounds.<br>A little glimpse into another world.</p><div class="game-actions">${action(practice&&practice.status==='playing'?'resume-practice':'start-practice',practice&&practice.status==='playing'?'Continue practice →':'Play a practice duel →','','primary')}${action('invite','Invite someone')}</div><p class="game-fineprint">${ctx.state.mode==='server'?'Asynchronous duels with real members. Practice is always available.':'Demo mode · practice is playable. Invitations to fictional members stay on this device.'}</p></div><div class="arcana-hero-art" aria-label="Three original Arcana cards"><div class="hero-card hero-card-left">${cardArt('moon')}</div><div class="hero-card hero-card-right">${cardArt('sun')}</div><div class="hero-card hero-card-center">${cardArt('star')}</div><span class="handwritten game-art-note">a different kind of connection</span><span class="game-floating-star" aria-hidden="true">✧</span></div></section>
 <div class="game-intro-grid"><div><span class="game-number">01</span><h3>Bring your curiosity</h3><p>Every card has Imagination, Courage, and Insight. Find the right moment for each one.</p></div><div><span class="game-number">02</span><h3>Make your move</h3><p>Pick a card for the round’s focus. Choices are revealed together, so a little surprise stays.</p></div><div><span class="game-number">03</span><h3>Keep the story going</h3><p>Win, lose, or draw: meet a new creative mind. A conversation is always an invitation.</p></div></div>
 ${invitationList(ctx)}<section class="game-collection-teaser"><div><span class="eyebrow">22 WAYS TO SEE THE WORLD</span><h2 class="serif">A cast of small wonders.</h2><p class="muted">Meet the full Arcana collection, from The Fool to The World.</p>${action('collection','Explore the cards <span aria-hidden="true">↗</span>')}</div><div class="game-mini-cards" aria-hidden="true">${['empress','world','magician'].map(id=>`<div>${cardArt(id)}</div>`).join('')}</div></section>${history(ctx)}${dialogs(ctx)}</div>`;
}
function roundTrack(round){return `<div class="game-round-track" aria-label="Round sequence">${ATTRIBUTES.map((a,i)=>`<span class="${i===round?'current':i<round?'finished':''}"><b>${i<round?'✓':i+1}</b><small>${attrName(a)}</small></span>`).join('')}</div>`;}
function practiceView(ctx){
 const game=ctx.state.practice;if(!game)return lobby(ctx);if(game.status==='complete')return results(ctx,game,true);
 const attribute=ATTRIBUTES[game.round],last=game.history.at(-1),reveal=game.phase==='reveal';
 return `<div class="play-page duel-page"><header class="game-page-title"><div><span class="eyebrow">PRACTICE DUEL · THE MUSE IS A BOT</span><h1 class="serif">A meeting of imaginations.</h1></div>${action('lobby','Save & leave')}</header>${roundTrack(game.round)}<div class="duel-scorebar"><div><span class="game-avatar">${e(myName(ctx).slice(0,1))}</span><strong>${e(myName(ctx))}</strong><b>${game.scores.player}</b></div><span class="duel-vs">vs.</span><div><b>${game.scores.bot}</b><strong>The Muse</strong><span class="game-avatar muse-avatar">✧</span></div></div><section class="duel-table" aria-live="polite">${reveal?`<div class="duel-reveal-heading"><span class="eyebrow">ROUND ${game.round+1} · ${attrName(attribute)}</span><h2 class="serif">${last.points.player===.5?'Two worlds, in balance.':last.points.player===1?'A little moment of brilliance.':'The Muse takes this chapter.'}</h2><p class="muted">${last.points.player===.5?'An equal value earns you half a point each.':last.points.player===1?'You earn one point.':'The Muse earns one point.'}</p></div><div class="duel-reveal"><div><p class="eyebrow">YOUR CARD · ${cardById(last.playerCard)[attribute]} ${attrName(attribute)}</p>${cardView(last.playerCard,{active:attribute})}</div><span class="duel-vs">✧</span><div><p class="eyebrow">THE MUSE · ${cardById(last.botCard)[attribute]} ${attrName(attribute)}</p>${cardView(last.botCard,{active:attribute})}</div></div>${action('next-round',game.round===4?'See the final chapter →':'Next round →','','primary')}`:`<span class="eyebrow">ROUND ${game.round+1} OF 5</span><h2 class="serif">Lead with <i>${attrName(attribute).toLowerCase()}.</i></h2><p class="muted">The highest ${attrName(attribute).toLowerCase()} wins this round. Choose one unused card below.</p><div class="opponent-ready"><span aria-hidden="true">✦</span> The Muse has locked a card. Your move.</div>`}</section><section class="duel-hand"><div class="section-heading"><h2 class="serif">Your hand</h2><span class="muted">${5-game.history.length} cards remaining · attributes are always visible</span></div><div class="duel-card-grid">${game.hand.map(id=>cardView(id,{active:attribute,selected:ctx.state.gameSelected===id,played:game.history.some(r=>r.playerCard===id),selectable:!reveal})).join('')}</div>${!reveal?`<div class="duel-lock"><p class="muted">${ctx.state.gameSelected?`${e(cardById(ctx.state.gameSelected)?.name)} · ${cardById(ctx.state.gameSelected)?.[attribute]} ${attrName(attribute)}`:'Choose a card to make your move.'}</p>${action('lock-practice','Lock my card & reveal',`${ctx.state.gameSelected?'':'disabled'}`,'primary')}</div>`:''}</section>${dialogs(ctx)}</div>`;
}
function serverView(ctx){
 const game=ctx.state.activeMatch;if(!game)return lobby(ctx);if(game.status!=='active')return results(ctx,game,false);
 const me=uid(ctx),opponent=person(ctx,game.opponentId||game.participantIds.find(id=>id!==me)),attribute=game.attribute||ATTRIBUTES[game.round];
 return `<div class="play-page duel-page"><header class="game-page-title"><div><span class="eyebrow">ASYNCHRONOUS DUEL · ROUND ${game.round+1} OF 5</span><h1 class="serif">You & ${e(opponent.name)}.</h1><p class="muted">Play at your own pace. Come back to this duel whenever you’re ready.</p></div><div class="game-actions">${action('refresh-match','Refresh',`data-id="${e(game.id)}"`)}${action('lobby','Save & leave')}</div></header>${roundTrack(game.round)}<div class="duel-scorebar"><div>${avatar(ctx,person(ctx,me))}<strong>You</strong><b>${game.scores[me]}</b></div><span class="duel-vs">vs.</span><div><b>${game.scores[opponent.id]}</b><strong>${e(opponent.name)}</strong>${avatar(ctx,opponent)}</div></div><section class="duel-table" aria-live="polite"><span class="eyebrow">THIS ROUND’S FOCUS</span><h2 class="serif">${attrName(attribute)}.</h2><p class="muted">${game.ownSubmitted?'Your card is locked. Both cards will be revealed after the other player submits.':'Choose an unused card. Your opponent’s hand and selection stay private.'}</p>${game.ownSubmitted?`<div class="opponent-ready">✦ &nbsp; Waiting for ${e(opponent.name)} ${action('refresh-match','Check for their move',`data-id="${e(game.id)}"`)}</div>`:''}</section>${!game.ownSubmitted?`<section class="duel-hand"><div class="section-heading"><h2 class="serif">Your hand</h2><span class="muted">${game.hand.length} available cards</span></div><div class="duel-card-grid">${game.hand.map(id=>cardView(id,{active:attribute,selected:ctx.state.gameSelected===id,selectable:true})).join('')}</div><div class="duel-lock"><p class="muted">${ctx.state.gameSelected?e(cardById(ctx.state.gameSelected)?.name):'Choose your card.'}</p>${action('lock-server','Lock my card',`${ctx.state.gameSelected?'':'disabled'}`,'primary')}</div></section>`:''}${roundRecap(ctx,game,false)}<div class="game-abandon">${action('abandon','Leave this duel',`data-id="${e(game.id)}"`)}<p class="muted">Leaving marks this match as abandoned for both players.</p></div>${dialogs(ctx)}</div>`;
}
function roundRecap(ctx,game,practice){
 const me=uid(ctx),other=practice?'bot':game.opponentId||game.participantIds?.find(id=>id!==me);
 if(!game.history?.length)return '';
 return `<section class="game-recap"><h2 class="serif">The story, round by round.</h2><div class="game-recap-table" role="table" aria-label="Round recap"><div class="game-recap-row recap-header" role="row"><span>Round / focus</span><span>Your card</span><span>${practice?'The Muse':'Their card'}</span><span>Points</span></div>${game.history.map((r,i)=>{const a=cardById(practice?r.playerCard:r.cards[me]),b=cardById(practice?r.botCard:r.cards[other]);return `<div class="game-recap-row" role="row"><span><b>${i+1}</b> ${attrName(r.attribute)}</span><span>${e(a?.name)} <b>${a?.[r.attribute]??''}</b></span><span>${e(b?.name)} <b>${b?.[r.attribute]??''}</b></span><span>${practice?r.points.player:r.scores[me]} — ${practice?r.points.bot:r.scores[other]}</span></div>`;}).join('')}</div></section>`;
}
function results(ctx,game,practice){
 const me=uid(ctx),other=practice?'bot':game.opponentId||game.participantIds?.find(id=>id!==me),a=practice?game.scores.player:game.scores[me],b=practice?game.scores.bot:game.scores[other],last=game.history?.at(-1);
 const own=last&&(practice?last.playerCard:last.cards[me]),theirs=last&&(practice?last.botCard:last.cards[other]);
 return `<div class="play-page"><header class="game-page-title"><div><span class="eyebrow">${practice?'PRACTICE WITH THE MUSE':'A SHARED CHAPTER'}</span><h1 class="serif">${game.status==='abandoned'?'Until another time.':a>b?'A little magic, well played.':a===b?'Different cards. Common ground.':'Every ending is a beginning.'}</h1><p class="muted">${game.status==='abandoned'?'This duel was left before the final round.':a>b?'You won this duel. The next chapter is up to you.':a===b?'A draw. Some things are better shared.':`${practice?'The Muse':e(person(ctx,other).name)} won this duel. There’s always another story.`}</p></div>${action('lobby','Back to the lobby')}</header><section class="game-results"><span class="results-star" aria-hidden="true">✧</span><div class="game-final-score"><div><span>You</span><strong>${a}</strong></div><span class="serif">—</span><div><span>${practice?'The Muse':e(person(ctx,other).name)}</span><strong>${b}</strong></div></div>${own&&theirs?`<div class="game-featured-cards"><div><span class="eyebrow">YOUR FINAL CARD</span>${cardView(own)}</div><div><span class="eyebrow">THEIR FINAL CARD</span>${cardView(theirs)}</div></div>`:''}<div class="game-actions">${action(practice?'start-practice':'rematch','Another chapter?',practice?'':`data-id="${e(other)}"`,'primary')}${!practice?action('message','Send a message',`data-id="${e(other)}"`):action('invite','Invite someone real')}</div><div class="conversation-prompt"><span class="eyebrow">AN OPTIONAL CONVERSATION STARTER</span><p class="serif">“What is something you’ve been meaning to create?”</p><span class="muted">Share as much or as little as you like.</span></div></section>${roundRecap(ctx,game,practice)}${dialogs(ctx)}</div>`;
}
export function renderPlay(ctx){
 if(ctx.state.gameView==='practice')return practiceView(ctx);
 if(ctx.state.gameView==='match')return serverView(ctx);
 if(ctx.state.gameView==='history'&&ctx.state.gameHistoryView)return results(ctx,ctx.state.gameHistoryView,true);
 return lobby(ctx);
}

export function bindPlay(ctx){
 const page=document.querySelector('#page');if(!page)return;
 const redraw=()=>{ctx.save();ctx.render();};
 const modal=(title,html)=>{const d=page.querySelector('#game-dialog');d.querySelector('#game-dialog-title').textContent=title;d.querySelector('#game-dialog-body').innerHTML=html;if(!d.open)d.showModal();bindButtons(d);};
 const call=async(path,options)=>ctx.api(path,options);
 const loadMatch=async(id)=>{const result=await call(`/api/matches/${encodeURIComponent(id)}`);ctx.state.activeMatch=result.match;ctx.state.gameView='match';ctx.state.gameSelected=null;const index=(ctx.state.matches||=[]).findIndex(m=>m.id===id);if(index>=0)ctx.state.matches[index]=result.match;else ctx.state.matches.push(result.match);redraw();};
 const inviteModal=(preselect)=>{
  const eligible=profiles(ctx).filter(p=>p.id!==uid(ctx)&&!(ctx.state.blocks||[]).some(b=>(typeof b==='string'?b:b.blockedId||b.targetId)===p.id));
  modal('An invitation to play',`<p class="muted">${ctx.state.mode==='server'?'Invite a member to a five-round duel. They can accept and play when they’re ready.':'These are fictional demo members. A demo invitation is saved on this device; it is not delivered. Register a second account in connected mode to play with someone.'}</p><label class="game-field">Choose a person<select id="game-invite-person">${eligible.map(p=>`<option value="${e(p.id)}" ${p.id===preselect?'selected':''}>${e(p.name)} · @${e(p.username)}</option>`).join('')}</select></label><div class="game-note">No pressure, no timer. Both players choose when to make their next move.</div><div class="game-modal-actions">${action('send-invite',ctx.state.mode==='server'?'Send invitation':'Save demo invitation',eligible.length?'':'disabled','primary')}</div>`);
 };
 const handle=async(event)=>{
  const button=event.currentTarget,name=button.dataset.game,id=button.dataset.id;
  if(button.disabled)return;
  const asyncNames=['send-invite','confirm-send-invite','accept','confirm-accept','reject','cancel-invitation','open-match','refresh-match','refresh-lobby','lock-server','confirm-abandon','rematch'];
  if(asyncNames.includes(name)){button.disabled=true;button.setAttribute('aria-busy','true');}
  try{
   if(name==='close-dialog'){delete ctx.state.gamePendingInviteToId;delete ctx.state.gamePendingAcceptId;page.querySelector('#game-dialog').close();return;}
   if(name==='rules'){modal('A small guide to Arcana Duels',rules());return;}
   if(name==='collection'){modal('The Arcana collection',`<p class="muted">22 original illustrations. Each card totals 18, with a different balance of Imagination, Courage, and Insight.</p><div class="game-full-collection">${CARDS.map(c=>`<div>${cardView(c.id)}<p class="muted">${e(c.description)}</p></div>`).join('')}</div>`);return;}
   if(name==='invite'){inviteModal(ctx.state.inviteProfile);return;}
   if(name==='start-practice'){
    if(!ctx.state.gameRulesSeen){modal('Your first chapter starts here',`${rules()}<div class="game-modal-actions">${action('begin-practice','I’m ready. Deal the cards →','','primary')}</div>`);return;}
    ctx.state.practice=createPractice();ctx.state.gameSelected=null;ctx.state.gameView='practice';redraw();return;
   }
   if(name==='begin-practice'){ctx.state.gameRulesSeen=true;ctx.state.practice=createPractice();ctx.state.gameSelected=null;ctx.state.gameView='practice';redraw();return;}
   if(name==='resume-practice'){ctx.state.gameView='practice';redraw();return;}
   if(name==='lobby'){ctx.state.gameView='lobby';ctx.state.gameSelected=null;redraw();return;}
   if(name==='select'){const selected=button.dataset.card;ctx.state.gameSelected=selected;redraw();document.querySelector(`[data-game="select"][data-card="${selected}"]`)?.focus({preventScroll:true});return;}
   if(name==='lock-practice'){ctx.state.practice=submitPractice(ctx.state.practice,ctx.state.gameSelected);ctx.state.gameSelected=null;redraw();return;}
   if(name==='next-round'){ctx.state.practice=advancePractice(ctx.state.practice);if(ctx.state.practice.status==='complete'){ctx.state.gameHistory||=[];if(!ctx.state.gameHistory.some(g=>g.id===ctx.state.practice.id))ctx.state.gameHistory.unshift(ctx.state.practice);}redraw();return;}
   if(name==='view-history'){ctx.state.gameHistoryView=ctx.state.gameHistory.find(g=>g.id===id);ctx.state.gameView='history';redraw();return;}
   if(name==='send-invite'||name==='confirm-send-invite'||name==='rematch'){
    const toId=name==='confirm-send-invite'?ctx.state.gamePendingInviteToId:name==='rematch'?id:page.querySelector('#game-invite-person').value;
    if(!toId)throw new Error('Choose someone to invite, then try again.');
    if(name==='confirm-send-invite'){ctx.state.gameRulesSeen=true;ctx.save();}
    if(ctx.state.mode==='server'&&!ctx.state.gameRulesSeen){ctx.state.gamePendingInviteToId=toId;modal('Your first shared chapter',`${rules()}<div class="game-modal-actions">${action('confirm-send-invite','Got it. Send my invitation →','','primary')}</div>`);return;}
    if(ctx.state.mode==='server'){const result=await call('/api/invitations',{method:'POST',body:{profileId:toId}});(ctx.state.invitations||=[]).unshift(result.invitation);ctx.toast('Your invitation is on its way.');}
    else {if((ctx.state.invitations||[]).some(i=>i.toId===toId&&i.status==='pending'))throw new Error('You already have a pending demo invitation for this person.');(ctx.state.invitations||=[]).unshift({id:`demo-invite-${Date.now()}`,fromId:uid(ctx),toId,status:'pending',demo:true,createdAt:new Date().toISOString()});ctx.toast('Demo invitation saved. No message was sent.');}
    delete ctx.state.gamePendingInviteToId;ctx.state.gameView='lobby';ctx.state.inviteProfile=null;redraw();return;
   }
   if(name==='cancel-invitation'){
    const invitation=ctx.state.invitations.find(i=>i.id===id);
    if(invitation.demo){invitation.status='cancelled';}else{const result=await call(`/api/invitations/${encodeURIComponent(id)}/respond`,{method:'POST',body:{accept:false}});Object.assign(invitation,result.invitation);}
    ctx.toast('Invitation cancelled.');redraw();return;
   }
   if(name==='accept'||name==='confirm-accept'||name==='reject'){
    const invitationId=name==='confirm-accept'?ctx.state.gamePendingAcceptId:id;
    if(!invitationId)throw new Error('This invitation is no longer available.');
    if(name==='confirm-accept'){ctx.state.gameRulesSeen=true;ctx.save();}
    if(name==='accept'&&!ctx.state.gameRulesSeen){ctx.state.gamePendingAcceptId=invitationId;modal('Your first shared chapter',`${rules()}<div class="game-modal-actions">${action('confirm-accept','Got it. Accept & deal the cards →','','primary')}</div>`);return;}
    const result=await call(`/api/invitations/${encodeURIComponent(invitationId)}/respond`,{method:'POST',body:{accept:name!=='reject'}});
    Object.assign(ctx.state.invitations.find(i=>i.id===invitationId),result.invitation);delete ctx.state.gamePendingAcceptId;
    if(result.match){ctx.state.activeMatch=result.match;ctx.state.gameView='match';(ctx.state.matches||=[]).push(result.match);}else ctx.toast('Invitation declined.');redraw();return;
   }
   if(name==='refresh-lobby'){if(ctx.refresh)await ctx.refresh();ctx.toast('Invitations are up to date.');ctx.render();return;}
   if(name==='open-match'||name==='refresh-match'){await loadMatch(id);return;}
   if(name==='lock-server'){const result=await call(`/api/matches/${encodeURIComponent(ctx.state.activeMatch.id)}/moves`,{method:'POST',body:{cardId:ctx.state.gameSelected}});ctx.state.activeMatch=result.match;ctx.state.gameSelected=null;const index=(ctx.state.matches||[]).findIndex(m=>m.id===result.match.id);if(index>=0)ctx.state.matches[index]=result.match;redraw();return;}
   if(name==='abandon'){modal('Leave this chapter?',`<p>This ends the current duel for both players. Your completed rounds remain in match history.</p><div class="game-modal-actions">${action('close-dialog','Keep playing')}${action('confirm-abandon','Leave duel',`data-id="${e(id)}"`,'primary')}</div>`);return;}
   if(name==='confirm-abandon'){const result=await call(`/api/matches/${encodeURIComponent(id)}/abandon`,{method:'POST',body:{}});ctx.state.activeMatch=result.match;const index=(ctx.state.matches||[]).findIndex(m=>m.id===id);if(index>=0)ctx.state.matches[index]=result.match;redraw();return;}
   if(name==='message'){await ctx.message(id);return;}
  }catch(error){ctx.toast(error.message||'Something went wrong. Please try again.');}
  finally {if(button.isConnected){button.disabled=false;button.removeAttribute('aria-busy');}}
 };
 function bindButtons(root){root.querySelectorAll('[data-game]').forEach(button=>{button.onclick=handle;});}
 bindButtons(page);
 if(ctx.state.inviteProfile){const selected=ctx.state.inviteProfile;ctx.state.inviteProfile=null;inviteModal(selected);}
}
