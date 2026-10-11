// Reproducible, original vector illustrations for Mosaic's fictional demo world.
import { writeFileSync } from 'node:fs';
const root = new URL('../frontend/assets/', import.meta.url);
const wrap = (name, w, h, content) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${name}"><title>${name}</title>${content}</svg>`;
const star = (x, y, r, fill) => `<path d="M${x} ${y-r}Q${x} ${y} ${x+r} ${y}Q${x} ${y} ${x} ${y+r}Q${x} ${y} ${x-r} ${y}Q${x} ${y} ${x} ${y-r}" fill="${fill}"/>`;
const specks = (w, h, color = '#463445') => Array.from({ length: 110 }, (_, i) => `<circle cx="${(i * 113 + 31) % w}" cy="${(i * 177 + 27) % h}" r="${i % 3 === 0 ? .8 : .45}" fill="${color}" opacity=".12"/>`).join('');
const files = {};
files['wonder-poster'] = wrap('Make room for wonder — original typographic art', 600, 760, `
  <rect width="600" height="760" fill="#c9bfd5"/><rect x="24" y="24" width="552" height="712" rx="2" fill="none" stroke="#5b3d59" stroke-opacity=".35"/>
  <text x="300" y="79" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" letter-spacing="5" fill="#55394e">THE SMALL WONDERS SERIES</text>
  <g fill="#573d58" font-family="Georgia,serif" font-size="100" text-anchor="middle"><text x="300" y="213">make</text><text x="300" y="309" font-style="italic">room</text><text x="300" y="401">for</text><text x="300" y="501" font-style="italic">wonder.</text></g>
  ${star(300, 597, 44, '#c5784f')}${star(162, 576, 14, '#f9f2df')}${star(432, 603, 22, '#f9f2df')}
  <text x="300" y="700" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" letter-spacing="3" fill="#55394e">NOT EVERYTHING NEEDS A REASON</text>${specks(600,760)}
`);
files['botanical-study'] = wrap('Studies in growing — original botanical print', 600, 820, `
  <rect width="600" height="820" fill="#d9dfc6"/><rect x="35" y="35" width="530" height="750" fill="#e7e8d4"/>
  <text x="70" y="87" font-family="Arial,sans-serif" font-size="12" letter-spacing="3" fill="#59654a">FIELD STUDIES</text><text x="530" y="87" text-anchor="end" font-family="Georgia,serif" font-style="italic" font-size="18" fill="#59654a">no. 04</text>
  <path d="M305 650Q275 430 346 168M285 472Q198 386 160 259M291 561Q405 469 451 343" fill="none" stroke="#5e6f49" stroke-width="5"/>
  <g fill="#7a8d58"><ellipse cx="320" cy="230" rx="28" ry="79" transform="rotate(25 320 230)"/><ellipse cx="268" cy="325" rx="29" ry="72" transform="rotate(-44 268 325)"/><ellipse cx="343" cy="356" rx="29" ry="81" transform="rotate(43 343 356)"/><ellipse cx="242" cy="426" rx="28" ry="76" transform="rotate(-41 242 426)"/><ellipse cx="331" cy="465" rx="28" ry="77" transform="rotate(41 331 465)"/><ellipse cx="395" cy="427" rx="23" ry="66" transform="rotate(33 395 427)"/><ellipse cx="442" cy="367" rx="21" ry="57" transform="rotate(16 442 367)"/><ellipse cx="171" cy="292" rx="23" ry="64" transform="rotate(-28 171 292)"/></g>
  <g fill="none" stroke="#536441" stroke-width="1" opacity=".7"><path d="M297 288L342 170M299 374L236 280M302 414L384 294M271 472L211 367M296 524L369 412M367 479L429 370"/></g>
  <rect x="218" y="650" width="168" height="34" transform="rotate(-6 300 670)" fill="#ccb997" opacity=".62"/>
  <text x="300" y="730" font-family="Georgia,serif" font-size="24" font-style="italic" text-anchor="middle" fill="#59654a">there is no hurry to grow.</text>${specks(600,820)}
`);
files['blue-hour'] = wrap('Songs for the blue hour — original record sleeve concept', 600, 660, `
  <rect width="600" height="660" fill="#727b9f"/><circle cx="440" cy="166" r="94" fill="#e5d6bb"/>
  <path d="M0 360Q120 227 251 347T600 332V660H0Z" fill="#626e92"/><path d="M0 433Q130 330 263 430T600 405V660H0Z" fill="#555978"/><path d="M0 510Q134 429 302 516T600 497V660H0Z" fill="#443f5d"/>
  <g stroke="#dbbdac" opacity=".55">${Array.from({length:33},(_,i)=>`<path d="M${46+i*16} ${315-Math.sin(i*.6)*29}v${40+Math.sin(i*.8)*35}"/>`).join('')}</g>
  <text x="42" y="64" font-family="Arial,sans-serif" font-size="12" letter-spacing="5" fill="#f5e8d8">THEO BROOKS / SOUND STUDIES</text>
  <text x="44" y="555" font-family="Georgia,serif" font-size="47" fill="#f5e8d8">Songs for the</text><text x="44" y="610" font-family="Georgia,serif" font-style="italic" font-size="52" fill="#f5e8d8">blue hour.</text>${specks(600,660,'#fff')}
`);
files['soft-systems'] = wrap('Soft systems — original abstract design study', 600, 680, `
  <rect width="600" height="680" fill="#d4cbe1"/><text x="38" y="58" font-family="Arial,sans-serif" font-size="13" letter-spacing="4" fill="#564769">SOFT SYSTEMS — 001</text>
  <path d="M112 180H305V373H112Z" fill="#a595be"/><circle cx="305" cy="277" r="97" fill="#eae1d8"/><path d="M305 180A97 97 0 0 1 305 374Z" fill="#a28bab"/>
  <rect x="305" y="374" width="193" height="193" fill="#aca9c5"/><path d="M112 470a96 96 0 0 1 192 0v97H112Z" fill="#f0e6c9"/>
  <circle cx="402" cy="470" r="61" fill="#c37566"/><circle cx="402" cy="470" r="30" fill="#d4cbe1"/>
  ${star(484,165,28,'#795c89')}${star(85,397,16,'#795c89')}
  <text x="40" y="640" font-family="Georgia,serif" font-style="italic" font-size="26" fill="#564769">a little less ordinary.</text><text x="560" y="640" text-anchor="end" font-family="Arial,sans-serif" font-size="11" fill="#564769">SORA STUDIO</text>${specks(600,680)}
`);
files['field-notes'] = wrap('The things we almost miss — original prose poster', 600, 780, `
  <rect width="600" height="780" fill="#dfd1b9"/><path d="M51 37L552 46L546 741L40 727Z" fill="#f4ecdb"/>
  <g stroke="#b8b8a1" stroke-width="1" opacity=".48">${Array.from({length:16},(_,i)=>`<path d="M77 ${185+i*30}H522"/>`).join('')}</g>
  <text x="84" y="107" font-family="Arial,sans-serif" font-size="11" letter-spacing="3" fill="#706853">NOTES ON PAYING ATTENTION</text>
  <g font-family="Georgia,serif" fill="#564d3d" font-size="31"><text x="84" y="227">the shadow of a glass.</text><text x="84" y="287">a small dog</text><text x="84" y="327">in a very big coat.</text><text x="84" y="407">someone holding</text><text x="84" y="447">the door</text><text x="84" y="507" font-style="italic">a little longer.</text></g>
  <path d="M89 532Q243 519 386 530" fill="none" stroke="#b99176" stroke-width="2"/><text x="83" y="639" font-family="Georgia,serif" font-size="18" font-style="italic" fill="#857154">the things we almost miss.</text><text x="83" y="684" font-family="Arial,sans-serif" font-size="11" letter-spacing="3" fill="#857154">JULES / FIELD NOTE 03</text>${specks(600,780)}
`);
files['digital-garden'] = wrap('Digital garden — original creative coding concept artwork', 600, 690, `
  <rect width="600" height="690" fill="#c3d3bd"/><rect x="40" y="43" width="520" height="561" rx="12" fill="#e8ead7" stroke="#718575" stroke-width="2"/><path d="M40 91H560" stroke="#718575" stroke-width="2"/>
  <circle cx="66" cy="68" r="6" fill="#c9947b"/><circle cx="87" cy="68" r="6" fill="#d4be7e"/><circle cx="108" cy="68" r="6" fill="#8ea889"/><text x="535" y="73" font-family="monospace" font-size="12" text-anchor="end" fill="#657866">a small world.exe</text>
  <g stroke="#899e7b" stroke-width="2" opacity=".25">${Array.from({length:10},(_,i)=>`<path d="M${66+i*52} 92V604M40 ${124+i*52}H560"/>`).join('')}</g>
  <path d="M143 498V327M288 498V225M442 498V350" stroke="#607c66" stroke-width="7"/>
  <g fill="#92aa7a"><path d="M140 407Q64 408 76 338Q148 337 140 407M146 449Q217 448 211 387Q151 389 146 449M285 399Q209 403 210 329Q279 328 285 399M294 442Q376 439 367 366Q295 371 294 442M440 466Q371 461 380 402Q442 409 440 466"/></g>
  <g fill="#bd8c8f"><circle cx="288" cy="210" r="48"/><circle cx="250" cy="246" r="48"/><circle cx="326" cy="246" r="48"/><circle cx="288" cy="279" r="48"/></g><circle cx="288" cy="246" r="31" fill="#e7c77f"/>
  <g fill="#b19dc4"><circle cx="442" cy="304" r="28"/><circle cx="416" cy="329" r="28"/><circle cx="468" cy="329" r="28"/><circle cx="442" cy="353" r="28"/></g><circle cx="442" cy="329" r="18" fill="#f3e6ba"/>
  <circle cx="143" cy="310" r="35" fill="#cfb975"/><path d="M72 510Q280 482 530 516V555H72Z" fill="#a1b38a"/><text x="300" y="579" text-anchor="middle" font-family="monospace" font-size="11" fill="#657866">concept study · every idea starts somewhere</text>
  <text x="300" y="650" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="28" fill="#536b54">a garden in your browser.</text>${specks(600,690)}
`);
files['moon-garden'] = wrap('A little lunar daydream — original celestial art', 600, 850, `
  <rect width="600" height="850" fill="#9390a8"/><rect x="28" y="28" width="544" height="794" rx="260" fill="none" stroke="#e9dfc5" stroke-width="2"/>
  <path d="M92 653V300a208 208 0 0 1 416 0v353Z" fill="#595a76"/>
  <circle cx="300" cy="264" r="92" fill="#e5dcb8"/><circle cx="335" cy="237" r="89" fill="#595a76"/>
  ${star(178,335,15,'#e5dcb8')}${star(417,379,19,'#e5dcb8')}${star(450,223,9,'#e5dcb8')}${star(215,161,10,'#e5dcb8')}
  <g fill="none" stroke="#abb295" stroke-width="4"><path d="M204 651Q222 465 174 440M394 652Q365 479 423 448M307 653Q311 478 293 431"/></g>
  <g fill="#a0ab91"><ellipse cx="192" cy="531" rx="19" ry="48" transform="rotate(-30 192 531)"/><ellipse cx="232" cy="565" rx="19" ry="44" transform="rotate(31 232 565)"/><ellipse cx="385" cy="566" rx="20" ry="50" transform="rotate(-26 385 566)"/><ellipse cx="422" cy="526" rx="19" ry="47" transform="rotate(34 422 526)"/><ellipse cx="288" cy="558" rx="20" ry="49" transform="rotate(-24 288 558)"/><ellipse cx="327" cy="512" rx="18" ry="44" transform="rotate(29 327 512)"/></g>
  <circle cx="171" cy="441" r="16" fill="#c9a69e"/><circle cx="293" cy="431" r="18" fill="#c9a69e"/><circle cx="422" cy="448" r="14" fill="#c9a69e"/>
  <path d="M93 653Q297 609 508 653V683H93Z" fill="#aaa990"/><text x="300" y="745" text-anchor="middle" font-family="Georgia,serif" font-size="34" font-style="italic" fill="#f3e9d3">a little lunar daydream</text><text x="300" y="785" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" letter-spacing="4" fill="#f3e9d3">SMALL WONDERS / EVELYN PARK</text>${specks(600,850,'#fff')}
`);
files['sun-study'] = wrap('Between sun and shadow — original collage', 600, 670, `
  <rect width="600" height="670" fill="#e4d4bc"/><path d="M44 37L551 46L565 627L35 631Z" fill="#f0e4cc"/>
  <circle cx="404" cy="225" r="111" fill="#cba477"/><path d="M106 485V253a110 110 0 0 1 220 0v232Z" fill="#b78271"/><path d="M157 485V264a58 58 0 0 1 116 0v221Z" fill="#dfc8ac"/>
  <path d="M281 485V439H324V394H367V351H410V307H459V485Z" fill="#9da38c"/><path d="M281 485H492V550H281Z" fill="#b6b7a1"/><path d="M107 485H281V550H107Z" fill="#a16e61"/>
  <path d="M69 565Q300 538 527 565" fill="none" stroke="#84796c"/><text x="300" y="603" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="21" fill="#7c6254">between sun and shadow</text>
  <text x="75" y="92" font-family="Arial,sans-serif" font-size="10" letter-spacing="3" fill="#7c6254">STUDIES IN FORM — AMARA</text>${specks(600,670)}
`);
files['cover-world'] = wrap('A collage of Evelyn’s original small wonders artwork', 1440, 450, `
  <rect width="1440" height="450" fill="#dbd8cc"/><rect x="390" width="555" height="450" fill="#c8c1d6"/>
  <circle cx="1160" cy="168" r="130" fill="#ddc09a"/><path d="M990 450V259a153 153 0 0 1 306 0v191" fill="#9b9d86"/><path d="M1038 450V274a106 106 0 0 1 212 0v176" fill="#d3c5b5"/>
  <g transform="translate(480 20) rotate(-8 160 200)"><rect x="0" y="0" width="290" height="380" fill="#f4ead7"/><text x="145" y="104" text-anchor="middle" font-family="Georgia,serif" font-size="42" fill="#594659">a world</text><text x="145" y="157" text-anchor="middle" font-family="Georgia,serif" font-size="42" font-style="italic" fill="#594659">of little</text><text x="145" y="210" text-anchor="middle" font-family="Georgia,serif" font-size="42" fill="#594659">wonders.</text>${star(145,290,36,'#b48368')}</g>
  <g fill="none" stroke="#748269" stroke-width="6"><path d="M213 450Q190 201 282 62M211 327Q106 251 77 174"/></g>
  <g fill="#8b9a75"><ellipse cx="258" cy="131" rx="35" ry="85" transform="rotate(26 258 131)"/><ellipse cx="186" cy="221" rx="31" ry="78" transform="rotate(-36 186 221)"/><ellipse cx="268" cy="281" rx="31" ry="80" transform="rotate(42 268 281)"/><ellipse cx="175" cy="346" rx="29" ry="72" transform="rotate(-38 175 346)"/><ellipse cx="87" cy="201" rx="27" ry="72" transform="rotate(-25 87 201)"/></g>
  ${star(856,105,34,'#f0e6cb')}${star(891,314,14,'#786788')}${star(1312,67,18,'#f6ebd9')}${specks(1440,450)}
`);

