import { Event, Filter } from '../schema/types'

export function filterEvents (
  events : Event[],
  filter : Filter = {}
) : Event[] {
  const { authors, ids, kinds, since, until, limit, ...rest } = filter

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
      const tag = key.slice(1, 2)
      events = events.filter(e => {
        return e.tags.some(t => t[0] === tag && t[1] === rest[key])
      })
    }
  }

  events.sort((a, b) => b.created_at - a.created_at)

  return (limit !== undefined && limit < events.length)
    ? events.slice(0, limit)
    : events
}
