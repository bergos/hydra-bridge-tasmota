import Tasmota from 'tasmota'
import isTasmotaDevice from './isTasmotaDevice.js'

class DeviceManager {
  constructor ({ devices = [], monitor } = {}) {
    this.configs = devices || []
    this.monitor = monitor

    this.devices = new Map()

    this.monitor.on('up', values => this.up(values))
    this.monitor.on('down', values => this.down(values))
  }

  async up (values) {
    if (this.devices.has(values.host)) {
      return
    }

    const device = await isTasmotaDevice(values.host)

    if (!device) {
      return
    }

    const config = this.configs.find(config => config.mac === device.mac || config.host === device.host)
    const object = new Tasmota(`http://${device.host}/`)

    await object.detect()

    this.devices.set(device.host, { ...device, ...config, object })
  }

  down (values) {
    this.devices.delete(values.host)
  }
}

export default DeviceManager
