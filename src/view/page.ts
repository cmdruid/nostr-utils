import { NostrClient } from '../class/client'
import { SignedEvent } from '../event/SignedEvent'
import { Filter }      from '../schema/types'
import { Query }       from './query'

export class Page extends Query {
  public readonly prevStart : number
  public readonly prevStop  : number
  public nextStart : number
  public nextStop  : number

  constructor (
    client : NostrClient,
    filter : Filter,
    start = Math.floor(Date.now() / 1000),
    stop  = Math.floor(Date.now() / 1000) - 60000
  ) {
    const { limit = 100 } = filter
    super(client, { limit, ...filter })
    this.prevStart = start
    this.prevStop  = stop
    this.nextStart = start
    this.nextStop  = stop
  }

  _updateStamps (
    events : SignedEvent[]
  ) : void {
    const head = events.at(0)
    const tail = events.at(-1)
    if (head !== undefined) {
      this.nextStart = head.created_at + 1
    }
    if (tail !== undefined) {
      this.nextStop = tail.created_at - 1
    }
  }

  async fetch () : Promise<SignedEvent[]> {
    const events = await this.sub.fetch()
    this._updateStamps(events)
    return events.filter(e => {
      return (
        e.created_at > this.nextStart - 1 &&
        e.created_at < this.nextStop  + 1
      )
    })
  }

  async prevPage (limit ?: number) : Promise<Page> {
    const filter = {
      ...this.filter,
      since : this.prevStart,
      until : this.prevStop
    }
    if (limit !== undefined) filter.limit = limit
    return new Page(this.client, filter, this.prevStart, this.prevStop)
  }

  async nextPage (limit ?: number) : Promise<Page> {
    const filter = {
      ...this.filter,
      until: this.nextStop
    }
    if (limit !== undefined) filter.limit = limit
    return new Page(this.client, filter, this.nextStart, this.nextStop)
  }
}
