import { SignedEvent } from '../event/SignedEvent'
import { NostrClient } from '../class/client'

export async function decryptEvent (
  event  : SignedEvent,
  client : NostrClient
) : Promise<SignedEvent | null> {
  // Verify that the signature is valid.
  if (event.isEncrypted) {
    const [ hTag ] = event.getTags('s')
    if (hTag !== undefined) {
      const [ hint ] = hTag
      const key = client.secrets.get(String(hint))
      if (key !== undefined) {
        const exp = event.toJSON()
        exp.content = await event.decrypt(key)
        return new SignedEvent(client, event)
      }
    }
  }
  return event
}