// Symbolic portrait avatars: fictional identities, original artwork, no real people's photographs.
const people = [
  ['evelyn','#c4b8ce','#e0b89d','#4e4147','#6e657e',1], ['mila','#c3cdb4','#d8ab8b','#3e3731','#7e9070',2],
  ['leo','#dcc5b0','#ba8e6f','#493c34','#776960',3], ['sora','#b9b4cb','#e4baa0','#37333d','#79738c',1],
  ['theo','#c7b5a5','#d8b28e','#6b5141','#717b78',3], ['amara','#d3bca0','#925f45','#3f2d29','#a37562',2],
  ['jules','#c9c3ad','#dfb798','#775b43','#999477',3], ['niko','#afc3b8','#bb8e6a','#4f3b31','#637b75',3],
  ['ines','#d4b8b5','#d4a283','#563d33','#9b6e70',1],
];
for (const [id,bg,skin,hair,shirt,style] of people) {
  files[`avatar-${id}`] = wrap(`Original illustrated avatar for fictional demo profile ${id}`, 160, 160, `<rect width="160" height="160" fill="${bg}"/><circle cx="80" cy="60" r="44" fill="${hair}"/>${style===2?`<circle cx="49" cy="39" r="23" fill="${hair}"/><circle cx="104" cy="31" r="26" fill="${hair}"/>`:''}${style===1?`<path d="M37 57H122L127 132H31Z" fill="${hair}"/>`:''}<path d="M11 160Q12 108 61 104H98Q147 109 150 160Z" fill="${shirt}"/><path d="M67 89H93V115Q80 127 67 115Z" fill="${skin}"/><ellipse cx="80" cy="67" rx="31" ry="40" fill="${skin}"/><path d="M47 53Q50 16 82 24Q112 24 113 52Q98 45 87 31Q76 52 47 53Z" fill="${hair}"/><path d="M64 69h6M90 69h6" stroke="#47372f" stroke-width="2" stroke-linecap="round"/><path d="M80 72l-3 11h6M72 91Q80 95 89 90" fill="none" stroke="#9b6c53" stroke-width="1.7" stroke-linecap="round"/>${style===3?'<path d="M51 64H75V80H52ZM85 64H109V80H86ZM75 68H85" fill="none" stroke="#524b46" stroke-width="2.5"/>':''}`);
}
files['fallback'] = wrap('Mosaic artwork placeholder', 600, 700, `<rect width="600" height="700" fill="#e8e0d9"/><circle cx="300" cy="285" r="120" fill="#c5b8ca"/><path d="M160 493V335a140 140 0 0 1 280 0v158Z" fill="#a5b097"/>${star(300,280,65,'#f5edde')}<text x="300" y="585" text-anchor="middle" font-family="Georgia,serif" font-size="31" fill="#65536a">A little inspiration</text>`);
for (const [name, svg] of Object.entries(files)) writeFileSync(new URL(`${name}.svg`, root), svg);
console.log(`Created ${Object.keys(files).length} original SVG assets.`);
