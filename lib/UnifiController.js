import { Agent } from 'https'
import { join } from 'path'
import fetch from 'nodeify-fetch'

class UnifiController {
  constructor ({ baseUrl, user, password }) {
    this.baseUrl = baseUrl
    this.user = user
    this.password = password
    this.agent = new Agent({ rejectUnauthorized: false })
  }

  parseCookies (res) {
    const raw = res.headers.get('set-cookie')

    if (!raw) {
      return
    }

    this.cookies = raw.split(',').map(raw => raw.split(';')[0]).join(';')
  }

  async request (path, { method, body, noAuthRequired = false } = {}) {
    if (!noAuthRequired && !this.cookies) {
      await this.login()
    }

    const url = new URL(this.baseUrl)
    url.pathname = join(url.pathname, 'api', path)

    const headers = {
      cookie: this.cookies
    }

    if (body) {
      headers['content-type'] = 'application/json; chartset=utf-8'
      body = JSON.stringify(body)
    }

    const res = await fetch(url.toString(), { agent: this.agent, method, headers, body })

    this.parseCookies(res)

    const result = await res.json()

    if (result.meta.rc === 'error') {
      throw new Error(result.meta.msg)
    }

    return result.data
  }

  async login () {
    return this.request('login', {
      noAuthRequired: true,
      method: 'POST',
      body: {
        username: this.user,
        password: this.password,
        remember: true,
        strict: true
      }
    })
  }

  async sta () {
    return this.request('s/default/stat/sta')
  }
}

export default UnifiController
