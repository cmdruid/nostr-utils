import { NostrClient }  from '../class/client'
import { EventEmitter } from '../class/emitter'
import { Subscription } from './subscription'
import { SignedEvent }  from '../event/SignedEvent'
import { EventSchema }  from '../schema/events'

import {
  EventDraft,
  Json,
  ChannelConfig,
  EventResponse
} from '../schema/types'

interface EventRecord { content : Json, event : SignedEvent }

export class Channel extends EventEmitter<{
  'ready' : [ Channel ]
  [ k : string ] : any[]
}> {
  public readonly client  : NostrClient
  public readonly label   : string
  public readonly sub     : Subscription
  public readonly history : Map<string, EventRecord[]>

  public template : EventDraft

  constructor (
    client : NostrClient,
    label  : string,
    config : ChannelConfig = {}
  ) {
    const { secret, secretKey, sharedPub } = config
    const { filter, template } = config

    super()
    this.label     = label
    this.client    = client
    this.sub       = new Subscription(this.client, filter)
    this.template  = { ...template, secret, secretKey, sharedPub }
    this.history   = new Map()

    this.sub.filterware.use((filter) => {
      filter['#l'] = [ this.label ]
      return filter
    })

    this.sub.on('ready', () => { this.emit('ready', this) })

    this.sub.on('event', (event : SignedEvent) => {
      void this._eventHandler(event)
    })
  }

  private async _eventHandler (event : SignedEvent) : Promise<void> {
    const schema = EventSchema.channel
    const [ eventName, content ] = schema.parse(event.json)
    if (!this.history.has(eventName)) {
      this.history.set(eventName, [])
    }
    this.history.get(eventName)?.push({ content, event })
    this.emit(eventName, content, event)
  }

  public async send (
    eventName : string,
    payload   : Json,
    template  : EventDraft = {}
  ) : Promise<EventResponse> {
    template = { tags: [], ...this.template }
    const content = JSON.stringify([ eventName, payload ])
    template.tags?.push([ 'l', this.label ])
    return this.client.publish({ ...template, content })
  }
}
