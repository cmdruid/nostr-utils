import { z } from 'zod'

import { EventSchema } from '../events'

const { event, content } = EventSchema

const profile = z.object({
  name    : z.string(),
  about   : z.string(),
  picture : z.string().url(),
  nip05   : z.string().email()
}).partial().catchall(content)

const template = event.extend({
  content: profile
})

export const ProfileSchema = {
  profile,
  template
}

export type Profile      = z.infer<typeof profile>
export type ProfileEvent = z.infer<typeof template>
