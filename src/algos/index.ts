import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as ttrpg from './ttrpg'
import * as critrolespoiler from './critrole-spoilers'


type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [ttrpg.shortname]: ttrpg.handler,
  [critrolespoiler.shortname]: critrolespoiler.handler,
}

export default algos