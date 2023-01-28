import { z } from 'zod'

const string    = z.string()
const hex       = z.string().regex(/^[0-9a-fA-F]*$/)
const hash      = hex.length(64)
const signature = hex.length(128)
const timestamp = z.number().max(4294967295)
const literal   = z.union([ z.string(), z.number(), z.boolean(), z.null() ])
const base64    = z.string().regex(/^[a-zA-Z0-9+/]+={0,2}$/)
const base64url = z.string().regex(/^[a-zA-Z0-9\-_]+={0,2}$/)
const address   = z.string().url()

const socketAddress = address.startsWith('wss://')

const json : z.ZodType<Json> = z.lazy(() =>
  z.union([ literal, z.array(json), z.record(json) ])
)

const record = z.record(json)

export const PrimeSchema = {
  string,
  hex,
  hash,
  literal,
  json,
  record,
  signature,
  timestamp,
  address,
  socketAddress,
  base64,
  base64url
}

export type Literal   = z.infer<typeof literal>
export type Json      = Literal | { [key : string] : Json } | Json[]
