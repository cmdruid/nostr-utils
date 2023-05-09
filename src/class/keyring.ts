import { Cipher }      from '../class/cipher'
import { NostrClient } from '../class/client'
import { SignedEvent } from '../event/SignedEvent'
import { Hash }        from '../class/hash'
import { EventDraft }  from '../schema/types'
import { Hex }         from '../lib/format'
import { KeyPair } from './keypair'

type KeyPairEntry = [ string, Uint8Array ]

export class KeyRing extends Map<string, KeyPair> {
  private readonly _root : KeyPair

  constructor (prvkey : string | Uint8Array) {
    super()
    this._root = new KeyPair(prvkey)
  }

  _getPair (keypair : KeyPair) : KeyPair {
    this.set(keypair.pubkey, keypair)
    return keypair
  }

  getKey (prvkey : string | Uint8Array) : KeyPair {
    const pubkey  = KeyPair.getPub(prvkey)
    let   keypair = this.get(pubkey)

    if (keypair === undefined) {
      keypair = new KeyPair(prvkey)
      this._getPair(keypair)
    }

    return keypair
  }

  async getPhrase (phrase : string) : Promise<KeyPair> {
    const prvkey = await Hash.from(phrase).raw
    return this.getKey(prvkey)
  }

  async getTweak (tweak : string) : Promise<KeyPair> {
    const buffer = Uint8Array.of(...this._root.pr, ...Text.encode(key))
    const newkey = await new Hash(buffer).raw
    return new KeyPair(newkey)
  }
    const keypair = await this._root.derive(key)
    return this.addPair(keypair)
  }

  async checkDraft (
    draft : EventDraft
  ) : Promise<KeyPair | undefined> {
    const { keyphrase, keytweak, prvkey } = draft
    if (prvkey !== undefined) {
      const pubkey  = KeyPair.getPub(prvkey)
      const keypair = this.get(pubkey)
      return (keypair !== undefined)
        ? keypair
        : this.addKey(prvkey)
    } else if (keytweak !== undefined) {
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


function getPublicKey()