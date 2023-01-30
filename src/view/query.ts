import { NostrClient }    from '../class/client'
import { SignedEvent }    from '../event/SignedEvent'
import { Filter, Sorter } from '../schema/types'

export class Query {
  public readonly client : NostrClient
  public filter : Filter

  constructor (
    client : NostrClient,
    filter : Filter
  ) {
    this.client = client
    this.filter = filter
  }

  async _sub (filter = this.filter) : Promise<SignedEvent[]> {
    const selection : SignedEvent[] = []
    const sub = this.client.subscribe(filter)
    sub.on('event', (event) => {
      console.log(event.id)
      selection.push(event)
    })
    return new Promise(resolve => {
      const cancel  = () : void => { sub.cancel(); resolve(selection) }
      const timeout = this.client.options.timeout
      const timer   = setTimeout(cancel, timeout)
      sub.on('eose', () => {
        clearTimeout(timer)
        cancel()
      })
      void sub.update()
    })
  }

  async latest () : Promise<SignedEvent> {
    return this
      ._sub({ ...this.filter, limit: 1 })
      .then(subs => subs[0])
  }

  async all (sorter ?: Sorter<SignedEvent>) : Promise<SignedEvent[]> {
    const subs = await this._sub(this.filter)
    if (sorter !== undefined) subs.sort(sorter)
    return subs
  }
}
