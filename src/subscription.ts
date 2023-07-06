import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import { filterAndMap as filterAndMapTTRPG, shortname as ttrpgShortname } from './algos/ttrpg'
// import { filterAndMap as filterAndMapTTRPGTest } from './algos/ttrpg-testing'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const ttrpgCreatePosts = filterAndMapTTRPG(ops.posts.creates)
    const ttrpgPostTags = ttrpgCreatePosts.map((post) => ({
      post_uri: post.uri,
      tag: ttrpgShortname,
      indexedAt: post.indexedAt,
    }));
    // const ttrpgTestCreatePosts = filterAndMapTTRPGTest(ops.posts.creates)

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    const createPosts = [...ttrpgCreatePosts];
    const createPostTags = [...ttrpgPostTags];

    if (createPosts.length > 0) {
      await this.db
        .insertInto('post')
        .ignore()
        .values(createPosts)
        .execute()
      await this.db
      .insertInto('post_tag')
      .ignore()
      .values(createPostTags)
      .execute()
    }
  }
}
