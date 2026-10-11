import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,ATTRIBUTES,shuffledDeck,cardById,createPractice,submitPractice,advancePractice,compareCards,cardArt} from '../public/game-engine.js';
import {renderPlay,bindPlay} from '../public/game-ui.js';

function random(seed=41){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
test('full 22-card deck has unique IDs and fair, varied integer attributes',()=>{
 assert.equal(CARDS.length,22);assert.equal(new Set(CARDS.map(c=>c.id)).size,22);
 const totals={imagination:0,courage:0,insight:0};
 for(const c of CARDS){let sum=0;for(const attr of Object.keys(totals)){assert.ok(Number.isInteger(c[attr]));assert.ok(c[attr]>=1&&c[attr]<=10);sum+=c[attr];totals[attr]+=c[attr];}assert.equal(sum,18);assert.ok(c.name&&c.description);}
 assert.deepEqual(totals,{imagination:132,courage:132,insight:132});
 assert.ok(new Set(CARDS.map(c=>`${c.imagination},${c.courage},${c.insight}`)).size>15);
 assert.deepEqual(ATTRIBUTES,['imagination','courage','insight','imagination','courage']);
});
test('dealing is without replacement across both hands and shuffle preserves the deck',()=>{
 for(let seed=1;seed<=100;seed++){const rng=random(seed),deck=shuffledDeck(rng),g=createPractice(rng);assert.equal(new Set(deck).size,22);assert.equal(g.hand.length,5);assert.equal(g.botHand.length,5);assert.equal(new Set([...g.hand,...g.botHand]).size,10);assert.ok(g.botHand.includes(g.botCommitted));}
});
test('ties earn half each and a higher attribute earns one',()=>{
 assert.deepEqual(compareCards('lovers','chariot','insight'),{player:.5,bot:.5});
 assert.deepEqual(compareCards('lovers','chariot','imagination'),{player:1,bot:0});
 assert.deepEqual(compareCards('lovers','chariot','courage'),{player:0,bot:1});
 assert.throws(()=>compareCards('missing','sun','insight'));
 assert.throws(()=>compareCards('moon','sun','invalid'));
});
test('a complete five-round duel commits bot selections before moves and preserves scores',()=>{
 const rng=random(),initial=createPractice(rng);let game=initial;
 for(let round=0;round<5;round++){
  const committed=game.botCommitted,card=game.hand.find(id=>!game.history.some(r=>r.playerCard===id));
  assert.equal(game.round,round);assert.equal(game.phase,'select');assert.ok(card);
  game=submitPractice(game,card);
  assert.equal(game.history.at(-1).botCard,committed);assert.equal(game.history.at(-1).attribute,ATTRIBUTES[round]);assert.equal(game.phase,'reveal');
  assert.equal(game.scores.player+game.scores.bot,round+1);
  assert.throws(()=>submitPractice(game,card),/locked/);
  game=advancePractice(game,rng);
  if(round<4)assert.throws(()=>submitPractice(game,card),/unused/);
 }
 assert.equal(game.status,'complete');assert.equal(game.history.length,5);assert.equal(new Set(game.history.map(r=>r.playerCard)).size,5);assert.equal(new Set(game.history.map(r=>r.botCard)).size,5);
 assert.equal(initial.history.length,0,'immutable transitions retain previous state');
 assert.throws(()=>submitPractice(game,game.hand[0]),/locked/);
});
test('round cannot advance without submission and foreign cards cannot be played',()=>{
 const game=createPractice(random());assert.throws(()=>advancePractice(game),/revealed/);
 assert.throws(()=>submitPractice(game,game.botHand[0]),/unused/);
 assert.throws(()=>submitPractice(game,'fabricated-card'),/unused/);
});
test('practice survives JSON persistence including its precommitted bot choice',()=>{
 let game=createPractice(random(13));game=submitPractice(game,game.hand[0]);game=advancePractice(game,random(4));
 const restored=JSON.parse(JSON.stringify(game));assert.deepEqual(restored,game);
 const next=submitPractice(restored,restored.hand[1]);assert.equal(next.history[1].botCard,game.botCommitted);
});
test('every card has distinctive original vector art and visible names',()=>{
 const art=CARDS.map(c=>cardArt(c.id));assert.equal(new Set(art).size,22);
 for(const c of CARDS){const svg=cardArt(c.id);assert.ok(svg.includes('<svg'));assert.ok(svg.includes(c.name.toUpperCase()));assert.ok(svg.includes('role="img"'));assert.ok(!svg.includes('<script'));assert.equal(cardById(c.id),c);}
});
test('practice screen hides all unplayed bot cards and reveals only the committed choice',()=>{
 const game=createPractice(random(19));
 const ctx={state:{me:{id:'me',name:'Morgan'},mode:'demo',gameView:'practice',practice:game,profiles:[]}};
 let html=renderPlay(ctx);
 for(const id of game.botHand)assert.ok(!html.includes(`Original ${cardById(id).name} illustration`));
 for(const id of game.hand)assert.ok(html.includes(`Original ${cardById(id).name} illustration`));
 ctx.state.practice=submitPractice(game,game.hand[0]);html=renderPlay(ctx);
 assert.ok(html.includes(`Original ${cardById(game.botCommitted).name} illustration`));
 for(const id of game.botHand.filter(id=>id!==game.botCommitted))assert.ok(!html.includes(`Original ${cardById(id).name} illustration`));
});
test('server screen renders waiting and safely escapes profile names',()=>{
 const ctx={state:{me:{id:'me',name:'Morgan'},mode:'server',gameView:'match',profiles:[{id:'other',name:'<script>alert(1)</script>'}],activeMatch:{id:'m1',status:'active',participantIds:['me','other'],opponentId:'other',round:0,attribute:'imagination',hand:['sun'],ownSubmitted:true,scores:{me:0,other:0},history:[]}}};
 const html=renderPlay(ctx);assert.ok(html.includes('Your card is locked'));assert.ok(html.includes('Check for their move'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('data-game="lock-server"'));
});

// A small DOM boundary harness exercises actual UI click handlers and API payloads.
function playDOM(initialAction,{id,profileId='chosen-person'}={}){
 const makeButton=(game,buttonId)=>({dataset:{game,...(buttonId?{id:buttonId}:{})},disabled:false,isConnected:true,setAttribute(){},removeAttribute(){}});
 const first=makeButton(initialAction,id),title={textContent:''};let markup='',dialogButtons=[];
 const body={get innerHTML(){return markup;},set innerHTML(html){markup=html;dialogButtons=[...html.matchAll(/data-game="([^"]+)"/g)].map(m=>makeButton(m[1]));}};
 const dialog={open:false,showModal(){this.open=true;},close(){this.open=false;},querySelector(selector){return selector==='#game-dialog-title'?title:selector==='#game-dialog-body'?body:null;},querySelectorAll(){return dialogButtons;}};
 const page={querySelector(selector){if(selector==='#game-dialog')return dialog;if(selector==='#game-invite-person')return markup?'select no longer exists':{value:profileId};return null;},querySelectorAll(){return[first];}};
 return {document:{querySelector:()=>page},first,dialog,get markup(){return markup;},async click(action){const button=action===initialAction?first:dialogButtons.find(b=>b.dataset.game===action);assert.ok(button,`Expected ${action} button`);await button.onclick({currentTarget:button});}};
}
test('first real invitation waits for rule acknowledgement and submits the selected profileId',async t=>{
 const dom=playDOM('send-invite'),previous=globalThis.document;globalThis.document=dom.document;t.after(()=>{globalThis.document=previous;});
 const calls=[],errors=[];const ctx={state:{mode:'server',me:{id:'me'},invitations:[],gameRulesSeen:false},save(){},render(){},toast:message=>errors.push(message),api:async(path,options)=>{calls.push({path,...options});return{invitation:{id:'inv-1',fromId:'me',toId:options.body.profileId,status:'pending'}};}};
 bindPlay(ctx);await dom.click('send-invite');
 assert.equal(calls.length,0,'Sending must wait until the rules are acknowledged');assert.equal(ctx.state.gamePendingInviteToId,'chosen-person');assert.ok(dom.markup.includes('Five cards each.'));assert.equal(ctx.state.gameRulesSeen,false);
 await dom.click('confirm-send-invite');
 assert.deepEqual(calls,[{path:'/api/invitations',method:'POST',body:{profileId:'chosen-person'}}]);assert.equal(ctx.state.gameRulesSeen,true);assert.equal(ctx.state.gamePendingInviteToId,undefined);assert.equal(ctx.state.invitations.length,1);assert.equal(errors.at(-1),'Your invitation is on its way.');
});
test('first acceptance shows rules before accepting and entering the authoritative match',async t=>{
 const dom=playDOM('accept',{id:'incoming-invite'}),previous=globalThis.document;globalThis.document=dom.document;t.after(()=>{globalThis.document=previous;});
 const calls=[],match={id:'real-match',status:'active',participantIds:['other','me'],round:0,hand:['sun'],scores:{other:0,me:0},history:[]};
 const ctx={state:{mode:'server',me:{id:'me'},invitations:[{id:'incoming-invite',fromId:'other',toId:'me',status:'pending'}],matches:[]},save(){},render(){},toast(){},api:async(path,options)=>{calls.push({path,...options});return{invitation:{id:'incoming-invite',status:'accepted'},match};}};
 bindPlay(ctx);await dom.click('accept');assert.equal(calls.length,0);assert.ok(dom.markup.includes('Got it. Accept'));
 await dom.click('confirm-accept');assert.deepEqual(calls,[{path:'/api/invitations/incoming-invite/respond',method:'POST',body:{accept:true}}]);assert.equal(ctx.state.gameRulesSeen,true);assert.equal(ctx.state.gameView,'match');assert.equal(ctx.state.activeMatch,match);assert.equal(ctx.state.gamePendingAcceptId,undefined);
});
test('an acknowledged player sends invitations without another rules step',async t=>{
 const dom=playDOM('send-invite',{profileId:'another-person'}),previous=globalThis.document;globalThis.document=dom.document;t.after(()=>{globalThis.document=previous;});let body;
 const ctx={state:{mode:'server',me:{id:'me'},gameRulesSeen:true,invitations:[]},save(){},render(){},toast(){},api:async(path,options)=>{body=options.body;return{invitation:{id:'inv-2',toId:body.profileId}};}};
 bindPlay(ctx);await dom.click('send-invite');assert.deepEqual(body,{profileId:'another-person'});assert.equal(dom.dialog.open,false);
});
