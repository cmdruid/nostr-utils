import { Cipher }           from '../class/cipher'
import { NostrClient }      from '../class/client'
import { KeyPair }          from '../class/keypair'
import { Text }             from '../lib/format'
import { Event, Json, Tag } from '../schema/types'

export class SignedEvent implements Event {
  public readonly client : NostrClient
  public readonly event  : Event

  constructor (
    client : NostrClient,
    event  : Event | SignedEvent
  ) {
    this.client = client
    this.event  = (event instanceof SignedEvent)
      ? event.toJSON()
      : event
  }

  public get isAuthor () : boolean {
    return this.pubkey === this.client.pubkey
  }

  public get isValid () : Promise<boolean> {
    return KeyPair.verify(this.sig, this.id, this.pubkey)
  }

  public get isEncrypted () : boolean {
    return (
      typeof this.event.content === 'string' &&
      this.event.content.includes('?iv=')
    )
  }

  public get isJSON () : boolean {
    return Text.isJSON(this.event.content as string)
  }

  public get id () : string {
    return this.event.id
  }

  public get kind () : number {
    return this.event.kind
  }

  public get created_at () : number {
    return this.event.created_at
  }

  public get pubkey () : string {
    return this.event.pubkey
  }

  public get subject () : string | undefined {
    return this.event.subject
  }

  public get content () : Json | string {
    return (this.isJSON)
      ? JSON.parse(this.event.content as string)
      : this.event.content
  }

  public get sig () : string {
    return this.event.sig
  }

  public get tags () : Tag[][] {
    return this.event.tags
  }

  public get members () : Tag[][] {
    return this.tags
      .filter(t => t[0] === 'p')
      .map(t => t.slice(1))
  }

  public get sources () : Tag[][] {
    return this.tags
      .filter(t => t[0] === 'e')
      .map(t => t.slice(1))
  }

  public get hashtags () : Tag[] {
    return this.tags
      .filter(t => t[0] === 't')
      .map(t => t[1])
  }

  public getTags (tag : string) : Tag[][] {
    return this.tags
      .filter(t => t[0] === tag)
      .map(t => t.slice(1))
  }

  public getTag (tag : string) : Tag | undefined {
    const tags = this.getTags(tag)
    return (tags.length > 0) ? tags[0][0] : undefined
  }

  public async decrypt (secret : string | Uint8Array) : Promise<string> {
    return Cipher.decrypt(this.content as string, secret)
  }

  public toJSON () : Event {
    return this.event
  }
}
