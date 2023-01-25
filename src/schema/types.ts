import { SignedEvent } from '../event/SignedEvent'

export type Tag     = string  | number | boolean
export type Literal = string  | number | boolean | null
export type Json    = Literal | Json[] | { [key : string] : Json }

export type Sorter<T> = (a : T, b : T) => number

export interface ClientConfig {
  filter  ?: Filter
  kind    ?: number
  tags    ?: string[][]
  timeout ?: number
  privkey ?: string | Uint8Array
}

export interface ClientDefaults {
  filter  : Filter
  kind    : number
  tags    : string[][]
  timeout : number
}

export interface ChannelConfig {
  filter    ?: Filter
  template  ?: EventDraft
  encrypted ?: boolean
  secret    ?: string
  secretKey ?: string | Uint8Array
  sharedPub ?: string | Uint8Array
}

export interface Event {
  id         : string
  kind       : number
  created_at : number
  pubkey     : string
  subject   ?: string
  content    : Json
  sig        : string
  tags       : Tag[][]
}

export interface EventDraft {
  id         ?: string
  kind       ?: number
  created_at ?: number
  pubkey     ?: string
  subject    ?: string
  content    ?: Json
  sig        ?: string
  tags       ?: Tag[][]
  secret     ?: string
  secretKey  ?: string | Uint8Array
  sharedPub  ?: string | Uint8Array
}

export interface EventTemplate {
  id        ?: string
  kind       : number
  created_at : number
  pubkey     : string
  subject   ?: string
  content    : Json
  sig       ?: string
  tags       : Tag[][]
}

export type EventEnvelope = [
  data : Json,
  meta : Event | SignedEvent
]

export type ContentEnvelope = [
  key  : string,
  data : Json
]

export type AckEnvelope = [
  eventId : string,
  success : boolean,
  message : string
]

export interface Filter {
  ids     ?: string[]
  authors ?: string[]
  kinds   ?: number[]
  since   ?: number
  until   ?: number
  limit   ?: number
  selfsub ?: boolean
  [ key : string ] : Tag | Tag[] | undefined
}
