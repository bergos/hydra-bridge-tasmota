import fetch from 'nodeify-fetch'
import withTimeout from './withTimeout.js'

async function isTasmotaDevice (host, { timeout = 1000 } = {}) {
  return withTimeout(async () => {
    const res = await fetch(`http://${host}/in`)

    if (!res.ok) {
      return false
    }

    const content = await res.text()

    if (content.includes('tasmota')) {
      const match = content.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/)
      const mac = match && match[0].toLowerCase()

      return {
        host,
        mac
      }
    }

    return false
  }, timeout, false)
}

export default isTasmotaDevice
