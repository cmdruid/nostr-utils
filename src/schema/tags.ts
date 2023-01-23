import { z } from 'zod'

import { Event }       from './events'
import { PrimeSchema } from './prime'
import { Profile }     from './event/profile'

const { address, hash } = PrimeSchema

const tag        = z.union([ z.string(), z.number(), z.boolean() ])
const tags       = tag.array()
const tagsArray  = z.array(tags)
const tagsFilter = z.union([ tag, tags ])

const sourceRecord = z.tuple([
  hash,
  address.optional(),
  z.string().optional()
])
  .rest(tag)
  .transform(([ eventId, address, type, ...rest ]) => {
    return { eventId, address, type, tags: rest }
  })

const memberRecord = z.tuple([
  hash,
  address.optional(),
  z.string().optional()
])
  .rest(tag)
  .transform(([ pubkey, address, nick, ...rest ]) => {
    return { pubkey, address, nick, tags: rest }
  })

const sourceTag = z.object({
  eventId : hash,
  address : address.optional(),
  type    : z.enum([ 'root', 'reply' ]).optional(),
  tags    : tagsArray.optional()
}).transform(({ eventId, address, type, tags = [] }) => {
  const args : Tags = [ eventId ]
  for (const arg of [ address, type, ...tags ]) {
    if (arg === undefined) return args
  }
  return args
})

const memberTag = z.object({
  pubkey  : hash,
  address : address.optional(),
  nick    : z.string().optional(),
  tags    : tagsArray.optional()
}).transform(({ pubkey, address, nick, tags = [] }) => {
  const args : Tags = [ pubkey ]
  for (const arg of [ address, nick, ...tags ]) {
    if (arg === undefined) return args
  }
  return args
})

export const TagSchema = {
  tag,
  tags,
  tagsArray,
  tagsFilter,
  memberRecord,
  sourceRecord,
  memberTag,
  sourceTag
}

export type Tag         = z.infer<typeof tag>
export type Tags        = z.infer<typeof tags>
export type TagsArray   = z.infer<typeof tagsArray>
export type TagsFilter  = z.infer<typeof tagsFilter>

export interface EventMember {
  pubkey   : string
  address ?: string
  nick    ?: string
  tags    ?: Tags
  profile ?: Profile | Promise<Profile | undefined>
}

export interface EventSource {
  eventId  : string
  address ?: string
  type    ?: string
  tags    ?: Tags
  event   ?: Event | Promise<Event | undefined>
}
