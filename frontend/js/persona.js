export const PERSONAS = Object.freeze({
  nocturne: {name:'Nocturne', presentation:'Male presentation', image:'/assets/persona-nocturne.svg', position:'left', words:'A visual starting point, shaped by you.'},
  velvet: {name:'Velvet', presentation:'Female presentation', image:'/assets/persona-velvet.svg', position:'right', words:'A visual starting point, shaped by you.'}
});
export const ARCANA = Object.freeze({
  moon:{name:'The Moon', attribute:'imagination', amount:1, trait:'Imaginative', description:'You chose atmosphere, possibility, and room to experiment.', bonus:'+1 Imagination in rounds 1 and 4'},
  chariot:{name:'The Chariot', attribute:'courage', amount:1, trait:'Adventurous', description:'You chose movement, initiative, and trying something new.', bonus:'+1 Courage in rounds 2 and 5'},
  priestess:{name:'The High Priestess', attribute:'insight', amount:2, trait:'Observant', description:'You chose listening, detail, and time to understand.', bonus:'+2 Insight in round 3'}
});
export const QUESTIONS = [
  {title:'You have a free afternoon. Where do you begin?', options:['Make something from a new idea','Try an activity I have never done','Read, observe, and take things in']},
  {title:'What stays on your mind?', options:['An idea I want to make real','Planning somewhere new to go','A conversation I am still thinking about']},
  {title:'When something is unfamiliar, you…', options:['Imagine the possibilities','Give it a try and learn as I go','Look closer before deciding']},
  {title:'In a new group, how do you connect?', options:['Share a song or something I made','Introduce myself','Ask a question and listen']},
  {title:'What would you bring to a group project?', options:['A different way to see it','The push to get it started','The detail everyone missed']},
  {title:'Choose a moment you would revisit.', options:['Making something with no plan','Getting lost in a new city','A conversation that changed my perspective']}
];
const keys=Object.keys(ARCANA);
export function scoreAnswers(answers){
  if(!Array.isArray(answers)||answers.length!==QUESTIONS.length||answers.some(a=>!Number.isInteger(a)||a<0||a>2))throw Error('Answer all six questions.');
  const totals=[0,0,0];answers.forEach(a=>totals[a]++);
  const max=Math.max(...totals);
  // The latest answer among tied categories is the explicit tie-breaker.
  return keys[[...answers].reverse().find(a=>totals[a]===max)];
}
export function createPersona(input){
  if(!input||!Object.hasOwn(PERSONAS,input.presentation))throw Error('Choose Nocturne or Velvet.');
  const arcana=scoreAnswers(input.answers);
  if(typeof input.notes!=='string'||input.notes.trim().length>400)throw Error('Keep your profile description under 400 characters.');
  if(!Array.isArray(input.interests)||input.interests.length<1||input.interests.length>8||input.interests.some(t=>typeof t!=='string'||!t.trim()||t.trim().length>40))throw Error('Add 1–8 interests, up to 40 characters each.');
  return {version:1,presentation:input.presentation,arcana,answers:[...input.answers],notes:input.notes.trim(),interests:[...new Set(input.interests.map(t=>t.trim().toLowerCase()))]};
}
export function bonusFor(persona,attribute){const a=ARCANA[persona?.arcana];return a?.attribute===attribute?a.amount:0;}
export function matchReasons(a,b){
  const reasons=[];
  if(a?.persona?.arcana&&a.persona.arcana===b?.persona?.arcana)reasons.push('Shared arcana: '+ARCANA[a.persona.arcana].name);
  const own=new Set((a?.interests||[]).map(t=>t.toLowerCase()));
  const shared=(b?.interests||[]).filter(t=>own.has(t.toLowerCase()));
  if(shared.length)reasons.push('Both into '+shared.slice(0,3).join(', '));
  return reasons;
}
