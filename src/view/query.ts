import { NostrClient }    from '../class/client'
import { SignedEvent }    from '../event/SignedEvent'
import { Filter, Sorter } from '../schema/types'
import { Subscription }   from './subscription'

export class Query {
  public readonly client : NostrClient
  public readonly sub    : Subscription

  constructor (
    client : NostrClient,
    filter : Filter
  ) {
    const { cacheSize = 100 } = filter
    this.client = client
    this.sub = new Subscription(client, { ...filter, cacheSize })
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

  async latest () : Promise<SignedEvent> {
    return this
      .fetch({ ...this.filter, limit: 1 })
      .then(subs => subs[0])
  }

  async all (sorter ?: Sorter<SignedEvent>) : Promise<SignedEvent[]> {
    const subs = await this.fetch()
    if (sorter !== undefined) subs.sort(sorter)
    return subs
  }
}
