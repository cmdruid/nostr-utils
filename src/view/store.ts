/**
 *  Store
 *
 *  Type-safe implementation of a
 *  basic data store object.
 *
 * */

import { SignedEvent } from '../event/SignedEvent'
import { PrimeSchema } from '../schema/prime'
import { EventDraft, EventResponse, Filter, Json } from '../schema/types'
import { NostrClient } from '../class/client'
import { EventEmitter } from '../class/emitter'
import { Subscription } from './subscription'

// type Entries = Array<[ string, Json ]>
type StoreRecord = Record<string, Json | undefined>
type MapFn   = (entries : [ string, Json ]) => [ string, Json ]

interface CommitRecord {
  updated_at : number
  updated_by : string
  commit_id  : string
}

export interface StoreConfig {
  cacheSize ?: number
  content   ?: StoreRecord
  delay     ?: number
  filter    ?: Filter
  label     ?: string
  retries   ?: number
  template  ?: EventDraft
}

export interface StoreOptions {
  cacheSize : number
  delay     : number
  retries   : number
}

export class Store extends EventEmitter<{
  'commit' : [ EventDraft ]
  'ready'  : [ Store ]
  'update' : [ Store ]
  [ k : string ] : any[]
}> {
  public readonly client  : NostrClient
  public readonly sub     : Subscription
  public readonly data    : Map<string, Json>
  public readonly commits : Map<string, CommitRecord>

  public init        : boolean
  public options     : StoreOptions
  public template    : EventDraft
  public updatedAt   : number

  static defaults = {
    kind: 19000
  }

  constructor (
    client : NostrClient,
    config : StoreConfig = {}
  ) {
    const { content, filter, template = {}, label, ...opt } = config

    super()
    this.client    = client
    this.data      = new Map()
    this.commits   = new Map()
    this.init      = false
    this.updatedAt = 0

    this.template  = {
      kind: Store.defaults.kind,
      ...template
    }

    this.options = {
      cacheSize : 100,
      delay     : 500,
      retries   : 5,
      ...opt
    }

    this.sub = new Subscription(this.client, {
      selfsub   : true,
      kinds     : [ Store.defaults.kind ],
      limit     : this.options.cacheSize,
      cacheSize : this.options.cacheSize,
       ...filter
    })

    if (label !== undefined) {
      this.filter['#d'] = [ label ]
      this.template.tags?.push([ 'd', label ])
    }

    this.client.on('ready', () => {
      this.init = false
    })

    this.sub.on('ready', () => {
      this.init = true
      this.emit('ready', this)
      if (content !== undefined) {
        void this.push(content)
      }
    })

    this.sub.on('event', this._eventHandler.bind(this))
  }

  get filter () : Filter {
    return this.sub.filter
  }

  set filter (filter : Filter) {
    this.sub.filter = filter
  }

  get size () : number {
    return this.data.size
  }

  get prevCommit () : CommitRecord | undefined {
    let prev
    for (const c of this.commits.values()) {
      if (prev?.updated_at === undefined) prev = c
      if (c.updated_at > prev.updated_at) {
        prev = c
      }
    }
    return prev
  }

  async _eventHandler (event : SignedEvent) : Promise<void> {
    try {
      if (!event.isJSON) return
      const schema  = PrimeSchema.record
      const records = schema.parse(event.json)
      // Iterate through the store contents.
      for (const key in records) {
        // Check the commit timestamp for a given key.
        const { updated_at } = this.commits.get(key) ?? {}
        if (
          updated_at === undefined ||
          updated_at < event.created_at
        ) {
          // Update the store value and commit history.
          if (records[key] !== null) {
            this.data.set(key, records[key])
          } else { this.data.delete(key) }

          this.commits.set(key, {
            updated_at : event.created_at,
            updated_by : event.pubkey,
            commit_id  : event.id
          })
        }
      }
      if (this.init) this.emit('update', this)
    } catch (err) { this.client.emit('error', '[ Store ] Error:', err) }
  }

  _diff (data : StoreRecord) : StoreRecord {
    const changed : StoreRecord = {}
    for (const key in data) {
      const prev = this.data.get(key)
      if (prev !== data[key]) {
        changed[key] = data[key]
      }
    }
    return changed
  }

  async commit (data : StoreRecord) : Promise<EventResponse> {
    const changed  = this._diff(data)
    const template = { tags: [], ...this.template }
    template.content = JSON.stringify(changed)
    this.emit('commit', template)
    return this.client.publish(template)
  }

  has (key : string) : boolean {
    return this.data.has(key)
  }

  get (key : string) : Json | undefined {
    return this.data.get(key)
  }

  select (fn : MapFn) : StoreRecord {
    const entries  = [ ...this.data.entries() ]
    const filtered = entries.filter(fn)
    return Object.fromEntries(filtered)
  }

  selectKeys (keys : string[]) : StoreRecord {
    const selection : StoreRecord = {}
    for (const key of keys) {
       const val = this.get(key)
       if (val !== undefined) {
        selection[key] = val
      }
    }
    return selection
  }

  async set (key : string, val : Json) : Promise<EventResponse> {
    return this.commit({ [key]: val })
  }

  async push (
    data : StoreRecord,
    prune = false
  ) : Promise<EventResponse> {
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    if (prune) {
      for (const key of this.data.keys()) {
        if (data[key] === undefined) data[key] = null
      }
    }
    return this.commit(data)
  }

  async map (fn : MapFn) : Promise<EventResponse> {
    const entries = [ ...this.data.entries() ]
    const mapped  = entries.map(fn)
    return this.commit(Object.fromEntries(mapped))
  }

  async delete (key : string) : Promise<EventResponse> {
    return this.commit({ [key]: null })
  }

  async clear () : Promise<EventResponse> {
    return this.push({}, true)
  }

  async destroy () : Promise<void> {
    const events = await this.sub.fetch(this.filter)
    for (const event of events) {
      if (event.pubkey === this.client.pubkey) {
        void this.client.publish({ kind: 5, tags: [ [ 'e', event.id ] ] })
      }
    }
  }

  keys () : IterableIterator<string> {
    return this.data.keys()
  }

  values () : IterableIterator<Json> {
    return this.data.values()
  }

  entries () : IterableIterator<[string, Json]> {
    return this.data.entries()
  }

  export () : StoreRecord {
    return Object.fromEntries(this.entries())
  }

  toJSON () : StoreRecord {
    return Object.fromEntries(this.entries())
  }

  [Symbol.iterator] () : IterableIterator<[string, Json]> {
    return this.entries()
  }
}

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
