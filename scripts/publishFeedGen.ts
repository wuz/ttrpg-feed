import dotenv from 'dotenv'
import { AtpAgent, BlobRef } from '@atproto/api'
import fs from 'fs/promises'
import { ids } from '../src/lexicon/lexicons'
import path from 'path';
import { shortname as ttrpgShortname} from '../src/algos/ttrpg';
import { shortname as critRoleSpoilerShortname} from '../src/algos/critrole-spoilers';

const envPath = path.resolve(__dirname, '../.env.local');

const feeds = [
  {
    recordName: ttrpgShortname,
    displayName: 'TTRPG Folks',
    description: `A comprehensive feed of TTRPG posts! 
Have a request for a specific game? Reach out to @skeet.computer. 
Opt out with #nofeed or #nottrpgfeed.`,
    avatar: path.resolve(__dirname, '../ttrpgAvatar.png'),
  },
  {
    recordName: critRoleSpoilerShortname,
    displayName: 'Critical Role Spoilers',
    description: `A feed of posts talking about Critical Role spoilers! 
Something not working? Reach out to @skeet.computer. 
To use, add "critical role spoiler" or #critrolespoiler to your posts.`,
    avatar: path.resolve(__dirname, '../critRoleSpoilerAvatar.png'),
  }
];

const run = async () => {
  dotenv.config({ path:envPath})

  const handle = 'skeet.computer'
  const password = process.env.BSKY_PASSWORD ?? ''

  // -------------------------------------
  // NO NEED TO TOUCH ANYTHING BELOW HERE
  // -------------------------------------

  if (!process.env.FEEDGEN_SERVICE_DID && !process.env.FEEDGEN_HOSTNAME) {
    throw new Error('Please provide a hostname in the .env file')
  }
  const feedGenDid =
    process.env.FEEDGEN_SERVICE_DID ?? `did:web:${process.env.FEEDGEN_HOSTNAME}`

  // only update this if in a test environment
  const agent = new AtpAgent({ service: 'https://bsky.social' })
  await agent.login({ identifier: handle, password })

  try {
    await agent.api.app.bsky.feed.describeFeedGenerator()
  } catch (err) {
    throw new Error(
      'The bluesky server is not ready to accept published custom feeds yet',
    )
  }

  await Promise.all(feeds.map(async ({avatar, recordName, displayName, description}) => {
    let avatarRef: BlobRef | undefined
    if (avatar) {
      let encoding: string
      if (avatar.endsWith('png')) {
        encoding = 'image/png'
      } else if (avatar.endsWith('jpg') || avatar.endsWith('jpeg')) {
        encoding = 'image/jpeg'
      } else {
        throw new Error('expected png or jpeg')
      }
      const img = await fs.readFile(avatar)
      const blobRes = await agent.api.com.atproto.repo.uploadBlob(img, {
        encoding,
      })
      avatarRef = blobRes.data.blob
    }
  
    await agent.api.com.atproto.repo.putRecord({
      repo: agent.session?.did ?? '',
      collection: ids.AppBskyFeedGenerator,
      rkey: recordName,
      record: {
        did: feedGenDid,
        displayName: displayName,
        description: description,
        avatar: avatarRef,
        createdAt: new Date().toISOString(),
      },
    })
  }));

  console.log('All done 🎉')
}

run()
