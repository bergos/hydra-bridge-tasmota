import clownface from 'clownface'
import rdf from 'rdf-ext'
import URL from 'hydra-toolbox/URL.js'
import { fromClownface, toClownface } from '../state.js'
import { decode as decodeMac } from '../mac.js'
import ns from '../namespaces.js'

async function resource (term, { deviceManager, mac }) {
  const device = [...deviceManager.devices.values()].find(device => device.mac === decodeMac(mac))

  if (!device) {
    return null
  }

  const resource = clownface({ dataset: rdf.dataset(), term })
    .addOut(ns.rdf.type, ns.dh.Device)
    .addOut(ns.rdfs.label, device.label)

  const state = resource
    .addOut(ns.dh.state, (new URL(term)).resolve('state').toTerm())
    .out(ns.dh.state)

  await toClownface(state, device)

  return {
    dataset: resource.dataset,
    object: device
  }
}

async function get (req, res) {
  res.dataset(req.hydra.resource.dataset)
}

async function put (req, res, next) {
  try {
    const input = clownface({ dataset: await req.dataset() })
    const device = req.hydra.resource.object

    await fromClownface(input, device)

    res.status(201).end()
  } catch (err) {
    next(err)
  }
}

export {
  resource,
  get,
  put
}
