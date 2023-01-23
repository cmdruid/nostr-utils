import { z } from 'zod'

import { EventSchema } from '../events'

const { event } = EventSchema
const prvregex  = /^[a-zA-Z0-9+/]+={0,2}\?iv=[a-zA-Z0-9+/]+={0,2}$/
const encrypted = z.string().regex(prvregex)

const template  = event.extend({
  content: encrypted
})

export const PrivateSchema = {
  encrypted,
  template
}

export type PrivateEvent = z.infer<typeof template>
