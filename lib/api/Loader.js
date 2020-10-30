import RoutingResourceLoader from 'hydra-toolbox/RoutingResourceLoader.js'
import { resource as bridge } from './bridge.js'
import { resource as device } from './device.js'
import { resource as state } from './state.js'

class Loader extends RoutingResourceLoader {
  constructor ({ basePath = '', deviceManager }) {
    super({ basePath })

    this.deviceManager = deviceManager

    this.resource('/', (path, params, { term }) => bridge(term, { deviceManager: this.deviceManager }))
    this.resource('/:mac', (path, { mac }, { term }) => device(term, { deviceManager: this.deviceManager, mac }))
    this.resource('/:mac/state', (path, { mac }, { term }) => state(term, { deviceManager: this.deviceManager, mac }))
  }
}

export default Loader
