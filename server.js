import { readFile } from 'fs/promises'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import bridgeTasmota from './index.js'

const config = {
  networks: process.env.NETWORKS.split(','),
  devices: process.env.DEVICE_FILE
}

async function main () {
  config.devices = config.devices ? JSON.parse(await readFile(config.devices)) : []

  const app = express()

  app.use(morgan('combined'))
  app.use(cors({
    origin: true,
    credentials: true,
    methods: '*',
    exposedHeaders: ['link']
  }))
  app.use('/tasmota', await bridgeTasmota({ ...config }))
  app.listen(9000)
}

main()
