const WebSocket = require('ws')
const Cast = require('../helpers/cast')
const files = require('../helpers/files')
const { ACTIONS } = require('../constants/sockets')

class Sockets {
  constructor (server, app) {
    this.wss = new WebSocket.Server({ server, path: '/ws' })
    this.app = app
    this.app.wss = this.wss
    this.cast = new Cast(this)

    this.onConnection()
  }

  onConnection () {
    const app = this.app
    this.wss.on('connection', (ws) => {
      // connection is up, let's add a simple simple event
      ws.on('message', (message) => {
        try {
          const command = JSON.parse(message)
          const { action } = command
          this[`${action}`](command, ws, app)
        } catch (error) {
          ws.send(JSON.stringify({ error }))
        }
      })
      this.onClientConnected(ws)
    })
  }

  onClientConnected (ws) {
    const app = this.app
    this.castDeviceList({ action: ACTIONS.ACTION_CAST_DEVICE_LIST }, ws, app)
    this.fileList({ action: ACTIONS.ACTION_FILE_LIST }, ws, app)
    this.streamList({ action: ACTIONS.ACTION_STREAM_LIST }, ws, app)
    this.castList({ action: ACTIONS.ACTION_CAST_LIST }, ws, app)
  }

  broadcast (message) {
    this.wss.clients.forEach(client => {
      client.send(JSON.stringify(message))
    })
  }

  fileList (command, ws, app) {
    ws.send(JSON.stringify({
      action: ACTIONS.ACTION_FILE_LIST,
      value: files.listFiles(app._filesPath).map(i => `${process.env.PUBLIC_URL}/files/${i}`)
    }))
  }

  playbookStart (command, ws, app) {
    console.log(command)
  }

  streamAdd (command, ws, app) {
    const config = app._config
    let error
    const value = config.addStream(command)
    if (!value) {
      error = 'There was an error adding the stream'
    }
    ws.send(JSON.stringify({
      action: ACTIONS.ACTION_STREAM_ADD,
      error,
      value
    }))
  }

  streamList (command, ws, app) {
    ws.send(JSON.stringify({
      action: ACTIONS.ACTION_STREAM_LIST,
      error: false,
      value: app._playbooks.streams
    }))
  }

  castDeviceList (command, ws, _app) {
    const devices = this.cast.devices
    const deviceList = Object.keys(devices).map(deviceId => ({
      friendlyName: devices[deviceId].friendlyName,
      deviceId: devices[deviceId].host
    }))
    ws.send(JSON.stringify({
      action: ACTIONS.ACTION_CAST_DEVICE_LIST,
      value: deviceList
    }))
  }

  castStart (command, ws, _app) {
    const { url, deviceId } = command
    this.cast.castMedia(deviceId, url, (error, device) => {
      ws.send(JSON.stringify({
        action: ACTIONS.ACTION_CAST_START,
        error,
        value: `Playing ${url} on your ${device.friendlyName}`
      }))
    })
  }

  castStop (command, ws, _app) {
    const { deviceId } = command
    this.cast.castStop(deviceId, (error, device) => {
      ws.send(JSON.stringify({
        action: ACTIONS.ACTION_CAST_STOP,
        error,
        value: `Stopping ${device.friendlyName}`
      }))
    })
  }

  castList (command, ws, app) {
    app._config.casts.forEach(c => {
      this.cast.castStatus(c.deviceId, () => {})
    })

    ws.send(JSON.stringify({
      action: ACTIONS.ACTION_CAST_LIST,
      error: false,
      value: app._config.casts
    }))
  }
}

module.exports = Sockets
