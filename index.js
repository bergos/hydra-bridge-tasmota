import { dirname, join } from 'path'
import express from 'express'
import once from 'lodash/once.js'
import hydraBox from 'hydra-box/middleware.js'
import Api from 'hydra-box/Api.js'
import EsmLoader from 'rdf-loader-code/ecmaScriptModule.js'
import Loader from './lib/api/Loader.js'
import DeviceManager from './lib/DeviceManager.js'
import PingNetworkMonitor from './lib/PingNetworkMonitor.js'

async function middleware (config) {
  const bridgePath = dirname((new URL(import.meta.url)).pathname)

  if (!config.monitor) {
    config.monitor = new PingNetworkMonitor({ networks: config.networks, hosts: config.hosts })
  }

  const deviceManager = new DeviceManager({ ...config })

  config.monitor.start()

  // wait for the first request to figure out the used basePath
  const init = once(async ({ basePath }) => {
    const api = await Api.fromFile(join(bridgePath, './lib/api/api.ttl'), {
      path: '/api',
      codePath: bridgePath
    })

    // hydra-box doesn't register the ESM loader yet by default
    EsmLoader.register(api.loaderRegistry)

    const loader = new Loader({ basePath, deviceManager })

    return hydraBox(api, { loader })
  })

  const app = express()

  app.locals.deviceManager = deviceManager

  app.use(async (req, res, next) => {
    (await init({ basePath: req.baseUrl }))(req, res, next)
  })

  return app
}

export default middleware
