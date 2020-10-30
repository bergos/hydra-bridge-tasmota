import clownface from 'clownface'
import URL from 'hydra-toolbox/URL.js'
import rdf from 'rdf-ext'
import { encode as encodeMac } from '../mac.js'
import ns from '../namespaces.js'

async function resource (term, { deviceManager }) {
  const resource = clownface({ dataset: rdf.dataset(), term })
    .addOut(ns.rdf.type, ns.hydra.Container)
    .addOut(ns.rdf.type, ns.dh.Bridge)
    .addOut(ns.rdfs.label, 'Tasmota Bridge')

  for (const device of deviceManager.devices.values()) {
    const label = device.label || `${device.host} - ${device.mac}`

    resource.addOut(ns.hydra.member, (new URL(term)).resolve(`${encodeMac(device.mac)}`).toTerm(), member => {
      member.addOut(ns.rdfs.label, label)
    })
  }

  return {
    dataset: resource.dataset
  }
}

export {
  resource
}
