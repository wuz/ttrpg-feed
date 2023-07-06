import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { uniqBy } from 'lodash';
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import { filterAndMap as filterAndMapTTRPG, shortname as ttrpgShortname } from './algos/ttrpg'
import { filterAndMap as filterAndMapCritRoleSpoiler, shortname as critRoleSpoilerShortname } from './algos/critrole-spoilers'
// import { filterAndMap as filterAndMapTTRPGTest } from './algos/ttrpg-testing'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const ttrpgCreatePosts = filterAndMapTTRPG(ops.posts.creates)
    const critRoleSpoilerCreatePosts = filterAndMapCritRoleSpoiler(ops.posts.creates)

    const ttrpgPostTags = ttrpgCreatePosts.map((post) => ({
      post_uri: post.uri,
      tag: ttrpgShortname,
      indexedAt: post.indexedAt,
    }));
    const critRoleSpoilerPostTags = critRoleSpoilerCreatePosts.map((post) => ({
      post_uri: post.uri,
      tag: critRoleSpoilerShortname,
      indexedAt: post.indexedAt,
    }));
    // const ttrpgTestCreatePosts = filterAndMapTTRPGTest(ops.posts.creates)

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
      await this.db
        .deleteFrom('post_tag')
        .where('post_uri', 'in', postsToDelete)
        .execute()
    }
    const createPosts = uniqBy([...ttrpgCreatePosts, ...critRoleSpoilerCreatePosts], 'uri');
    const createPostTags = [...ttrpgPostTags, ...critRoleSpoilerPostTags];

    if (createPosts.length > 0) {
      await this.db
        .insertInto('post')
        .ignore()
        .values(createPosts)
        .execute()
    }
    if (createPostTags.length > 0) {
      await this.db
      .insertInto('post_tag')
      .ignore()
      .values(createPostTags)
      .execute()
    }
  }
}
