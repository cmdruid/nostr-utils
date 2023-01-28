import { Cipher }      from '../class/cipher'
import { NostrClient } from '../class/client'
import { SignedEvent } from '../event/SignedEvent'
import { Hash }        from '../class/hash'
import { EventDraft }  from '../schema/types'
import { Hex }         from '../lib/format'

type CipherPair = [ string, Uint8Array ]

export class Secrets extends Map<string, Uint8Array> {
  public  readonly client : NostrClient

  constructor (client : NostrClient) {
    super()
    this.client = client
  }

  async addSecret (secret : string) : Promise<CipherPair> {
    const key   = await Hash.from(secret).raw
    const label = await new Hash(key).hex
    this.set(label, key)
    return [ label, key ]
  }

  async addKey (secretKey : string | Uint8Array) : Promise<CipherPair> {
    const key   = Hex.normalize(secretKey)
    const label = await new Hash(key).hex
    this.set(label, key)
    return [ label, key ]
  }

  async addPub (sharedPub : string | Uint8Array) : Promise<CipherPair> {
    const pair  = this.client.keypair
    const key   = await new Hash(pair.getSharedKey(sharedPub)).raw
    const label = await new Hash(key).hex
    this.set(label, key)
    return [ label, key ]
  }

  async checkDraft (
    draft : EventDraft
  ) : Promise<CipherPair | undefined> {
    const { secret, secretKey, sharedPub } = draft
    if (secret !== undefined) {
      return this.addSecret(secret)
    } else if (sharedPub !== undefined) {
      return this.addPub(sharedPub)
    } else if (secretKey !== undefined) {
      return this.addKey(secretKey)
    } else { return undefined }
  }

  encryptEvent = async (
  draft  : EventDraft
) : Promise<EventDraft | null> => {
  const cipher = await this.checkDraft(draft)
  if (
    cipher !== undefined &&
    draft.content !== undefined
  ) {
    const [ label, key ] = cipher
    draft.content = await Cipher.encrypt(draft.content, key)
    draft.tags = draft.tags ?? []
    draft.tags.push([ 's', label ])
  }

  return draft
}

  decryptEvent = async (
    event  : SignedEvent
  ) : Promise<SignedEvent | null> => {
    // Verify that the signature is valid.
    if (event.isEncrypted) {
      const secretKey = event.secret
      if (secretKey !== undefined) {
        await event.decrypt(secretKey)
      }
    }
    return event
  }
}
