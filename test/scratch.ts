// Import the client and (optional) Keypair utility.
import { NostrClient } from '../src/index'
import { Store }       from '../src/view/store'
import { sleep }       from '../src/lib/utils'

// Creating a new client is very simple.
const alice = new NostrClient()
const bob = new NostrClient()

alice.on('ready', () => {
  alice.secrets.addSecret('seekrit')
})

bob.on('ready', () => {
  bob.secrets.addSecret('seekrit')
})

const aStore = new Store(alice, { topic: 'test', secret: 'seekrit' })
const bStore = new Store(bob, { topic: 'test', secret: 'seekrit' })

aStore.sub.on('event', (event) => {
  // console.log('Alice heard:', event.id.slice(0,5), event.created_at, event.content, event.kind)
})

bStore.sub.on('event', (event) => {
  // console.log('Bob heard:', event.id.slice(0,5), event.created_at, event.content, event.kind)
})

aStore.on('ready', async (store) => {
  store.set('alice', 'Alice says hello!')
  await sleep(5000)
  console.log('alice:', store.get('bob'))
  await sleep()
  console.log(aStore.export())
  console.log(aStore.prevCommit)
  alice.close()
})

bStore.on('ready', async (store) => {
  store.set('bob', 'Bob says hello!')
  await sleep(5000)
  console.log('bob:', store.get('alice'))
  await sleep()
  console.log(bStore.export())
  console.log(bStore.prevCommit)
  bob.close()
})

// Uncomment these in order to see various log info.
alice.on('info', console.log)
bob.on('info', console.log)
// alice.on('debug', console.log)
// bob.on('debug', console.log)
// alice.on('error', console.log)

// The address of the relay.
const address = 'wss://nostr.zebedee.cloud'

// The initial connect event will 
// set everything into motion.
await alice.connect(address)
await bob.connect(address)

// Close your connection with the relay.


