import { SignedEvent } from './SignedEvent'
import { NostrClient } from '../class/client'
import { Json }        from '../schema/prime'
import { Event, EventDraft } from '../schema/types'

export class StoreEvent extends SignedEvent {
  public template : EventDraft

  constructor (
    client    : NostrClient,
    event     : Event,
    template ?: EventDraft
  ) {
    super(client, event)
    this.template = { kind: this.kind, ...template }
  }

  _revive () : Map<string, Json> {
    try {
      return (this.content !== undefined && this.content !== null)
        ? new Map(Object.entries(this.content))
        : new Map()
    } catch { return new Map() }
  }

  _commit (data : Map<string, Json>) : void {
    const template = { tags: [], ...this.template }
    template.content = Object.fromEntries(data.entries())
    template.tags.push([ 'e', this.id ])
    template.tags.push([ 'p', this.pubkey ])
    void this.client.publish(template)
  }

  get (key : string) : Json | undefined {
    return this._revive().get(key)
  }

  set (key : string, value : Json) : void {
    const data = this._revive()
    data.set(key, value)
    this._commit(data)
  }

  delete (key : string) : void {
    const data = this._revive()
    data.delete(key)
    this._commit(data)
  }

  clear () : void {
    void this.client.publish({
      kind : 5,
      tags : [ [ 'e', this.id ] ]
    })
  }

  keys () : IterableIterator<string> {
    return this._revive().keys()
  }

  values () : IterableIterator<Json> {
    return this._revive().values()
  }

  entries () : IterableIterator<[string, Json]> {
    return this._revive().entries()
  }

  [Symbol.iterator] () : IterableIterator<[string, Json]> {
    return this.entries()
  }
}
