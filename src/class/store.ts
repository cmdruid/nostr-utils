/**
 *  Store
 *
 *  Type-safe implementation of a
 *  basic data store object.
 *
 * */

import { StoreEvent } from '../event/StoreEvent'
import { EventDraft, Filter, Json } from '../schema/types'
import { NostrClient } from './client'
import { EventEmitter } from './emitter'
import { Subscription } from './subscription'

// type Entries = Array<[ string, Json ]>
type Records = Record<string, Json>
type Mapper  = (key : string, val : Json) => Json

const now = () : number => Math.floor(Date.now() / 1000)

// function encode (_key : string, value : any) : any {
//   // Convert non-standard javascript objects to json.
//   if (value instanceof Map)  return { type: 'Map', value: [ ...value ] }
//   if (value instanceof Date) return { type: 'Date', value }
//   return value
// }

// function decode (_key : string, value : any) : any {
//   // Convert non-standard json objects to javascript.
//   if (typeof value === 'object' && value !== null) {
//     if (value.type === 'Map') return new Map(value.value)
//     if (value.type === 'Date') return new Date(value.value)
//   }
//   return value
// }

interface StoreConfig {
  filter   ?: Filter
  secret   ?: string
  template ?: EventDraft
}

export class Store extends EventEmitter<{
  'ready' : [ Store ]
}> {
  public readonly client : NostrClient
  public readonly sub    : Subscription
  public readonly data   : Map<string, StoreEvent>
  public readonly label  : string

  public template   : EventDraft
  public lastUpdate : number

  public static defaults = {
    kind: 31000
  }

  constructor (
    client : NostrClient,
    label  : string,
    config : StoreConfig = {}
  ) {
    // let data = (typeof data === 'object')
    //   ? Object.entries(data)
    //   : (Array.isArray(data)) ? data : []
    const { filter, template } = config

    super()
    this.client     = client
    this.label      = label
    this.data       = new Map()
    this.template   = { ...Store.defaults, ...template }
    this.lastUpdate = now()

    this.sub = client.subscribe(filter)

    this.sub._updateHook = (sub) => {
      sub.filter['#d'] = [ this.label ]
    }

    this.sub.on('event', (event) => {
      const store = new StoreEvent(this.client, event)
      this.data.set(event.pubkey, store)
    })
  }

  private _commit () : void {
    const template = { tags: [], ...this.template }
    template.content = this.get(this.client.pubkey)?.toJSON()
    template.tags.push([ 'd', this.label ])
    void this.client.publish(template)
  }

  public get (
    key : string,
    pub : string = this.client.pubkey
  ) : Json | undefined {
    const store = this.data.get(pub)
    return (store !== undefined)
      ? store.get(key)
      : undefined
  }

  public set (
    key : string,
    val : Json
  ) : void {
    const store = this.data.get(this.client.pubkey)
    if (store !== undefined) {
      store.set()
    }
    this._commit()
  }

  public has (
    key : string,
    pub : string = this.client.pubkey
  ) : boolean {
    return this.data.get(pub)?.get(key) !== undefined
  }

  public delete (key : string) : void {
    const data = this.get(key)
    if (data !== undefined) {
      void this.client.publish({
        kind : 5,
        tags : [ [ 'e', data.event.id ] ]
      })
    }
  }

  public keys () : string[] {
    return Object.keys(this.data)
  }

  public values () : Json[] {
    return Object.values(this.data)
  }

  public entries () : Array<[string, Json]> {
    return Object.entries(this.data)
  }

  public map (fn : Mapper) : void {
    for (const key in this.data) {
      const val = this.get(key)
      if (val !== undefined) {
        this.set(key, fn(key, val))
      }
    }
  }

  public select (keys : string[]) : Records {
    const selection : Records = {}
    for (const key of keys) {
       const val = this.get(key)
       if (val !== undefined) {
        selection[key] = val
      }
    }
    return selection
  }

  public filter (keys : string[]) : Records {
    const selectors = Object
      .keys(this.data)
      .filter(i => !keys.includes(i))
    return this.select(selectors)
  }

  public toJSON () : Records {
    return Object.fromEntries(this.entries())
  }

  public [Symbol.iterator] () : Array<[string, Json]> {
    return this.entries()
  }
}
