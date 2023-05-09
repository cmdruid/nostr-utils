// Import the client and (optional) Keypair utility.
import { NostrClient } from '../src/index'

const client = new NostrClient()

client.on('info', console.log)

await client.connect('wss://jiggytom.ddns.net')

const query = await client.query({ authors: [ '4229c21f0101abc3ba45233e176e975fa9e671bb18a6722bdf7726ba25445ff9' ], kinds : [ 0 ]})

console.log(query)