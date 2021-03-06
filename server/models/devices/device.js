const constants = require('./constants')

class Device {
  constructor (type, name, params, status, config) {
    this.type = type
    this.name = name
    this.params = params
    this.status = status || constants.DEVICE_STATUS.UNKNOWN
    this.config = config

    this.bindRunners()
  }

  bindRunners () {
    switch (this.type) {
      case constants.DEVICE_TYPES.CHROMECAST: {
        const Chromecast = require('./chromecast')
        this.runner = new Chromecast(this)
        break
      }
      case constants.DEVICE_TYPES.EWELINK: {
        const Ewelink = require('./ewelink')
        this.runner = new Ewelink(this)
        break
      }
    }
  }

  toJson () {
    return {
      type: this.type,
      name: this.name,
      params: this.params
    }
  }
}

module.exports = Device
