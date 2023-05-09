import { z } from 'zod'

import { PrimeSchema } from './prime'
import { TagSchema }   from './tags'

const { hex, hash, json, signature, timestamp } = PrimeSchema
const { tags, tagsArray } = TagSchema

const kind = z.number().min(0).max(30000)

const content = json

const event = z.object({
  kind,
  content,
  id         : hash,
  pubkey     : hash,
  created_at : timestamp,
  subject    : z.string().optional(),
  tags       : tagsArray,
  sig        : signature
}).catchall(json)

const filter = z.object({
  ids     : hash.array(),
  authors : hex.max(64).array(),
  kinds   : kind.array(),
  since   : timestamp,
  until   : timestamp,
  limit   : z.number()
}).partial().catchall(tags)

const channel = z.tuple([
  z.string(),
  json
])

export const EventSchema = {
  kind,
  content,
  event,
  filter,
  channel
}

export type Kind   = z.infer<typeof kind>
export type Event  = z.infer<typeof event>
export type Filter = z.infer<typeof filter>
