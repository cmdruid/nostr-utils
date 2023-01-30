import WebSocket         from 'ws'
import { Hash }          from './hash'
import { KeyPair }       from './keypair'
import { EventEmitter }  from './emitter'
import { Subscription }  from '../view/subscription'
import { EventChannel }  from '../view/channel'
import { Secrets }       from './secrets'
import { Transformer }   from './transformer'
import { validateEvent } from '../middleware/validate'
import { Hex }           from '../lib/format'
// import { ProfileStore }  from '../store/ProfileStore'
import { SignedEvent }   from '../event/SignedEvent'
import { Store, StoreConfig } from '../view/store'

import {
  ClientConfig,
  Event,
  EventDraft,
  EventTemplate,
  Filter,
  ClientDefaults,
  Tag,
  Sorter,
  ChannelConfig,
  EventResponse
} from '../schema/types'
import { ProfileStore } from '../event/ProfileEvent'
import { Query } from '../view/query'

type Middleware = Transformer<SignedEvent, NostrClient>
type Senderware = Transformer<EventDraft, NostrClient>

export class NostrClient extends EventEmitter <{
  // Type mapping for our client event emitter.
  'ready'  : [ NostrClient ]
  'notice' : [ string      ]
  'info'   : [ string      ]
  'debug'  : [ string      ]
  'error'  : [ unknown     ]
  [k : string ] : any
}> {
  public readonly id         : string
  // public readonly profile    : ProfileStore
  public readonly middleware : Middleware
  public readonly senderware : Senderware
  public readonly secrets    : Secrets

  public keypair  : KeyPair
  public address ?: string
  public socket  ?: WebSocket
  public filter   : Filter
  public options  : ClientDefaults
  public profile  : ProfileStore
  public tags     : Tag[][]
  public ready    : boolean

  public static defaults = {
    filter  : { since: Math.floor(Date.now() / 1000) },
    kind    : 29001,  // Default event type.
    tags    : [],     // Global tags for events.
    timeout : 5000    // Timeout on relay events.
  }

  constructor (config : ClientConfig = {}) {
    const { privkey = Hex.random(32), ...rest } = config
    super()
    this.id         = Hex.random(16)
    this.secrets    = new Secrets(this)
    this.middleware = new Transformer(this as NostrClient)
    this.senderware = new Transformer(this as NostrClient)

    this.keypair    = new KeyPair(privkey)
    this.options    = { ...NostrClient.defaults, ...rest }
    this.profile    = new ProfileStore(this)
    this.ready      = false
    this.tags       = this.options.tags

    this.filter     = {
      kinds: [ this.options.kind ],
      ...this.options.filter
    }

    this.middleware.use(validateEvent)
    this.middleware.use(this.secrets.decryptEvent)
    this.middleware.catch((err) => { this.emit('error', err) })

    this.senderware.use(this.secrets.encryptEvent)
    this.senderware.catch((err) => { this.emit('error', err) })
  }

  get initialized () : boolean {
    return this.socket !== undefined
  }

  get connected () : boolean {
    return (
      this.socket !== undefined &&
      this.socket.readyState === 1 &&
      this.ready
    )
  }

  get prvkey () : string {
    return this.keypair.prvkey
  }

  set prvkey (key : string | Uint8Array) {
    this.keypair = new KeyPair(key)
  }

  get pubkey () : string {
    return this.keypair.pubkey
  }

  private _openHandler (_event : WebSocket.Event) : void {
    /** Handles the websocket open event. */
    this.ready = true
    this.emit('info', `[ INFO ] Connected to: ${String(this.address)}`)
    this.emit('ready', this)
  }

  private async _messageHandler (
    { data } : WebSocket.MessageEvent
  ) : Promise<void> {
     /** Handles all websocket message events. */
    try {
      if (typeof data !== 'string') {
        // If data is not a string for some reason,
        // treat it as a buffer object instead.
        data = data.toString('utf8')
      }

      this.emit('debug', `[ DEBUG ] Socket received: ${data}`)

      const message = JSON.parse(data)
      const type    = String(message[0])

      if (type === 'EOSE' || type === 'EVENT') {
        // These two event types reference a subId.
        const subId = String(message[1])

        if (this.hasTopic(subId)) {
          // If the subscription exists in the store,
          if (type === 'EOSE') {
            // If end-of-subscription message
            // emit with the subId as topic.
            this.emit(subId, 'eose'); return
          }
          if (type === 'EVENT') {
            // If event message, process the raw event.
            const event = new SignedEvent(this, message[2])
            // Run the event through our middle-ware.
            const { ok, data } = await this.middleware.apply(event)
            // If data is ok, emit to the subId topic.
            if (ok) {
              this.emit(subId, 'event', data)
              this.emit(data.id, true, 'ok')
            }
            return
          }
          // Else, the subscription no longer exists.
          // We send a polite cancel message to the relay.
        } else { this.cancel(subId); return }
      }
      if (type === 'OK') {
        // If an ack message, break down the message.
        const [ eventId, ok, msg ] = message.slice(1)
        // Emit results with the eventId as a topic.
        this.emit(eventId, ok, msg); return
      }
      if (type === 'NOTICE') {
        // If we get a message from the relay, emit it directly.
        const msg = [ '[ INFO ] Notice: ', message.slice(1) ]
        this.emit('info', ...msg); return
      }
      // We shouldn't get to this point.
      throw TypeError(`Invalid type from relay: ${type}`)
    } catch (err) { this.emit('error', err) }
  }

  public async importSeed (string : string) : Promise<void> {
    this.keypair = await KeyPair.fromSecret(string)
  }

  public async connect (address ?: string) : Promise<NostrClient> {
    /** Configure our emitter for connecting to the relay network. */

    if (address !== undefined) {
      // If an address is provided, create a new socket with the address.
      this.ready   = false
      this.address = (address.includes('://')) ? address : 'wss://' + address
      this.socket  = new WebSocket(this.address)

      this.socket.addEventListener(
        /* Listener for the websocket open event. */
        'open', (event : WebSocket.Event) => { this._openHandler(event) }
      )

      this.socket.addEventListener(
        /* Listener for the websocket message event. */
        'message', (event : WebSocket.MessageEvent) => { void this._messageHandler(event) }
      )
    }

    if (this.address === undefined) {
      // If address is undefined, halt.
      throw new Error('Must provide a url to a relay!')
    }

    // Return a promise that includes a timeout.
    return new Promise((resolve, reject) => {
      const address = String(this.address)
      const timeout = this.options.timeout
      // If socket is connected, resovle early,
      if (this.connected) resolve(this)
      setInterval(() => { if (this.connected) resolve(this) }, 500)
      // If the connection fails to resolve in time, throw rejection.
      setTimeout(() => { reject(Error(`Connection to ${address} timed out!`)) }, timeout)
    })
  }

  public subscribe (filter ?: Filter) : Subscription {
    return new Subscription(this, filter)
  }

  public getChannel (topic : string, config ?: ChannelConfig) : EventChannel {
    return new EventChannel(this, topic, config)
  }

  public getStore (config ?: StoreConfig) : Store {
    return new Store(this, config)
  }

  public async query (
    filter  : Filter,
    sorter ?: Sorter<SignedEvent>
  ) : Promise<SignedEvent[]> {
    const query = new Query(this, filter)
    return query.all(sorter)
  }

  public async fetch (filter  : Filter) : Promise<SignedEvent | undefined> {
    const query = new Query(this, filter)
    return query.latest()
  }

  public cancel (subId : string) : void {
    /** Send a subscription cancellation notice to the relay. */
    const message = JSON.stringify([ 'CLOSE', subId ])
    this.socket?.send(message)
    this.clearEvent(subId)
    this.emit('info', '[ INFO ] Closing subscription:', subId)
  }

  public async publish (
    draft  : EventDraft
  ) : Promise<EventResponse> {
    /** Publish an event message to the relay. */

    const { ok, data } = await this.senderware.apply(draft)

    if (!ok) throw TypeError('Failed to publish event!')

    if (typeof data.content !== 'string') {
      data.content = JSON.stringify(data.content)
    }

    const signedEvent = await this.sign({
      // We are constructing a template of the event
      // that is needed for hashing and signing.
      content    : data.content,
      created_at : Math.floor(Date.now() / 1000),
      kind       : data.kind ?? this.options.kind,
      tags       : [ ...this.tags, ...data.tags ?? [] ],
      pubkey     : this.pubkey
    })

    return new Promise((resolve) => {
      const message = [ 'EVENT', signedEvent ]
      const timeout = this.options.timeout
      this.within(this.id, (ok : boolean, err : string) => {
        (ok)
          ? resolve([ undefined, signedEvent ])
          : resolve([ err, signedEvent ])
      }, timeout)
      setTimeout(() => {
        resolve([ 'timeout', signedEvent ])
      }, timeout)
      void this.send(JSON.stringify(message))
      this.emit('sent', signedEvent)
    })
}

  public async sign (
    event : EventTemplate
  ) : Promise<Event> {
    /**
     * Produce a hashed digest of the event data,
     * then return event with hash and signature.
     */
    const preimage = JSON.stringify([
      0,
      event.pubkey,
      event.created_at,
      event.kind,
      event.tags,
      event.content
    ])

    // Append event ID and signature
    const id  = await Hash.from(preimage).hex
    const sig = await this.keypair.sign(id)

    // Verify that the signature is valid.
    if (!await this.keypair.verify(id, sig)) {
      throw TypeError('Event failed verification!')
    }
    return { ...event, id, sig }
  }

  public async send (
    message : string
  ) : Promise<void> {
    /** Send a raw message payload to the relay. */
    await this.connect()
    // Send the serialized message to the relay.
    this.socket?.send(message)
    this.emit('debug', `[ DEBUG ] Socket sent: ${message}`)
  }

  public close () : void {
    this.emit('info', '[ INFO ] Client closing connection...')
    setTimeout(() => {
      if (this.connected) this.socket?.close()
      if (typeof process === 'object' && process !== undefined) process.exit()
    }, 2000)
  }
}
