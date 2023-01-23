/* eslint-disable @typescript-eslint/no-redeclare */
import { z } from 'zod'

import { PrimeSchema } from './prime'
import { EventSchema } from './events'

const { hash, json } = PrimeSchema
const { event, filter } = EventSchema

const SendEnum = z.enum([ 'EVENT', 'REQ', 'CLOSE' ])
const RecvEnum = z.enum([ 'EVENT', 'EOSE', 'NOTICE', 'OK' ])

const RawMessage = z.tuple([ RecvEnum ]).rest(json)

const EventMessage = z.tuple([
  z.literal('EVENT'),
  hash,
  event
]).transform(([ type, subId, event ]) => {
  return { type, subId, event }
})

const EoseMessage = z.tuple([
  z.literal('EOSE'),
  hash
]).transform(([ type, subId ]) => {
  return { type, subId }
})

const AckMessage = z.tuple([
  z.literal('OK'),
  hash,
  z.boolean(),
  z.string()
]).transform(([ type, eventId, ok, message ]) => {
  return { type, eventId, ok, message }
})

const NoticeMessage = z.tuple([
  z.literal('NOTICE'),
  z.string()
]).transform(([ type, message ]) => {
  return { type, message }
})

const RelayMessage = z.tuple([
  z.literal('EVENT'),
  event
]).transform((obj) => JSON.stringify(obj))

const RequestMessage = z.tuple([
  z.literal('REQ'),
  hash,
  filter
]).transform((obj) => JSON.stringify(obj))

const CloseMessage = z.tuple([
  z.literal('CLOSE'),
  hash
]).transform((obj) => JSON.stringify(obj))

export const MessageSchema = {
  RawMessage,
  EventMessage,
  EoseMessage,
  AckMessage,
  NoticeMessage,
  RelayMessage,
  RequestMessage,
  CloseMessage
}

export type OutboundEnum = z.infer<typeof SendEnum>
export type InboundEnum  = z.infer<typeof RecvEnum>

export type RawMessage     = z.infer<typeof RawMessage>
export type EventMessage   = z.infer<typeof EventMessage>
export type EoseMessage    = z.infer<typeof EoseMessage>
export type AckMessage     = z.infer<typeof AckMessage>
export type NoticeMessage  = z.infer<typeof NoticeMessage>
export type InboundMessage = EventMessage | EoseMessage | AckMessage | NoticeMessage

export type SubscriptionMessage = EventMessage | EoseMessage

export type RelayMessage    = z.input<typeof RelayMessage>
export type RequestMessage  = z.input<typeof RequestMessage>
export type CloseMessage    = z.input<typeof CloseMessage>
export type OutboundMessage = RelayMessage | RequestMessage | CloseMessage
