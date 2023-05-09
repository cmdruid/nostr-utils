import { NostrClient }  from '../class/client'
import { EventEmitter } from '../class/emitter'
import { ProfileStore } from '../event/ProfileStore'
import { Thread, ThreadConfig } from './thread'

export interface BoardConfig extends ThreadConfig {}

export class Board extends EventEmitter {
  public readonly profile : ProfileStore
  public readonly id      : string

  constructor (
    client : NostrClient,
    label  : string,
    modkey : string,
    config : ThreadConfig = {}
  ) {
    const boardId = modkey + '/' + label
    super(client, boardId, config)
    this.id = boardId
    this.thread  = new 
    this.profile = new ProfileStore(client, modkey)

    this.profile.store.on('update', (update) => {
      this.emit('update', this)
    })

    this.sub.filterware.use((filter) => {
      filter['m'] = modkey
    })
  }
}
