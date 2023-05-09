import { NostrClient }   from '../class/client'
import { EventEmitter }  from '../class/emitter'
import { EventFilter }   from '../class/filter'
import { Transformer } from '../class/transformer'
import { SignedEvent }   from '../event/SignedEvent'
import { Hex }           from '../lib/format'
import { Filter }        from '../schema/types'

type SubStatus  = 'NEW' | 'ACTIVE' | 'LOADING' | 'TIMEOUT' | 'CLOSED'
type Filterware = Transformer<Filter, Subscription>

export interface SubOptions {
  cacheSize : number
  selfsub   : boolean
  timeout   : number
}

export class Subscription extends EventEmitter<{
  'ready'  : [ Subscription ]
  'eose'   : [ Subscription ]
  'event'  : [ SignedEvent  ]
  [ k : string ] : any[]
}> {
  private readonly _cache    : Set<SignedEvent>

  public readonly client     : NostrClient
  public readonly id         : string
  public readonly opt        : SubOptions
  public readonly filterware : Filterware

  public _filter  : Filter
  public promise ?: Promise<void>
  public status   : SubStatus

  constructor (
    client : NostrClient,
    filter : Filter = {}
  ) {
    const {
      /* Here we parse out any non-conventional
         settings from the filter object.
      */
      cacheSize = 100,
      selfsub   = false,
      timeout   = client.options.timeout,
      ...rest
    } = filter

    super()
    this._cache      = new Set()
    this.client      = client
    this.filterware  = new Transformer(this as Subscription)
    this.id          = Hex.random(16)
    this.opt         = { cacheSize, selfsub, timeout }
    this._filter     = rest
    this.status      = 'NEW'

    /* When an event is delivered to this subId,
     * we forward it to our event handler.
     */
    this.client.on(this.id, (type : string, event : SignedEvent) => {
      if (type === 'event') this._eventHandler(event)
      if (type === 'eose')  this.emit('eose', this)
    })

    /* When the client emits a ready event,
     * we should update our subscription.
     */
    this.client.on('ready', () => {
      if (this.status === 'NEW') {
        void this.update()
      }
    })

    this.filterware.catch((...err) => {
      this.client.emit('error', `[ ERROR ] ${this.slug} Subscription failed:`, ...err)
    })
  }

  get slug () : string {
    return this.id.slice(0, 5)
  }

  get isActive () : boolean {
    return this.status === 'ACTIVE'
  }

  get isLoading () : boolean {
    return this.status === 'LOADING'
  }

  get isClosed () : boolean {
    return this.status === 'CLOSED'
  }

  get cache () : SignedEvent[] {
    /* Dumps the current event cache as an array. */
    return [ ...this._cache.values() ]
  }

  get filter () : Filter {
    return this._filter
  }

  set filter (filter : Filter) {
    const older = this.filter.toString()
    const newer = filter.toString()
    if (older !== newer) {
      this.status = 'NEW'
    }
    this._filter = filter
  }

  _eventHandler (event : SignedEvent) : void {
    /** Handles incoming events delivered from the client. */
    if (!this.opt.selfsub && event.isAuthor) {
      // When selfsub is disabled,
      // discard self-published events.
      return
    }
    if (!EventFilter.check([ event ], this.filter)) {
      // If an event fails the filter check, discard event.
      // console.log('filtered:', event)
      return
    }
    if (this.opt.cacheSize > 0) {
      // If caching is enabled, add event to cache.
      this._cache.add(event)
      if (this._cache.size > this.opt.cacheSize) {
        // Prune cache once limit is reached.
        this._cache.delete(this.cache[0])
      }
    }
    // Finally, broadcast the event.
    console.log(event.id)
    this.emit('event', event)
  }

  _setActive () : void {
    this.status  = 'ACTIVE'
    this.promise = undefined
    this.emit('ready', this)
    this.client.emit('info', `[ INFO ] ${this.slug} Subscribed to:`, this.id)
  }

  _setLoading () : void {
    this.status = 'LOADING'
  }

  _setTimeout () : void {
    this.status = 'TIMEOUT'
    this.client.emit('info', `[ INFO ] ${this.slug} Subscription timed out:`, this.id)
  }

  _activate (resolver : Function) : void {
    const action = () : void => { this._setTimeout(); resolver() }
    const timer  = setTimeout(action, this.opt.timeout)
    this.within('eose', () => {
      clearTimeout(timer)
      this._setActive()
      // To help with lagging eose events.
      setTimeout(resolver, 500)
    }, this.opt.timeout)
    this._setLoading()
  }

  async _subscribe (filter ?: Filter) : Promise<void> {
    if (filter !== undefined) this.filter = filter
    const [ ok, data ] = await this.filterware.apply(this.filter)
    if (ok) {
      this.filter = data
      const message = JSON.stringify([ 'REQ', this.id, this.filter ])
      this.client.emit('info', `[ INFO ] ${this.slug} Subscribing with:`, this.filter)
      void this.client.send(message)
    }
  }

  async update (filter ?: Filter) : Promise<void> {
    /** send a subscription request to the relay. */
    console.log(this.isActive, this.promise)
    if (!this.isActive && this.promise === undefined) {
      this.promise = new Promise((resolve) => {
        this._activate(resolve)
        void this._subscribe(filter)
      })
    }
    return this.promise
  }

  async fetch (filter ?: Filter) : Promise<SignedEvent[]> {
    if (!this.isActive) await this.update(filter)
    return (filter !== undefined)
      ? EventFilter.apply(this.cache, filter)
      : this.cache
  }

  public close () : SignedEvent[] {
    /** Cancels the subscription. */
    if (this.isActive) {
      this.client.cancel(this.id)
    }
    this.status = 'CLOSED'
    return this.cache
  }
}
