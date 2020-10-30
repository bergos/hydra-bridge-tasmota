import clownface from 'clownface'
import rdf from 'rdf-ext'
import { fromClownface, toClownface } from '../state.js'
import { decode as decodeMac } from '../mac.js'

async function resource (term, { dataset = rdf.dataset(), deviceManager, mac }) {
  const device = [...deviceManager.devices.values()].find(device => device.mac === decodeMac(mac))

  if (!device) {
    return null
  }

  const resource = clownface({ dataset, term })

  await toClownface(resource, device)

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
