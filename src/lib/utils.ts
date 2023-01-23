import { getSharedSecret } from '@noble/secp256k1'
import { Hex } from './format'

export async function sleep (ms : number = 500) : Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getSharedKey (
  privKey : string | Uint8Array,
  recvPub : string | Uint8Array
) : Uint8Array {
  return getSharedSecret(
    Hex.normalize(privKey),
    Hex.normalize(recvPub)
  )
}
