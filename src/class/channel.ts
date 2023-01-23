import { NostrClient }  from './client'
import { EventEmitter } from './emitter'
import { Subscription } from './subscription'
import { SignedEvent }  from '../event/SignedEvent'

import {
  AckEnvelope,
  EventDraft,
  Json,
  ChannelConfig
} from '../schema/types'
import { EventSchema } from '../schema/events'

interface EventRecord { content : Json, event : SignedEvent }

export class EventChannel extends EventEmitter<{
  'ready' : [ EventChannel ]
  [ k : string ] : any[]
}> {
  public readonly client  : NostrClient
  public readonly topic   : string
  public readonly sub     : Subscription
  public readonly history : Map<string, EventRecord[]>

  public template : EventDraft

  constructor (
    client : NostrClient,
    topic  : string,
    config : ChannelConfig = {}
  ) {
    const { secret, secretKey, sharedPub }     = config
    const { filter, template  = { tags: [] } } = config

    super()
    this.topic     = topic
    this.client    = client
    this.sub       = new Subscription(this.client, filter)
    this.template  = { ...template, secret, secretKey, sharedPub }
    this.history   = new Map()

    this.sub._updateHook = this._updateHook.bind(this)

    this.sub.on('ready', () => { this.emit('ready', this) })

    this.sub.on('event', (event : SignedEvent) => {
      void this._eventHandler(event)
    })
  }

  private async _eventHandler (event : SignedEvent) : Promise<void> {
    const schema = EventSchema.channel
    const [ eventName, payload ] = schema.parse(event.content)
    this._updateHistory(eventName, payload, event)
    this.emit(eventName, payload, event)
  }

  private async _updateHook () : Promise<void> {
    this.sub.filter['#t'] = [ this.topic ]
  }

  private _updateHistory (
    eventName : string,
    content   : Json,
    event     : SignedEvent
  ) : void {
    if (!this.history.has(eventName)) {
      this.history.set(eventName, [])
    }
    this.history.get(eventName)?.push({ content, event })
  }

  public async send (
    eventName : string,
    payload   : Json,
    template  : EventDraft = this.template
  ) : Promise<AckEnvelope | undefined> {
    const content = JSON.stringify([ eventName, payload ])
    template.tags?.push([ 't', await this.topic ])
    return this.client.publish({ ...template, content })
  }
}
