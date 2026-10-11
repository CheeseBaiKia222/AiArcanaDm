import {bonusFor} from './persona.js';
/** Parcarna Arcana Duels; original Rider–Waite–Smith scans credited in assets/tarot/sources.json. */
export const ATTRIBUTES = Object.freeze(['imagination', 'courage', 'insight', 'imagination', 'courage']);
export const ATTRIBUTE_LABELS = Object.freeze({imagination:'Imagination', courage:'Courage', insight:'Insight'});
const definitions = [
  ['fool','The Fool','0','A small step into a world of possibility.',9,6,3],
  ['magician','The Magician','I','Make something extraordinary from what is here.',3,9,6],
  ['priestess','The High Priestess','II','Quiet attention reveals another perspective.',6,3,9],
  ['empress','The Empress','III','Give a new idea the space it needs to grow.',8,7,3],
  ['emperor','The Emperor','IV','A steady foundation for an ambitious dream.',3,8,7],
  ['hierophant','The Hierophant','V','Carry a little wisdom; leave room for questions.',7,3,8],
  ['lovers','The Lovers','VI','Two distinct worlds find a common language.',10,4,4],
  ['chariot','The Chariot','VII','Choose a direction and make your own momentum.',4,10,4],
  ['strength','Strength','VIII','Softness and bravery can share the same space.',4,4,10],
  ['hermit','The Hermit','IX','A little solitude can illuminate the next step.',8,5,5],
  ['wheel','Wheel of Fortune','X','Every turn offers a different point of view.',5,8,5],
  ['justice','Justice','XI','Make room on the scales for another story.',5,5,8],
  ['hanged','The Hanged Man','XII','An unfamiliar angle can change everything.',7,7,4],
  ['death','Death','XIII','Let an ending become the beginning of something.',4,7,7],
  ['temperance','Temperance','XIV','The most interesting things happen in between.',7,4,7],
  ['devil','The Devil','XV','Notice the patterns; choose what to carry.',9,5,4],
  ['tower','The Tower','XVI','A sudden change makes room for a new shape.',4,9,5],
  ['star','The Star','XVII','Keep a small light for the things you hope to make.',5,4,9],
  ['moon','The Moon','XVIII','Follow a thread of curiosity into the unknown.',8,6,4],
  ['sun','The Sun','XIX','A shared spark becomes a brighter day.',4,8,6],
  ['judgement','Judgement','XX','Listen for the idea asking to be given a voice.',6,4,8],
  ['world','The World','XXI','All your many pieces belong in the same picture.',6,6,6],
];
const palettes=[['#e7dded','#463350','#a294b4'],['#eaded6','#5b3942','#bb8268'],['#d8e0d5','#354b42','#8ba486'],['#eee4c9','#655135','#c7a763']];
export const CARDS = Object.freeze(definitions.map(([id,name,symbol,description,imagination,courage,insight],i)=>Object.freeze({id,name,symbol,description,imagination,courage,insight,colors:palettes[i%4]})));
export const cardById = (id) => CARDS.find(card=>card.id===id);
export function shuffledDeck(random=Math.random){
  const cards=CARDS.map(c=>c.id);
  for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return cards;
}
export function compareCards(playerCardId,opponentCardId,attribute){
  const a=cardById(playerCardId),b=cardById(opponentCardId);
  if(!a||!b||!Object.hasOwn(ATTRIBUTE_LABELS,attribute))throw new Error('Choose two valid cards and a scoring attribute.');
  return {player:a[attribute]>b[attribute]?1:a[attribute]===b[attribute]?.5:0,bot:b[attribute]>a[attribute]?1:a[attribute]===b[attribute]?.5:0};
}
function commitBot(game,random){
  const available=game.botHand.filter(id=>!game.history.some(r=>r.botCard===id));
  return available[Math.floor(random()*available.length)];
}
export function createPractice(random=Math.random,persona=null){
  const deck=shuffledDeck(random);
  const game={persona:persona?structuredClone(persona):null,id:`practice-${Date.now()}-${Math.floor(random()*1e6)}`,status:'playing',phase:'select',round:0,hand:deck.slice(0,5),botHand:deck.slice(5,10),history:[],scores:{player:0,bot:0},createdAt:new Date().toISOString()};
  game.botCommitted=commitBot(game,random);
  return game;
}
export function submitPractice(game,cardId){
  if(game.status!=='playing'||game.phase!=='select')throw new Error('This round is already locked.');
  if(!game.hand.includes(cardId)||game.history.some(r=>r.playerCard===cardId))throw new Error('Choose an unused card from your hand.');
  const attribute=ATTRIBUTES[game.round],bonus=bonusFor(game.persona,attribute);
  const playerValue=cardById(cardId)[attribute]+bonus,botValue=cardById(game.botCommitted)[attribute];
  const points={player:playerValue>botValue?1:playerValue===botValue?.5:0,bot:botValue>playerValue?1:playerValue===botValue?.5:0};
  const record={bonus,playerValue,botValue,round:game.round,attribute:ATTRIBUTES[game.round],playerCard:cardId,botCard:game.botCommitted,points};
  return {...game,phase:'reveal',scores:{player:game.scores.player+points.player,bot:game.scores.bot+points.bot},history:[...game.history,record]};
}
export function advancePractice(game,random=Math.random){
  if(game.status!=='playing'||game.phase!=='reveal')throw new Error('Both cards must be revealed first.');
  if(game.round===4)return {...game,status:'complete',phase:'results',completedAt:new Date().toISOString()};
  const next={...game,round:game.round+1,phase:'select'};
  next.botCommitted=commitBot(next,random);
  return next;
}
export function cardArt(id){const c=cardById(id)||CARDS[0];return '<img class="arcana-art rws-card" src="/assets/tarot/'+c.id+'.jpg" alt="'+c.name+' — Rider–Waite–Smith tarot" loading="lazy">';}
