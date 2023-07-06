import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

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

  // promo stuff
  'self(-\\s)promo saturday',
  'wip wednesday',

  // events
  'gen con',

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
  return new RegExp(regexString);
};

const matchRegex = buildRegex();

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        const matchTerms = matchRegex.test(create.record.text.toLowerCase());
        const matchEmoji = emojiMatch.some((emoji) => create.record.text.includes(emoji));
        const optout = /\b#?(nofeed|nottrpgfeed)\b/.test(create.record.text);
        return !optout && (matchTerms || matchEmoji);
      })
      .map((create) => {
        return {
          uri: create.uri,
          cid: create.cid,
          replyParent: create.record?.reply?.parent.uri ?? null,
          replyRoot: create.record?.reply?.root.uri ?? null,
          indexedAt: new Date().toISOString(),
        }
      })

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .ignore()
        .values(postsToCreate)
        .execute()
    }
  }
}
