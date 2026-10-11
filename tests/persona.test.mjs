import test from 'node:test';
import assert from 'node:assert/strict';
import {createPersona,scoreAnswers,bonusFor,matchReasons} from '../frontend/js/persona.js';
import {createPractice,submitPractice,cardById} from '../frontend/js/game-engine.js';
test('answers determine arcana independently of presentation and reject forged results',()=>{
 for(const [answer,arcana] of [[0,'moon'],[1,'chariot'],[2,'priestess']])for(const presentation of ['nocturne','velvet']){
  const result=createPersona({presentation,answers:Array(6).fill(answer),arcana:'world',amount:999,notes:'Late-night jazz',interests:['Jazz','jazz']});
  assert.equal(result.arcana,arcana);assert.equal(result.amount,undefined);assert.deepEqual(result.interests,['jazz']);
 }
 assert.equal(scoreAnswers([0,1,2,0,1,2]),'priestess');
 for(const answers of [[],[0,0,0,0,0,3],[0,0,0,0,0,'1']])assert.throws(()=>scoreAnswers(answers));
 assert.throws(()=>createPersona({presentation:'other'}));
});
test('bonuses apply to the scoring attribute, practice snapshots persona, and matching is explainable',()=>{
 const persona={arcana:'moon'};const game=createPractice(()=>.4,persona);persona.arcana='chariot';
 assert.equal(game.persona.arcana,'moon');const result=submitPractice(game,game.hand[0]);
 assert.equal(result.history[0].playerValue,cardById(game.hand[0]).imagination+1);
 assert.equal(bonusFor({arcana:'priestess'},'insight'),2);assert.equal(bonusFor({arcana:'moon'},'courage'),0);
 assert.deepEqual(matchReasons({persona:{arcana:'moon'},interests:['Jazz']},{persona:{arcana:'moon'},interests:['jazz']}),['Shared arcana: The Moon','Both into jazz']);
});
