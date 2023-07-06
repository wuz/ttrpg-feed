import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import { filterAndMap as filterAndMapTTRPG } from './algos/ttrpg'
// import { filterAndMap as filterAndMapTTRPGTest } from './algos/ttrpg-testing'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const ttrpgCreatePosts = filterAndMapTTRPG(ops.posts.creates)
    // const ttrpgTestCreatePosts = filterAndMapTTRPGTest(ops.posts.creates)

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    const createPosts = [...ttrpgCreatePosts];

    if (createPosts.length > 0) {
      await this.db
        .insertInto('post')
        .ignore()
        .values(createPosts)
        .execute()
    }
  }
}
