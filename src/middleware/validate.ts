import { SignedEvent } from '../event/SignedEvent'

export async function validateEvent (
  event  : SignedEvent
) : Promise<SignedEvent | null> {
  // Verify that the signature is valid.
  return (await event.isValid)
    ? event
    : null
}
