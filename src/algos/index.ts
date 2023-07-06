import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as ttrpg from './ttrpg'
import * as ttrpgTesting from './ttrpg-testing'


type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [ttrpg.shortname]: ttrpg.handler,
  [ttrpgTesting.shortname]: ttrpgTesting.handler,
}

export default algos
