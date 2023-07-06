import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

// A simple regex to match a bunch of different games with different spacing and the option to be a hashtag!
const matchRegex = /\b#?(ttrpg|d&d|dnd|pathfinder|dungeons\s*and\s*dragons|mork\s*borg|blades\s*in\s*the\s*dark|urban\s*shadows|symbaroum|shadowdark|🎲)\b/

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        // only TTRPG related posts
        return matchRegex.test(create.record.text.toLowerCase());
      })
      .map((create) => {
        console.log(create.record.text);
        // map to DB row
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
