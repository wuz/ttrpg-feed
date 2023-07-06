import dotenv from 'dotenv'
import { AtpAgent, BlobRef } from '@atproto/api'
import fs from 'fs/promises'
import { ids } from '../src/lexicon/lexicons'
import path from 'path';

const envPath = path.resolve(__dirname, '../.env.local');

const run = async () => {
  dotenv.config({ path:envPath})

  const handle = 'skeet.computer'
  const password = process.env.BSKY_PASSWORD ?? ''
  // const recordName = 'aaabotewjkiv4'
  const recordName = 'ttrpg-folks-testing'

  const displayName = 'TTRPG Folks Testing'
//   const description = `A comprehensive feed of TTRPG posts! 
// Have a request for a specific game? Reach out to @skeet.computer. 
// Opt out with #nofeed or #nottrpgfeed.`;
const description = `A test feed for the TTRPG Folks feed.`;
  const avatar: string = path.resolve(__dirname, '../avatar.png');

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

  console.log('All done 🎉')
}

run()
