import { NostrClient }   from '../class/client'
import { EventEmitter }  from '../class/emitter'
import { SignedEvent }   from '../event/SignedEvent'
import { Hex }           from '../lib/format'
import { Event, Filter } from '../schema/types'
import { filterEvents }  from '../lib/filter'

type UpdateHook = (sub : Subscription) => void | Promise<void>

export class Subscription extends EventEmitter<{
  'ready'  : [ Subscription ]
  'event'  : [ SignedEvent  ]
  [ k : string ] : any[]
}> {
  private readonly _cache : Set<Event>

  public readonly client  : NostrClient
  public readonly id      : string

  public cacheSize   : number
  public filter      : Filter
  public selfsub     : boolean
  public subscribed  : boolean
  public timeout     : number
  public _updateHook : UpdateHook

  constructor (
    client : NostrClient,
    filter : Filter = {}
  ) {
    const {
      cacheSize = 0,
      selfsub   = false,
      timeout   = client.options.timeout,
      ...rest
    } = filter

    super()
    this.id          = Hex.random(16)
    this.client      = client
    this._cache      = new Set()
    this.cacheSize   = cacheSize
    this.filter      = rest
    this.selfsub     = selfsub
    this.subscribed  = false
    this.timeout     = timeout
    this._updateHook = () => {}

    this.client.on(this.id, this._eventHandler.bind(this))

    this.client.on('ready', async () => {
      await this._updateHook(this)
      void this.update()
    })
  }

  get cache () : Event[] {
    return [ ...this._cache.values() ]
  }

  private _eventHandler (
    type : string, ...args : any[]
  ) : void {
    /** Handle incoming events from the client emitter. */
    if (type === 'event' && args[0] instanceof SignedEvent) {
      const event = args[0]
      if (!this.selfsub && event.isAuthor) { return }
      if (this.cacheSize > 0) {
        this._cache.add(event.toJSON())
        if (this._cache.size > this.cacheSize) {
          this._cache.delete(this.cache[0])
        }
      }
    }
    this.emit(type, ...args)
  }

  public fetch (filter ?: Filter) : Event[] {
    return filterEvents(this.cache, filter)
  }

  public async update (filter : Filter = this.filter) : Promise<void> {
    /** send a subscription request to the relay. */
    return new Promise((resolve, reject) => {
      // Configure our message payload and timeout.
      const message = JSON.stringify([ 'REQ', this.id, filter ])
      const errmsg  = Error(`Subscription ${this.id} timed out!`)
      const timer   = setTimeout(() => { reject(errmsg) }, this.timeout)
      this.within('eose', () => {
        // If we receive an eose event,
        // the subscription is ready.
        clearTimeout(timer)
        this.subscribed = true
        this.client.emit('info', '[ INFO ] Subscribed with:', this.filter)
        this.emit('ready', this)
        resolve()
      }, this.timeout)
      // Send the subscription request to the relay.
      void this.client.send(message)
    })
  }

  public cancel () : void {
    /** Cancels the subscription. */
    this.client.cancel(this.id)
  }
}
