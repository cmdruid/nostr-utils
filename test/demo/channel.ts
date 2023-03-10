// Import the client and (optional) Keypair utility.
import { NostrClient } from '../../src/index'

// Creating a new client is very simple.
const client = new NostrClient()

// Change the private key of the client at any time.
client.prvkey = '168b760cee3ce1c768d39bf133bf5a9e030f47670b6fbf9211a8bb278f4b4f69'

await client.importSeed('superisatestnet')

client.on('ready', (client) => {
  // The ready event is emitted by a client 
  // once it has connected to a relay.
  console.log('Connected to ' + client.address)
})

// Creating a new subscription is easy.
const sub = client.subscribe({ 
  kinds   : [ 29002 ], 
  since   : Math.floor(Date.now() / 1000)
})

sub.on('ready', (sub) => {
  // Subscriptions also have a 'ready' event 
  // for handing the flow of your application.
  console.log('Subscribed with filter:', sub.filter)
  // Once we are subscribed, let's relay an event.
  client.publish({ kind: 29002, content: 'Hello, world!' })
  // We can also easily cancel a subscription.
  setTimeout(() => sub.cancel(), 5000)
})

sub.on('event', (event) => {
  // Subscriptions are simple emitter objects 
  // that will emit 'event' and 'eose' topics.
  console.log('New event:', event.toJSON())
})

// You can create an event 'channel' by specifying a topic.
// We can also enable end-to-end encryption of all messages.
const channel = client.getChannel('secretchat', { secret: 'superisatestnet' })

channel.on('ready', (channel) => {
  // Topics also have a 'ready' event for
  // handing the flow of your application.
  console.log('Subscribed with filter:', channel.sub.filter)
  channel.send('hello', { name: 'Bob', planet: 'Earth' })
})

channel.on('hello', (content) => {
  // Topics provide their own internal event bus,
  // so anyone can publish and subscribe to your
  // custom events within the topic channel.
  const { name, planet } = content
  console.log(`Hello ${name} from planet ${planet}!`, content)
})

channel.on('*', (eventName, _content, event) => {
  // All emitters have an 'ALL' event, which will
  // subscribe you to all events on that emitter.

  // If encryption is enabled, the contents of the
  // topic channel will be group end-to-end encrypted.
  if (eventName !== 'ready') {
    console.log('Intercepted event:', eventName)
    console.log('Encrypted event data:', event.content)
  }
})

// Uncomment these in order to see various log info.
// client.on('info', console.log)
// client.on('error', console.log)

// The address of the relay.
const address = 'wss://nostr.zebedee.cloud'

// The initial connect event will 
// set everything into motion.
await client.connect(address)

// Close your connection with the relay.
client.close()
