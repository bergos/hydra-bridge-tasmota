import { EventEmitter } from 'events'
import delay from 'promise-the-world/delay.js'
import { Scheduler } from 'scheduli'
import Scanner from 'ping-scanner'

class PingNetworkMonitor extends EventEmitter {
  constructor ({ networks, hosts, interval = 5000, remain = 20000, scheduler = new Scheduler() } = {}) {
    super()

    this.hosts = new Map()

    this.scanner = new Scanner({ networks, hosts, concurrent: 128, timeout: 5000 })
    this.scanner.on('alive', host => this.alive(host))
    this.scanner.on('timeout', host => this.timeout(host))

    this.interval = interval
    this.remain = remain

    this.scheduler = scheduler
    this.scheduler.start()

    this.job = this.scheduler.job(() => this.scan(), { name: 'Ping Network Monitor' })
    this.job.on('finish', job => job.start())
  }

  start () {
    this.job.start()
  }

  stop () {
    this.job.stop()
  }

  async scan () {
    await this.scanner.scan()
    await delay(this.interval)
  }

  alive (host) {
    const found = this.hosts.get(host)

    if (found) {
      found.lastSeen = Date.now()

      return
    }

    const values = { host, lastSeen: Date.now() }

    this.hosts.set(host, values)

    this.emit('up', values)
  }

  timeout (host) {
    const found = this.hosts.get(host)

    if (!found) {
      return
    }

    if (Date.now() - found.lastSeen < this.remain) {
      return
    }

    this.hosts.delete(host)

    this.emit('down', found)
  }
}

export default PingNetworkMonitor
