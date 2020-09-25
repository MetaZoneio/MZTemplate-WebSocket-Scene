
export class WSScene implements ISystem {
  META_ID = 0

  mzAPI = null
  host = null
  player = null

  metaEntity = null

  // WebSocket
  socket:WebSocket = null
  players = []
  maxPlayers = 5

  // Player weapon
  playerIndex = 0
  playerData = null
  playerSound = ''
  input = {
    click: false
  }

  constructor(mzAPI, host) {
    // Save api
    this.mzAPI = mzAPI;

    // Initialize the player
    this.player = Camera.instance

    // Create game global position
    this.metaEntity = new Entity()
    this.metaEntity.addComponent(new Transform({
      position: new Vector3(8, 0, 8),
    }))
    engine.addEntity(this.metaEntity)


    // Players
    for(let i=0; i<this.maxPlayers; i++) {
      // Player Entity
      let playerEntity = new Entity()
      playerEntity.addComponent(new Transform({
        position: new Vector3(0, 0, 0),
        scale: new Vector3(1, 1, 1)
      }))

      // Hit Box
      let playerBox = new Entity()
      playerBox.addComponent(new Transform({
        position: new Vector3(0, 0 + 1, 0),
        scale: new Vector3(1, 2, 1)
      }))
      playerBox.addComponent(new Material())
      playerBox.getComponent(Material).albedoColor = new Color4(1, 1, 1, 0.5)
      playerBox.getComponent(Material).transparencyMode = 2
      playerBox.addComponent(new BoxShape())
      playerBox.getComponent(BoxShape).withCollisions = false
      playerBox.setParent(playerEntity)

      // Name floating
      let playerName = new Entity()
      playerName.addComponent(new Transform({
        position: new Vector3(0, 2.5, 0),
        scale: new Vector3(0.2, 0.2, 0.2)
      }))
      playerName.addComponent(new TextShape('Name'))
      playerName.getComponent(TextShape).color = Color3.White()
      playerName.getComponent(TextShape).fontWeight = 'bold'
      playerName.addComponent(new Billboard(false, true, false))
      playerName.setParent(playerEntity)

      this.players.push({
        name: '',
        data: null,
        baseEntity: playerEntity,
        boxEntity: playerBox,
        nameEntity: playerName,
      })
    }


    // WebSocket Server
    this.socket = new WebSocket(JSON.parse(host.host_data).wss.server)
    // Read WebSocket Server Broadcast
    this.socket.onmessage = event => this.readMessage(event)
    // Read WebSocket errors
    this.socket.onerror = error => {
      log('WebSocket error:', error)
    }


    // Instance the input object
    const input = Input.instance
    // Mouse down event
    input.subscribe('BUTTON_DOWN', ActionButton.POINTER, false, e => {
      // Mouse click pressed
      this.input.click = true
    })
    // Mouse up event
    input.subscribe('BUTTON_UP', ActionButton.POINTER, false, e => {
      // Mouse click released
      this.input.click = false
    })
  }

  readMessage(event) {
    //log('WebSocket message received:', event.data)
    const data = JSON.parse(event.data)

    // Update all players
    for(let i=0; i<data.players.length || i<this.maxPlayers; i++) {
      // Update player identifier
      this.players[i].data = data.players[i]

      // Add to world
      if(!this.players[i].baseEntity.alive && this.players[i].data)
        engine.addEntity(this.players[i].baseEntity)
      // Remove from world
      else if(this.players[i].baseEntity.alive && !this.players[i].data)
        engine.removeEntity(this.players[i].baseEntity)


      if(this.players[i].data) {
        // Update player's name
        this.players[i].nameEntity.getComponent(TextShape).value = data.players[i].name
        // Update player's position
        this.players[i].baseEntity.getComponent(Transform).position.set(
          data.players[i].x,
          0,
          data.players[i].z
        )
        // My player update
        if(this.mzAPI.user.name == data.players[i].name) {
          this.playerIndex = i
          this.playerData = data.players[i]
        }
      }
    }
  }

  update(dt: number) {
    // When connected
    if(this.socket.readyState == WebSocket.OPEN) {
      // WebSocket Send
      this.socket.send(JSON.stringify({
        action: 'updatePlayer',
        data: {
          game_id: this.mzAPI.parcel.plot_x+','+this.mzAPI.parcel.plot_y,
          name: this.mzAPI.user.name,
          x: this.player.position.x,
          z: this.player.position.z,
        }
      }));
    }
  }

  refreshHost(host) {
    // Save host info
    this.host = host

    // Parse host data
    if(this.host.host_data) {
      let host_data = JSON.parse(this.host.host_data)
      // Game position
      this.metaEntity.getComponent(Transform).position.set(
        host_data.wss.position.x,
        host_data.wss.position.y,
        host_data.wss.position.z
      )
      // Game scale
      this.metaEntity.getComponent(Transform).position.set(
        host_data.wss.scale.x / 16,
        host_data.wss.scale.y / 10,
        host_data.wss.scale.z / 16
      )
    }
  }

}
