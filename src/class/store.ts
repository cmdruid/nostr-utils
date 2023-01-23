/**
 *  Store
 *
 *  Type-safe implementation of a
 *  basic data store object.
 *
 * */

import { SignedEvent } from '../event/SignedEvent'
import { EventDraft, Filter, Json } from '../schema/types'
import { NostrClient } from './client'
import { EventEmitter } from './emitter'
import { Subscription } from './subscription'
import { TopicEmitter } from './channel'

type Entries<T> = Array<[ string, T ]>
type Records<T> = Record<string, T>
type Mapper<T>  = (key : string, val : T) => T

const now = () : number => Math.floor(Date.now() / 1000)

function encode (_key : string, value : any) : any {
  // Convert non-standard javascript objects to json.
  if (value instanceof Map)  return { type: 'Map', value: [ ...value ] }
  if (value instanceof Date) return { type: 'Date', value }
  return value
}

function decode (_key : string, value : any) : any {
  // Convert non-standard json objects to javascript.
  if (typeof value === 'object' && value !== null) {
    if (value.type === 'Map') return new Map(value.value)
    if (value.type === 'Date') return new Date(value.value)
  }
  return value
}

interface StoreConfig {
  filter   ?: Filter
  secret   ?: string
  template ?: EventDraft
}

const STORE_DEFAULTS = {
  kinds : [ 31000 ]
}

export class Store extends EventEmitter<{
  'ready' : [ Store ]
}> {
  public readonly client : NostrClient
  public readonly sub    : Subscription
  public readonly topic  : 

  private _map : Map<string, Json>
  public lastUpdate : number

  constructor (
    client : NostrClient,
    topic  : string,
    config : StoreConfig = {}
  ) {
    // let data = (typeof data === 'object')
    //   ? Object.entries(data)
    //   : (Array.isArray(data)) ? data : []
    const { filter, encrypted, template } = config

    super()
    this.client = client
    this._map   = new Map()
    this.lastUpdate = now()

    this.sub = client.subscribe({
      ...filter, limit: 1, '#d': [ topic ]
    })

    this.sub.on('event', (event) => {
      if event
    })
  }

  public get topic () : Promise<string> {
    return (this.encrypted)
      ? this.cipher.hashtag
      : new Promise(resolve => { resolve(this._topic) })
  }

  private commit () : void {

  }

  public get (key : string) : T | undefined {
    return this.data[key]
  }

  public set (key : string, val : T) : void {
    this.writeCheck()
    this.data[key] = val
  }

  public has (key : string) : boolean {
    return (this.data[key] !== undefined)
  }

  public ensure (key : string, val : T) : void {
    this.writeCheck()
    if (!this.has(key)) {
      this.data[key] = val
    }
  }

  public delete (key : string) : void {
    this.writeCheck()
    this.data[key] = undefined
  }

  public keys () : string[] {
    return Object.keys(this.data)
  }

  public values () : T[] {
    return Object.values(this.data)
  }

  public entries () : Array<[string, T]> {
    return Object.entries(this.data)
  }

  public map (fn : Mapper<T>) : void {
    for (const key in this.data) {
      this.set(key, fn(key, this.get(key)))
    }
  }

  public select (keys : string[]) : Records<T> {
    const selection : Records<T> = {}
    for (const key of keys) {
      selection[key] = this.data[key]
    }
    return selection
  }

  public filter (keys : string[]) : Records<T> {
    const selectors = Object
      .keys(this.data)
      .filter(i => !keys.includes(i))
    return this.select(selectors)
  }

  public toJSON () : Readonly<Records<T>> {
    return Object.freeze(this.data)
  }

  public [Symbol.iterator] () : Array<[string, T]> {
    return this.entries()
  }
}
