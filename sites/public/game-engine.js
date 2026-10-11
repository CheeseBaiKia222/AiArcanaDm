/** Parcarna's fictional Arcana Duels. All illustrations are original vector art. */
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
  ['hanged','The Hanged One','XII','An unfamiliar angle can change everything.',7,7,4],
  ['death','Transformation','XIII','Let an ending become the beginning of something.',4,7,7],
  ['temperance','Temperance','XIV','The most interesting things happen in between.',7,4,7],
  ['devil','The Shadow','XV','Notice the patterns; choose what to carry.',9,5,4],
  ['tower','The Tower','XVI','A sudden change makes room for a new shape.',4,9,5],
  ['star','The Star','XVII','Keep a small light for the things you hope to make.',5,4,9],
  ['moon','The Moon','XVIII','Follow a thread of curiosity into the unknown.',8,6,4],
  ['sun','The Sun','XIX','A shared spark becomes a brighter day.',4,8,6],
  ['judgement','Awakening','XX','Listen for the idea asking to be given a voice.',6,4,8],
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
export function createPractice(random=Math.random){
  const deck=shuffledDeck(random);
  const game={id:`practice-${Date.now()}-${Math.floor(random()*1e6)}`,status:'playing',phase:'select',round:0,hand:deck.slice(0,5),botHand:deck.slice(5,10),history:[],scores:{player:0,bot:0},createdAt:new Date().toISOString()};
  game.botCommitted=commitBot(game,random);
  return game;
}
export function submitPractice(game,cardId){
  if(game.status!=='playing'||game.phase!=='select')throw new Error('This round is already locked.');
  if(!game.hand.includes(cardId)||game.history.some(r=>r.playerCard===cardId))throw new Error('Choose an unused card from your hand.');
  const points=compareCards(cardId,game.botCommitted,ATTRIBUTES[game.round]);
  const record={round:game.round,attribute:ATTRIBUTES[game.round],playerCard:cardId,botCard:game.botCommitted,points};
  return {...game,phase:'reveal',scores:{player:game.scores.player+points.player,bot:game.scores.bot+points.bot},history:[...game.history,record]};
}
export function advancePractice(game,random=Math.random){
  if(game.status!=='playing'||game.phase!=='reveal')throw new Error('Both cards must be revealed first.');
  if(game.round===4)return {...game,status:'complete',phase:'results',completedAt:new Date().toISOString()};
  const next={...game,round:game.round+1,phase:'select'};
  next.botCommitted=commitBot(next,random);
  return next;
}
const motifs={
  fool:'<path d="M37 168 84 129 108 150 152 110 183 168Z"/><circle cx="113" cy="83" r="9"/><path d="m111 94-8 30 15 19m-13-29 23 1m-15 8-21 19m17-39 18-11" class="line"/><path d="M132 74v39" class="line"/><circle cx="134" cy="70" r="7"/>',
  magician:'<path d="M54 146h112v11H54zM62 157v29m96-29v29" class="line"/><path d="M78 144v-22q32-24 64 0v22"/><circle cx="110" cy="98" r="16"/><path d="m83 126-19-31m74 30 20-40" class="line"/><path d="m158 84 11-21m-10 8 12 6" class="line"/><path d="M96 63c-19-16-28 14-9 12l23-12c19-16 28 14 9 12Z" class="line"/>',
  priestess:'<path d="M47 69h15v115H47zM158 69h15v115h-15z"/><path d="M75 174q0-74 35-74t35 74Z"/><circle cx="110" cy="87" r="14"/><path d="M107 52a18 18 0 1 0 20 24 19 19 0 0 1-20-24Z"/><path d="M87 135q23 13 46 0m-21-9v34" class="line light"/>',
  empress:'<path d="M109 184V91m0 54q-43 4-43-33 33-2 43 33m0 22q44-3 44-39-36 2-44 39m0-51q34-7 30-35-26 3-30 35" class="line"/><path d="M108 90c-30 1-27-33-11-26-2-24 28-24 26 0 20-5 24 30-15 26Z"/><circle cx="110" cy="73" r="7" class="light-fill"/><path d="M66 185q44-15 88 0" class="line"/>',
  emperor:'<path d="M51 179V91h35v88m48 0V91h35v88M67 89V68h17l10 12 16-22 17 22 10-12h16v21Z"/><path d="M91 181v-54q19-18 38 0v54Z"/><path d="M65 103h6m-6 20h6m78-20h7m-7 20h7" class="line light"/>',
  hierophant:'<path d="M63 177V95q47-72 94 0v82M83 175V99q27-46 54 0v76" class="line"/><path d="M110 103v49m-13-35h26m-13 35-17 15m17-15 17 15" class="line"/><circle cx="110" cy="91" r="8"/><path d="M65 183h90" class="line"/>',
  lovers:'<path d="M65 111c-32-42 9-62 27-28 18-34 59-14 27 28L92 139Z"/><path d="M102 143c-26-36 9-57 26-28 17-29 52-8 26 28l-26 25Z" class="accent"/><path d="M58 175q27-19 47-9m60-98 6-10m1 29 12-2" class="line"/>',
  chariot:'<path d="M62 125h97l-14 35H76Z"/><circle cx="79" cy="169" r="13"/><circle cx="141" cy="169" r="13"/><path d="M109 126V63m0 0 34 16-34 15M51 124l-9-15m18 36H43m120-35 13-12" class="line"/><path d="M88 125V99q22-20 44 0v26" class="line"/>',
  strength:'<path d="M73 170q-34-54 4-94 36-26 68 7 39 55-1 87Z"/><ellipse cx="111" cy="127" rx="27" ry="36" class="light-fill"/><path d="m84 102 6-17 16 17m16 0 17-17 5 25M99 126h3m16 0h3m-14 12 5 4 5-4m-5 5v10m-12 0q12 10 24 0" class="line"/><path d="M91 58c-14-14-25 8-10 10l30-9c14-14 25 8 10 10Z" class="line"/>',
  hermit:'<path d="M73 185q-4-70 37-100 41 30 37 100Z"/><path d="M94 104q16-30 32 0l-16 16Z" class="light-fill"/><path d="M70 112v66m-8-66h16m-16 0V87h16v25m-10-25v-9m82 41v66" class="line"/><circle cx="70" cy="99" r="4" class="accent"/>',
  wheel:'<circle cx="110" cy="124" r="55" class="line"/><circle cx="110" cy="124" r="42" class="line"/><circle cx="110" cy="124" r="12"/><path d="M110 69v43m0 24v43M55 124h43m24 0h43M71 85l30 30m18 18 30 30m0-78-30 30m-18 18-30 30" class="line"/><path d="m109 50 6 10h-12Z"/>',
  justice:'<path d="M110 73v107m-40 0h80m-97-71h114m-112 0v31m-16 0 16-31 17 31m62 0 16-31 17 31m-95 0q-16 29-33 0Zm95 0q-16 29-33 0Z" class="line"/><circle cx="110" cy="66" r="10"/><path d="M100 97h20" class="line"/>',
  hanged:'<path d="M55 69h112m-96 0v115m80-115v115m-41-115v28" class="line"/><path d="m110 94-17 25 32-1-15-24m0 24v29m0-15-21 9m21-9 22 9" class="line"/><circle cx="110" cy="160" r="12"/><circle cx="110" cy="160" r="24" class="line"/>',
  death:'<path d="M110 176V81m-2 48C55 152 44 92 93 98l16 28m3 3c51 23 62-37 15-31l-16 28m-2 9c-40-5-51 44-6 22l7-15m1-7c39-5 50 44 7 22l-8-15" class="line"/><path d="m109 87-10-17m13 17 12-17" class="line"/><circle cx="110" cy="127" r="5"/>',
  temperance:'<path d="m56 98 48-15-17 58q-26 15-31-12ZM117 132l48 15-28 35q-26-1-20-20Z"/><path d="M84 122q45-4 48 32" class="line"/><path d="M91 134q34-6 34 25" class="line"/><circle cx="133" cy="82" r="17" class="line"/><path d="M49 185h126" class="line"/>',
  devil:'<path d="M74 87q3-30 20-30l8 26m43 4q-3-30-20-30l-8 26" class="line"/><path d="M73 83q37-15 74 0l-5 69-32 24-32-24Z"/><path d="M85 112h15m20 0h15m-27 18 7 8-9 5m-10 12h26" class="line light"/><path d="M64 174q-22-18-10-34m100 34q22-18 10-34" class="line"/>',
  tower:'<path d="M73 182V112l18-17 14 10 15-18 27 25v70Z"/><path d="m135 53-28 41h20l-26 36 47-47h-24Z" class="accent"/><path d="M92 132v13m35-13v13m-24 37v-24h17v24" class="line light"/><path d="m59 110-10-6m112 27 14-4m-23 28 16 9" class="line"/>',
  star:'<path d="m110 57 12 37 39 1-31 24 10 37-30-23-31 23 10-37-30-24 39-1Z"/><path d="m60 151 5 12 13 1-11 8 4 12-11-7-10 7 3-12-10-8 13-1Zm100-87 3 8 9 1-7 5 2 8-7-5-7 5 2-8-7-5 9-1Z" class="accent"/><path d="M88 184q22-11 44 0" class="line"/>',
  moon:'<path d="M116 60a47 47 0 1 0 41 69 43 43 0 0 1-41-69Z"/><path d="M55 172q18-11 36 0t36 0 36 0M55 184q18-11 36 0t36 0 36 0" class="line"/><path d="m148 65 3 8 9 1-7 5 2 8-7-5-7 5 2-8-7-5 9-1Z" class="accent"/>',
  sun:'<circle cx="110" cy="115" r="31"/><path d="M110 62V47m0 136v-15m53-53h15M42 115h15m91-38 11-11m-97 97 11-11m75 1 11 11M62 66l11 11m57-10 6-13m-52 122 6-13m68-27 14 6M48 88l14 6m92-7 14-5M52 147l14-7m64 19 6 13M87 66l-6-13" class="line"/><path d="M97 112h2m22 0h2m-23 15q10 8 20 0" class="line light"/>',
  judgement:'<path d="M108 175V93m0 36q-21-10-37 0m37-10q23-13 39-3" class="line"/><path d="m76 95 25-21 33 1 21 19-31 6-14 15-13-15Z"/><path d="M66 66 54 55m56-3V38m45 28 12-11M68 180q42-19 84 0" class="line"/><path d="m82 154 26 21 26-21" class="line"/>',
  world:'<ellipse cx="110" cy="122" rx="49" ry="66" class="line"/><path d="M77 69q-38 52 0 107m66-107q38 52 0 107" class="line"/><path d="M77 89 59 83m11 27-17-1m16 22-17 4m21 16-15 9m85-71 18-6m-11 27 17-1m-16 22 17 4m-21 16 15 9" class="line"/><circle cx="110" cy="100" r="10"/><path d="M110 111v36m0-22-19-10m19 10 19-10m-19 31-15 18m15-18 15 18" class="line"/>',
};
/** Safe to embed: inputs are selected from the fixed card dataset, never user HTML. */
export function cardArt(id){
 const card=cardById(id)||CARDS[0]; const [paper,ink,accent]=card.colors;
 return `<svg class="arcana-art" style="--arcana-paper:${paper};--arcana-accent:${accent}" viewBox="0 0 220 270" role="img" aria-label="Original ${card.name} illustration" xmlns="http://www.w3.org/2000/svg"><style>.arcana-art .line{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.arcana-art .light{stroke:var(--arcana-paper)}.arcana-art .light-fill{fill:var(--arcana-paper)}.arcana-art .accent{fill:var(--arcana-accent)}</style><rect x="1" y="1" width="218" height="268" rx="16" fill="${paper}"/><g color="${ink}" fill="${ink}"><path d="M16 251V108a94 94 0 0 1 188 0v143Z" fill="none" stroke="${ink}" stroke-opacity=".28"/><path d="M24 244V108a86 86 0 0 1 172 0v136Z" fill="none" stroke="${ink}" stroke-opacity=".18"/><text x="110" y="32" text-anchor="middle" font-size="12" font-family="Georgia,serif" letter-spacing="2">${card.symbol}</text><circle cx="40" cy="55" r="1.8"/><circle cx="178" cy="56" r="1.5"/><path d="m36 202 3-7 3 7 7 3-7 3-3 7-3-7-7-3Zm142 7 2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" opacity=".5"/>${motifs[card.id]}<path d="M76 207h68" stroke="${ink}" stroke-opacity=".35"/><text x="110" y="230" text-anchor="middle" font-size="${card.name.length>16?11:13}" font-family="Georgia,serif">${card.name.toUpperCase()}</text><text x="110" y="247" text-anchor="middle" font-size="6.5" letter-spacing="3" font-family="sans-serif" opacity=".65">M O S A I C  ·  A R C A N A</text></g></svg>`;
}
