/** Conversation UI. Demo messages are deliberately browser-local; connected messages use the server. */
let ctx;
let listFilter='all';
let search='';
const drafts=new Map();
export function configureMessages(context){ctx=context;}
const esc=value=>ctx.escape(value??'');
const state=()=>typeof ctx.state==='function'?ctx.state():ctx.state;
const mine=()=>ctx.me().id;
const participants=conversation=>conversation.participants||conversation.participantIds||[];
const otherId=conversation=>participants(conversation).find(id=>id!==mine());
const other=conversation=>ctx.profile(otherId(conversation))||{id:otherId(conversation),name:'Mosaic member',username:'member',bio:'',interests:[]};
const status=conversation=>conversation.status||(conversation.accepted?'accepted':'pending');
const incoming=conversation=>status(conversation)==='pending'&&conversation.requestedBy!==mine();
const getSelected=()=>ctx.getConversationId?.()||null;
const formatTime=value=>new Date(value).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
const formatDay=value=>new Date(value).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
function current(){const all=state().conversations||[];return all.find(c=>c.id===getSelected())||all.find(c=>status(c)==='accepted')||all[0];}
function listItem(conversation,selected){
 const person=other(conversation),last=conversation.messages?.at(-1);
 return `<button type="button" class="conversation-item ${selected===conversation.id?'active':''}" data-chat-select="${esc(conversation.id)}" ${selected===conversation.id?'aria-current="true"':''}>${ctx.avatar(person)}<span><strong>${esc(person.name)}</strong><small>${ctx.blocked(person.id)?'Contact blocked':incoming(conversation)?'Message request':status(conversation)==='rejected'?'Request declined':esc(last?.text||'Say a little hello…')}</small></span>${conversation.unread?'<span class="unread-dot" aria-label="Unread messages"></span>':''}</button>`;
}
function invitationCards(conversation){
 const person=other(conversation),invitations=(state().invitations||[]).filter(i=>(i.fromId===mine()&&i.toId===person.id)||(i.toId===mine()&&i.fromId===person.id));
 return invitations.slice(-4).map(i=>`<div class="request-notice" style="border:1px solid var(--line);border-radius:12px;margin:20px 0"><span class="eyebrow">✧ &nbsp; ARCANA DUELS</span><p style="margin:10px 0 3px">${i.fromId===mine()?'You invited '+esc(person.name):esc(person.name)+' invited you'} to a five-round duel.</p><small class="muted">${i.demo?'Local demo invitation · not delivered':i.status==='pending'?'An open invitation. Play when you are ready.':i.status==='accepted'?'A shared chapter is underway.':i.status==='cancelled'?'This invitation was cancelled.':'This invitation was declined.'}</small><div><button type="button" class="button" data-chat-play ${ctx.blocked(person.id)?'disabled':''}>${i.status==='accepted'?'Open your duel':'View invitations'} ${ctx.icon('arrow')}</button></div></div>`).join('');
}
function chatPanel(conversation){
 if(!conversation)return `<section class="chat-panel"><div class="empty-state" style="margin:auto"><span class="spark">✧</span><h2>A little hello goes a long way.</h2><p>Meet someone through their world, then start a conversation.</p><button type="button" class="button primary" data-chat-discover>Discover people ${ctx.icon('arrow')}</button></div></section>`;
 const person=other(conversation),isBlocked=ctx.blocked(person.id),request=incoming(conversation),outgoing=status(conversation)==='pending'&&!request,declined=status(conversation)==='rejected';
 const messages=conversation.messages||[],canSend=!isBlocked&&!request&&!declined&&(status(conversation)==='accepted'||(outgoing&&messages.length===0));
 let lastDay='';
 const log=messages.map(message=>{const day=formatDay(message.createdAt),dayLine=day!==lastDay?`<div class="chat-date">${esc(day)}</div>`:'';lastDay=day;return `${dayLine}<div class="message ${message.senderId===mine()?'own':''}"><p>${esc(message.text)}</p><small><span class="sr-only">${message.senderId===mine()?'You':esc(person.name)} · </span><time datetime="${esc(message.createdAt)}">${esc(formatTime(message.createdAt))}</time></small></div>`;}).join('');
 return `<section class="chat-panel" aria-label="Conversation with ${esc(person.name)}"><header class="chat-top"><button type="button" class="icon-button mobile-back" data-chat-back aria-label="Back to conversations">${ctx.icon('back')}</button>${ctx.avatar(person)}<button type="button" data-chat-preview="${esc(person.id)}" style="text-align:left"><strong>${esc(person.name)}</strong><small>${person.fictional?'Fictional demo member':'@'+esc(person.username||'member')}</small></button><button type="button" class="icon-button" data-chat-invite="${esc(person.id)}" aria-label="Invite ${esc(person.name)} to play" ${isBlocked?'disabled':''}>${ctx.icon('play')}</button><button type="button" class="icon-button" data-chat-menu="${esc(person.id)}" aria-label="Conversation settings, block or report">${ctx.icon('more')}</button></header>
 ${isBlocked?'<div class="request-notice">You blocked this person. Further messages and game invitations are disabled.</div>':request?`<div class="request-notice"><strong>A little hello from ${esc(person.name)}.</strong><p style="margin-top:7px">Accept this request to continue the conversation. Declining is okay, too.</p><button type="button" class="button primary" data-chat-accept="${esc(conversation.id)}">Accept request</button> <button type="button" class="button" data-chat-reject="${esc(conversation.id)}">Decline</button></div>`:outgoing?`<div class="request-notice">${messages.length?'Your request is waiting for a reply. You can continue after they accept.':'Introduce yourself with one short message. You can continue after they accept.'}</div>`:declined?'<div class="request-notice">This message request was declined. Further messages are disabled.</div>':''}
 <div class="chat-log" id="chat-log" role="log" aria-live="polite" aria-label="Messages">${log||'<div class="empty-state" style="padding:25px"><h2>Your first words belong here.</h2><p>Ask about a project, a shared interest, or something that caught your eye.</p></div>'}${invitationCards(conversation)}</div>
 ${state().mode==='demo'?'<p class="demo-chat-note">Demo conversation · messages stay on this device. No real messages are sent or received.</p>':'<p class="demo-chat-note">Private conversation · visible only to its participants. Refresh to check for new replies.</p>'}
 <form id="chat-compose" class="chat-compose" data-id="${esc(conversation.id)}"><input id="message-text" name="text" type="text" maxlength="4000" required autocomplete="off" aria-label="Write a message" placeholder="${isBlocked?'Contact blocked':request?'Accept the request to reply':outgoing&&messages.length?'Waiting for acceptance…':declined?'Request declined':'A thought, a hello, a little something…'}" value="${esc(drafts.get(conversation.id)||'')}" ${canSend?'':'disabled'}><button class="button primary" type="submit" aria-label="${state().mode==='demo'?'Save demo message':'Send message'}" ${canSend?'':'disabled'}>${ctx.icon('send')}</button></form><p id="chat-error" class="form-error" role="alert" style="margin:0 20px 12px"></p></section>`;
}
export function renderMessages(){
 const all=(state().conversations||[]).filter(c=>participants(c).includes(mine())),selected=current();
 const filtered=all.filter(c=>(listFilter!=='requests'||incoming(c))&&(!search||`${other(c).name} ${other(c).username}`.toLowerCase().includes(search.toLowerCase())));
 const requests=all.filter(incoming).length;
 return `<header class="page-head"><div><span class="eyebrow">GOOD THINGS BEGIN WITH HELLO</span><h1>Little conversations.</h1><p>A place for shared ideas, new friends, and things worth saying.</p></div><div class="head-actions"><button type="button" class="button" data-chat-refresh>${ctx.icon('messages')} Refresh</button><button type="button" class="button primary" data-chat-new>${ctx.icon('plus')} New message</button></div></header>${state().mode==='demo'?'<div class="notice" style="margin-bottom:20px">You’re exploring fictional conversations. Demo messages are saved only in this browser.</div>':''}<div class="message-layout ${!getSelected()?'show-list':''}"><aside class="conversation-list" aria-label="Your conversations"><div style="display:flex;gap:5px;margin:2px 0 9px"><button type="button" class="filter ${listFilter==='all'?'active':''}" data-chat-filter="all">Inbox</button><button type="button" class="filter ${listFilter==='requests'?'active':''}" data-chat-filter="requests">Requests${requests?' · '+requests:''}</button></div><label style="display:block;margin:0 5px 8px"><span class="sr-only">Search conversations</span><input id="chat-search" type="search" placeholder="Find a conversation…" value="${esc(search)}" style="width:100%;border:1px solid var(--line);border-radius:7px;background:transparent;padding:10px;font-size:11px"></label>${filtered.length?filtered.map(c=>listItem(c,selected?.id)).join(''):`<p class="muted" style="font-size:12px;padding:18px 8px;line-height:1.8">${search?'No conversations match that name.':listFilter==='requests'?'No message requests right now.':'A new connection could be just a hello away.'}</p>`}</aside>${chatPanel(selected)}</div>`;
}
async function markRead(conversationId){
 const conversation=(state().conversations||[]).find(c=>c.id===conversationId);if(!conversation)return;
 if(state().mode==='server'){
  const result=await ctx.api(`/api/conversations/${encodeURIComponent(conversationId)}/read`,{method:'POST',body:{}});
  Object.assign(conversation,result.conversation,{participants:result.conversation.participantIds,accepted:result.conversation.status==='accepted',unread:0});
 }else conversation.unread=0;
 for(const n of state().notifications||[])if(n.conversationId===conversationId)n.read=true;
 ctx.save();
}
export async function startMessage(profileId){
 try{
  if(profileId===mine())throw Error('Choose another person to start a conversation.');
  if(ctx.blocked(profileId))throw Error('Unblock this person before starting a conversation.');
  const person=ctx.profile(profileId);if(!person)throw Error('This profile is unavailable.');
  if(person.messagePolicy==='nobody')throw Error('This person isn’t accepting messages right now.');
  let conversation=(state().conversations||[]).find(c=>participants(c).includes(profileId)&&participants(c).includes(mine()));
  if(state().mode==='server'){
   const result=await ctx.api('/api/conversations',{method:'POST',body:{profileId}});conversation=result.conversation;await ctx.refresh();
  }else if(!conversation){
   if(person.messagePolicy==='connections')throw Error('This demo member accepts messages from mutual connections only.');
   conversation={id:crypto.randomUUID(),participants:[mine(),profileId],status:'pending',accepted:false,requestedBy:mine(),unread:0,messages:[]};(state().conversations||=[]).unshift(conversation);ctx.save();
  }
  listFilter='all';search='';await markRead(conversation.id);ctx.navigate('messages',conversation.id);
 }catch(error){ctx.toast(error.message||'This conversation could not be opened.');}
}
export function bindMessages(){
 const page=document.querySelector('#page');if(!page)return;
 const bind=(selector,handler)=>page.querySelectorAll(selector).forEach(button=>{button.onclick=handler;});
 const safely=handler=>async event=>{const b=event.currentTarget;b.disabled=true;try{await handler(event);}catch(error){ctx.toast(error.message||'Something went wrong. Please try again.');}finally{if(b.isConnected)b.disabled=false;}};
 bind('[data-chat-select]',safely(async event=>{const id=event.currentTarget.dataset.chatSelect;await markRead(id);ctx.navigate('messages',id);}));
 bind('[data-chat-back]',()=>{ctx.setConversationId?.(null);ctx.render();});
 bind('[data-chat-filter]',event=>{listFilter=event.currentTarget.dataset.chatFilter;ctx.render();});
 bind('[data-chat-discover]',()=>ctx.navigate('people'));
 bind('[data-chat-refresh]',safely(async()=>{await ctx.refresh();const id=getSelected();if(id)await markRead(id);ctx.render();ctx.toast(state().mode==='demo'?'Your local demo conversations are up to date.':'Conversations refreshed.');}));
 bind('[data-chat-play]',()=>ctx.navigate('play'));
 bind('[data-chat-invite]',event=>{const id=event.currentTarget.dataset.chatInvite;if(ctx.blocked(id))return ctx.toast('Unblock this person to invite them.');ctx.navigate('play',id);});
 bind('[data-chat-menu]',event=>ctx.personMenu(event.currentTarget.dataset.chatMenu));
 bind('[data-chat-preview]',event=>{
  const person=ctx.profile(event.currentTarget.dataset.chatPreview);if(!person)return;
  ctx.openModal(esc(person.name),`<div class="profile-preview">${ctx.avatar(person,'large')}<p style="margin-top:12px">@${esc(person.username)}${person.fictional?' · Fictional demo member':''}</p><p>${esc(person.bio)}</p><div class="tags">${(person.interests||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div>${person.creativeGoal||person.projectGoal?`<p style="margin-top:15px"><strong>Currently dreaming of</strong><br>${esc(person.creativeGoal||person.projectGoal)}</p>`:''}<button type="button" class="button" id="chat-profile-world">Visit their world ${ctx.icon('arrow')}</button></div>`,d=>{d.querySelector('#chat-profile-world').onclick=()=>{ctx.closeModal();ctx.navigate('world',person.id);};});
 });
 bind('[data-chat-new]',()=>{
  const eligible=(state().profiles||[]).filter(p=>p.id!==mine()&&!ctx.blocked(p.id)&&p.messagePolicy!=='nobody');
  ctx.openModal('A new little conversation',`<p>${state().mode==='demo'?'These are fictional demo members. Your message will stay on this device.':'A message request gives someone space to say hello when they’re ready.'}</p>${eligible.length?`<label class="field">Who is on your mind?<select id="new-message-person">${eligible.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} · @${esc(p.username)}</option>`).join('')}</select></label><div class="modal-actions"><button type="button" class="button primary" id="new-message-start">Start a conversation ${ctx.icon('arrow')}</button></div>`:'<p class="muted">No available people yet. Invite a friend to create an account, then refresh People.</p>'}`,d=>{const button=d.querySelector('#new-message-start');if(button)button.onclick=async()=>{const id=d.querySelector('#new-message-person').value;ctx.closeModal();await startMessage(id);};});
 });
 for(const action of ['accept','reject'])bind(`[data-chat-${action}]`,safely(async event=>{
  const id=event.currentTarget.dataset[action==='accept'?'chatAccept':'chatReject'];
  const conversation=state().conversations.find(c=>c.id===id);if(!conversation||!incoming(conversation))throw Error('This request is no longer available.');if(ctx.blocked(otherId(conversation)))throw Error('Unblock this person before accepting contact.');
  await ctx.mutate(`/api/conversations/${encodeURIComponent(id)}/${action}`,{},()=>{conversation.status=action==='accept'?'accepted':'rejected';conversation.accepted=action==='accept';conversation.unread=0;});
  ctx.toast(action==='accept'?(state().mode==='demo'?'Demo request accepted. Messages stay on this device.':'Request accepted. Say a little hello.'):'Message request declined.');
 }));
 const searchInput=page.querySelector('#chat-search');if(searchInput)searchInput.oninput=event=>{search=event.target.value;const position=event.target.selectionStart;ctx.render();const next=document.querySelector('#chat-search');next?.focus();try{next?.setSelectionRange(position,position);}catch{}};
 const input=page.querySelector('#message-text'),form=page.querySelector('#chat-compose');
 if(input&&form){input.oninput=()=>drafts.set(form.dataset.id,input.value);form.onsubmit=async event=>{
  event.preventDefault();const text=input.value.trim(),id=form.dataset.id,conversation=state().conversations.find(c=>c.id===id),error=page.querySelector('#chat-error'),button=form.querySelector('button');
  error.textContent='';if(!text){error.textContent='Write a little something before sending.';return;}if(text.length>4000){error.textContent='Keep your message to 4,000 characters.';return;}if(!conversation||ctx.blocked(otherId(conversation))){error.textContent='Messages are unavailable for this conversation.';return;}
  if(status(conversation)!=='accepted'&&!(status(conversation)==='pending'&&conversation.requestedBy===mine()&&!(conversation.messages||[]).length)){error.textContent='This request must be accepted before you can continue.';return;}
  button.disabled=true;input.disabled=true;try{drafts.delete(id);await ctx.mutate(`/api/conversations/${encodeURIComponent(id)}/messages`,{text},()=>{conversation.messages.push({id:crypto.randomUUID(),senderId:mine(),text,createdAt:new Date().toISOString()});});if(state().mode==='demo')ctx.toast('Saved on this device. No real message was sent.');document.querySelector('#message-text')?.focus();}catch(err){drafts.set(id,text);error.textContent=err.message||'Your message could not be sent. Please try again.';}finally{if(button.isConnected){button.disabled=false;input.disabled=false;}}
 };}
 const log=page.querySelector('#chat-log');if(log)log.scrollTop=log.scrollHeight;
}
