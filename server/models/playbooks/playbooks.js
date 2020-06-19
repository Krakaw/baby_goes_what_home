const fs = require('fs')
const Playbook = require('./playbook')
const Item = require('./item')
const DEFAULT_CONFIG = []
class Playbooks {
  constructor (configFile) {
    this.configFilePath = configFile
    this.playbooks = this.loadConfig().map(playbook => new Playbook(playbook.name, playbook.items))
  }

  addPlaybook (playbook) {
    if (this.playbooks.find(p => p.name === playbook.name)) {
      throw Error('Playbook by that name already exists')
    }
    this.playbooks.push(playbook.toJson())
    this.saveConfig(this.playbooks)
  }

  get streams () {
    let streams = []
    this.playbooks.forEach(playbook => {
      streams = streams.concat(playbook.items.filter(item => item.type === Item.TYPES.TYPE_RTSP_STREAM))
    })
    return streams
  }

  loadConfig () {
    let contents = ''

    if (fs.existsSync(this.configFilePath)) {
      contents = fs.readFileSync(this.configFilePath)
    } else {
      contents = this.saveConfig(DEFAULT_CONFIG)
    }
    return JSON.parse(contents)
  }

  saveConfig (config) {
    const data = JSON.stringify(config, null, 2)
    fs.writeFileSync(this.configFilePath, data)
    return data
  }
}

module.exports = Playbooks
