import { Cipher }           from '../class/cipher'
import { NostrClient }      from '../class/client'
import { KeyPair }          from '../class/keypair'
import { Text }             from '../lib/format'
import { Event, Json, Tag } from '../schema/types'

export class SignedEvent implements Event {
  public readonly client : NostrClient
  public readonly event  : Event

  private _content   : string

  constructor (
    client : NostrClient,
    event  : Event | SignedEvent
  ) {
    this.client = client
    this.event  = (event instanceof SignedEvent)
      ? event.toJSON()
      : event

    this._content = event.content
  }

  public get isAuthor () : boolean {
    return this.pubkey === this.client.pubkey
  }

  public get isValid () : Promise<boolean> {
    return KeyPair.verify(this.sig, this.id, this.pubkey)
  }

  public get isEncrypted () : boolean {
    const isString  = typeof this.event.content === 'string'
    const hasVector = this.event.content.includes('?iv=')
    return (isString && hasVector)
  }

  public get isJSON () : boolean {
    return Text.isJSON(this.content)
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

  public get rawcontent () : string {
    return this.event.content
  }

  public get content () : string {
    return this._content
  }

  public get json () : Json | undefined {
    return Text.toJSON(this.content)
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

  public get secret () : Uint8Array | undefined {
    const label = this.getTag('s') ?? ''
    return this.client.secrets.get(label)
  }

  public get topic () : string | undefined {
    return this.getTag('t')
  }

  public filterTags (tag : string) : Tag[][] {
    return this.tags
      .filter(t => t[0] === tag)
      .map(t => t.slice(1))
  }

  public getTag (tag : string) : string | undefined {
    const tags = this.filterTags(tag)
    return (tags.length > 0) ? String(tags[0][0]) : undefined
  }

  // public getHeaders() {
  // }

  public async decrypt (secretKey : string | Uint8Array) : Promise<string> {
    this._content = await Cipher.decrypt(this.rawcontent, secretKey)
    return this.content
  }

  public toJSON () : Event {
    return this.event
  }
}
