import { NostrClient }  from '../class/client'
import { Transformer }  from '../class/transformer'
import { Subscription } from './subscription'
import { SignedEvent }  from '../event/SignedEvent'

import {
  EventDraft,
  Filter,
  EventResponse
} from '../schema/types'

type Senderware = Transformer<EventDraft, Thread>

export interface ThreadConfig {
  filter    ?: Filter
  template  ?: EventDraft
  secret    ?: string
  secretKey ?: string | Uint8Array
  sharedPub ?: string | Uint8Array
}

export class Thread {
  public readonly client     : NostrClient
  public readonly label      : string
  public readonly sub        : Subscription
  public readonly senderware : Senderware

  public template : EventDraft

  constructor (
    client : NostrClient,
    label  : string,
    config : ThreadConfig = {}
  ) {
    const { secret, secretKey, sharedPub } = config
    const { filter, template } = config

    this.label      = label
    this.client     = client
    this.sub        = new Subscription(this.client, filter)
    this.senderware = new Transformer(this as Thread)
    this.template   = { ...template, secret, secretKey, sharedPub }

    this.sub.filterware.use((filter) => {
      filter['#l'] = [ this.label ]
      return filter
    })

    this.senderware.use((template) => {
      template.tags?.push([ 'l', this.label ])
      return template
    })

    this.senderware.catch((...err) => {
      this.client.emit('error', `[ ERROR ] ${this.sub.slug} Thread failed to publish:`, ...err)
    })
  }

  get filter () : Filter {
    return this.sub.filter
  }

  set filter (filter : Filter) {
    this.sub.filter = filter
  }

  async fetch (
    filter ?: Filter
  ) : Promise<SignedEvent[]> {
    return this.sub.fetch(filter)
  }

  async publish (
    template : EventDraft = {}
  ) : Promise<EventResponse> {
    const draft = { ...this.template, ...template }
    const [ ok, finalDraft ] = await this.senderware.apply(draft)
    if (!ok) return [ 'failed senderware', finalDraft ]
    return this.client.publish(finalDraft)
  }
}
