import { EventEmitter } from 'events'
import delay from 'promise-the-world/delay.js'
import { Scheduler } from 'scheduli'
import UnifiController from './UnifiController.js'

class UnifiNetworkMonitor extends EventEmitter {
  constructor ({ url, user, password, interval = 5000, scheduler = new Scheduler() } = {}) {
    super()

    this.hosts = new Map()

    this.controller = new UnifiController({ baseUrl: url, user, password })

    this.interval = interval

    this.scheduler = scheduler
    this.scheduler.start()

    this.job = this.scheduler.job(() => this.update(), { name: 'Unifi Network Monitor' })
    this.job.on('finish', job => job.start())
  }

  start () {
    this.job.start()
  }

  stop () {
    this.job.stop()
  }

  async update () {
    const clients = await this.controller.sta()

    const current = clients.filter(client => !client.is_wired).reduce((current, client) => {
      return current.set(client.ip, { mac: client.mac, host: client.ip })
    }, new Map())

    for (const [host, values] of this.hosts) {
      if (!current.has(host)) {
        this.hosts.delete(host)
        this.emit('down', values)
      }
    }

    for (const [host, values] of current) {
      if (!this.hosts.has(host)) {
        this.hosts.set(host, values)
        this.emit('up', values)
      }
    }

    await delay(this.interval)
  }
}

export default UnifiNetworkMonitor
