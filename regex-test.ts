
const terms = [
    // general
    'ttrpg',
    'tabletop rpg',
    'tabletop roleplaying',
    'tabletop game',
    'tabletop gaming',
    'game master',
    'dungeon master',
    'character art',
  
    // shows
    'critical role',
    'dimension 20',
    'dungeons and daddies',
    'dungeons & daddies',
    'glass cannon pod',
    'the adventure zone',
    'not another d&d pod',
    'nadp pod',
  
    // publishers
    'free league',
    'wotc',
    'wizards of the coast',
    'paizo',
    'limithron',
  
    // creators
    'bob the world builder',
    'matt(hew)? colville',
    'mcdm',
    'ginny di',
    'dungeon dudes',
    'pointy hat',
    'jp coovert',
    'the dm lair',
    'bonus action',
    'map crow',
    'arcane anthems',
    'griffon\'?s saddlebag',
    
    // D&D
    'dungeons and dragons',
    'dungeons & dragons',
    'd&d',
    'dnd',
    'd&d beyond',
    'dndbeyond',
    'dnd beyond',
    
    // paizo
    'pathfinder',
    
    // Free League
    'mork borg',
    'pirate borg',
    'death in space',
    'the one ring',
    'vast grimm',
    'cy borg',
    'cy_borg',
    'mutant year zero',
    'tales from the loop',
    'vaesen',
    'r\.? talsorian',
    
    // other games
    'warhammer',
    'mutant:? year zero',
    'alien rpg',
    'fate system',
    'gurps',
    'cyberpunk red',
    'blades in the dark',
    'urban shadows',
    'symbaroum',
    'shadowdark',
    'call of cthulhu',
    'dish pit witches',
    'liminal horror',
    'into the cess & citadel',
    'into the wyrd & wild',
    'thirsty swords lesbians',
    'quest rpg',
    'coyote & crow',
    'coyote and crow',
    'troika',
    'mothership rpg',
    'mother lands rpg',
    'witcher rpg',
    'powered by the apocalypse',
    'pbta',
    'forged in the dark',
  
    // looser terms
    'worldbuilding',
    'worldanvil',
    'role20',
    'foundry vtt',
    'alchemy rpg',
  ];

const emojiMatch = [
    '🎲'
];

const buildRegex = () => {
  const regexFields = terms.map(term => term.replace(/\s/gi, '\\s*')).join('|');

  const regexString = `\\b#?(${regexFields})\\b`;
  console.log(regexString);
  return new RegExp(regexString);
};

const matchRegex = buildRegex();

terms.forEach((term) => {
    if(matchRegex.test(term)) {
        console.log(`✅ ${term}`);
    } else {
        console.log(`❌ ${term}`);
    }
})