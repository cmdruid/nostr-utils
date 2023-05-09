import { SignedEvent } from '../event/SignedEvent'
import { Event, Filter } from '../schema/events'

export class EventFilter {
  public filter : Filter

  public static apply = filterEvents
  public static check = checkEvents

  constructor  (filter : Filter = {}) {
    this.filter = filter
  }

  apply (events : SignedEvent[]) : Event[] {
    return EventFilter.apply(events, this.filter)
  }

  check (...events : SignedEvent[]) : boolean {
    return EventFilter.check(events, this.filter)
  }
}

function filterEvents (
  events : SignedEvent[],
  filter : Filter = {}
) : SignedEvent[] {
  const { authors, ids, kinds, since, until, limit, ...rest } = filter

  events.sort((a, b) => b.created_at - a.created_at)

  if (limit !== undefined && limit < events.length) {
    events = events.slice(0, limit)
  }

  if (ids !== undefined) {
    events = events.filter(e => ids.includes(e.id))
  }

  if (since !== undefined) {
    events = events.filter(e => e.created_at > since)
  }

  if (until !== undefined) {
    events = events.filter(e => e.created_at < until)
  }

  if (authors !== undefined) {
    events = events.filter(e => authors.includes(e.pubkey))
  }

  if (kinds !== undefined) {
    events = events.filter(e => kinds.includes(e.kind))
  }

  for (const key in rest) {
    if (key.startsWith('#')) {
      const tag  = key.slice(1, 2)
      const keys = rest[key]
      events = events.filter(e => {
        return e.tags.some(t => {
          return t[0] === tag && keys.includes(t[1])
        })
      })
    }
  }

  return events
}

function checkEvents (
  events : SignedEvent[],
  filter ?: Filter
) : boolean {
  return filterEvents(events, filter).length === events.length
}
