# nostr-utils

A library of tools for building applications on the Nostr protocol.

Features:
 - Connect to a relay and manage multiple subscriptions.
 - Subscriptions are refreshed on connection to a new relay.
 - Create encrypted channels between clients using a shared secret.
 - Send packets of data to everyone using simple pub/sub events.
 - Customize and broadcast any kind of event. Create your own protocol.
 - Runs in node and the browser with very minimal dependencies (2).
 - Coming soon: Middleware and run-time schema validation (via zod).

## Installation

This package is designed to work in both the browser and nodejs.

```html
<!-- Browser import -->
<script src="https://unpkg.com/@cmdcode/nostr-utils"></script>
<script type="module"> 
  const { NostrClient } = window.nostrUtils
</script>
```
```js
// Commonjs import.
const { NostrClient } = require('@cmdcode/nostr-utils')

// ES6 import.
import { NostrClient } from '@cmdcode/nostr-utils'
```

## How to Use
To get started, we will first configure a client.

```ts
// Creating a new client is very simple.
const client = new NostrClient({ selfsub: true })

// You can change the private key of the client at any time.
client.prvkey = '168b760cee3ce1c768d39bf133bf5a9e030f47670b6fbf9211a8bb278f4b4f69'

// Or import a key from a seed phrase.
await client.importSeed('secretpassphrase')

client.on('ready', (client) => {
  // The ready event is emitted by the client 
  // once it has finished connecting to a relay.
  console.log('Connected to ' + client.address)
})
```
We can use the client to create subscription that listens for events.
```ts

// Creating a new subscription is easy.
const sub = client.subscribe({ 
  kinds: [ 29002 ], 
  since: Math.floor(Date.now() / 1000)
})

sub.on('ready', (sub) => {
  // Subscriptions also have a 'ready' event 
  // for handing the flow of your application.
  console.log('Subscribed with filter:', sub.filter)
  // Once we are subscribed, let's publish an event.
  client.publish({ kind: 29002, content: 'Hello, world!' })
  // We can also easily cancel a subscription.
  setTimeout(() => sub.cancel(), 5000)
})

sub.on('event', (event) => {
  // Subscriptions are simple emitter objects 
  // that will emit 'event' and 'eose' topics.
  console.log('New event:', event.toJSON())
})
```
Event channels tag each message with a topic name. When `secret` is used, all messages are end-to-end encryption via a hash of the secret phrase.
```ts

// You can create an event 'channel' by specifying a topic.
// We can also enable end-to-end encryption of all messages.
const channel = client.channel('secretchat', { secret: 'superisatestnet' })

channel.on('ready', (channel) => {
  // Topics also have a 'ready' event for
  // handing the flow of your application.
  console.log('Subscribed with filter:', channel.sub.filter)
  // Topics have their own interface for sending events.
  channel.send('spareGreeting', { name: 'Bob', planet: 'Earth' })
})

```
Channels feature a basic JSON-RPC interface, which can be used to create a custom protocol between subscribers.
```ts

channel.on('spaceGreeting', (content, event) => {
  const { name, planet } = content

  console.log(`Hello ${name} from planet ${planet}!`, content)
  console.log('Encrypted event data:', event.content)
})
```
Once you have everything setup, connect to a relay.
```ts
// Once you are connected to a relay, 
// the client 'ready' event will fire.
const address1 = 'wss://f930-206-217-205-114.ngrok.io'
await client.connect(address1)

// Your client will refresh all subscriptions 
// when ever you connect to a new relay.
const address2 = 'wss://f930-206-217-205-114.ngrok.io'
await client.connect(address2)

// If you wish to close your current connection:
client.close()
```
The main client is configurable with a few options.
```ts
export interface Config {
  filter  ?: Filter      // Default filter for subcriptions.
  kind    ?: number      // Default kind for published events.
  tags    ?: string[][]  // Default tags for published events.
  timeout ?: number      // The timeout (in ms) for connections.
  selfsub ?: boolean     // Whether to show self-published events.
}
```
There are a few log events available for subscription.
```ts
client.on('info', console.log)  // For verbose output.
client.on('error', console.log) // For caught exceptions.
client.on('debug', console.log) // For debug output.
```

## How it Works

The client works as typical nostr client. You can send messages to relays, publish events, and subscribe to event filters.

Clients, subscriptions and topics include a basic event emitter API. Methods include `.on()`, `.once()`, `.emit()` (local only), `.within()` (limited time) and `.remove()`.

Some helpful tips:
* For organizing sub-channels, try using paths in the topic name i.e 'root/topic/subtopic'.
* When sendind a topic event, you can provide a custom event template.
* You can use `topic.sub.on('event')` to listen to all events for a topic.

## Bugs / Suggestions

Please submit an issue ticket if you have any comments or suggestions.

## Contributions

This is a free and open-source project. All contributions are welcome!

## Resources

**Noble-secp256k1 Library**  
Used for identity and signing events.  
https://github.com/paulmillr/noble-secp256k1

**ws** (nodejs only)  
Used for websockets in node-js.  
https://github.com/websockets/ws

**Nostr Implementation Possibilities**  
https://github.com/nostr-protocol/nips
