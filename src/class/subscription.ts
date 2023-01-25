import { NostrClient }  from './client'
import { EventEmitter } from './emitter'
import { SignedEvent }  from '../event/SignedEvent'
import { Hex }          from '../lib/format'
import { Filter }       from '../schema/types'

type UpdateHook = (sub : Subscription) => void | Promise<void>

export class Subscription extends EventEmitter<{
  'ready'  : [ Subscription ]
  'event'  : [ SignedEvent  ]
  [ k : string ] : any[]
}> {
  public readonly client  : NostrClient
  public readonly id      : string

  public filter      : Filter
  public _updateHook : UpdateHook
  public selfsub     : boolean
  public subscribed  : boolean

  constructor (
    client : NostrClient,
    filter : Filter = client.filter
  ) {
    const { selfsub = false, ...rest } = filter
    super()
    this.id          = Hex.random(16)
    this.client      = client
    this.filter      = rest
    this.selfsub     = selfsub
    this.subscribed  = false
    this._updateHook = () => {}

    this.client.on(this.id, this._eventHandler.bind(this))

    this.client.on('ready', async () => {
      await this._updateHook(this)
      void this.update()
    })
  }

  private _eventHandler (type : string, ...args : any[]) : void {
    /** Handle incoming events from the client emitter. */
    if (type === 'event') {
      const event : SignedEvent = args[0]
      if (!this.selfsub && event.isAuthor) return
    }
    this.emit(type, ...args)
  }

  public async update (filter : Filter = this.filter) : Promise<void> {
    /** send a subscription request to the relay. */
    return new Promise((resolve, reject) => {
      // Configure our message payload and timeout.
      const message = JSON.stringify([ 'REQ', this.id, filter ])
      const timeout = this.client.options.timeout
      const errmsg  = Error(`Subscription ${this.id} timed out!`)
      const timer   = setTimeout(() => { reject(errmsg) }, timeout)
      this.within('eose', () => {
        // If we receive an eose event,
        // the subscription is ready.
        clearTimeout(timer)
        this.subscribed = true
        this.emit('ready', this)
        resolve()
      }, timeout)
      // Send the subscription request to the relay.
      void this.client.send(message)
    })
  }

  public cancel () : void {
    /** Cancels the subscription. */
    this.client.cancel(this.id)
  }
}
