import { readFile } from 'fs/promises'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import bridgeTasmota from './index.js'
import UnifiNetworkMonitor from './lib/UnifiNetworkMonitor.js'

const config = {
  unifi: {
    url: process.env.UNIFI_URL,
    user: process.env.UNIFI_USER,
    password: process.env.UNIFI_PASSWORD
  },
  devices: process.env.DEVICE_FILE
}

async function main () {
  config.devices = config.devices ? JSON.parse(await readFile(config.devices)) : []

  const monitor = new UnifiNetworkMonitor({
    url: config.unifi.url,
    user: config.unifi.user,
    password: config.unifi.password
  })

  const app = express()

  app.use(morgan('combined'))
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT'],
    exposedHeaders: ['link']
  }))
  app.use('/tasmota', await bridgeTasmota({ ...config, monitor }))
  app.listen(9000)
}

main()
