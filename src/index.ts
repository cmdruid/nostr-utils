import { Cipher }      from '@/class/cipher'
import { Hash }        from '@/class/hash'
import { KeyPair }     from '@/class/keypair'
import { NostrClient } from '@/class/client'
import { Hex, Text, Base64 } from '@/lib/format'

export default NostrClient

export * from '@/class/client'
export * from '@/class/subscription'
export * from '@/class/topic'
export * from '@/class/event/EmitEvent'
export * from '@/class/event/SignedEvent'
export * from '@/schema/types'

export const Utils = {
  Base64,
  Cipher,
  Hash,
  Hex,
  KeyPair,
  Text
}
