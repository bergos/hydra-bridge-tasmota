import { fromColor, toColor } from './color.js'
import ns from './namespaces.js'

async function fromClownface (cf, device) {
  const state = {}

  const powerState = cf.out(ns.dh.powerState).term

  if (ns.dh.On.equals(powerState)) {
    state.powerState = true
  }

  if (ns.dh.Off.equals(powerState)) {
    state.powerState = false
  }

  const color = cf.out(ns.dh.color)

  if (color.term) {
    if (color.out(ns.dh.colorx).term && color.out(ns.dh.colory).term) {
      const x = parseFloat(color.out(ns.dh.colorx).value)
      const y = parseFloat(color.out(ns.dh.colory).value)
      const brightness = parseFloat(color.out(ns.dh.brightness).value)

      state.color = fromColor({ x, y, brightness })
    } else if (color.out(ns.dh.colorTemperature).term) {
      const temperature = parseFloat(color.out(ns.dh.colorTemperature).value)
      const brightness = parseFloat(color.out(ns.dh.brightness).value)

      state.color = fromColor({ temperature, brightness })
    }
  }

  if (state.powerState) {
    if (state.color && typeof device.object.color === 'function') {
      await device.object.color(state.color)
    }

    if (typeof device.object.on === 'function') {
      await device.object.on()
    }
  } else {
    if (typeof device.object.off === 'function') {
      await device.object.off()
    }
  }
}

async function toClownface (cf, device) {
  cf.addOut(ns.rdf.type, ns.dh.State)

  if (typeof device.object.isOn === 'function') {
    cf.addOut(ns.dh.powerState, await device.object.isOn() ? ns.dh.On : ns.dh.Off)
  }

  if (typeof device.object.power === 'function') {
    cf.addOut(ns.dh.power, (await device.object.power()).current)
  }

  if (typeof device.object.color === 'function') {
    const color = toColor(await device.object.color())

    cf.addOut(ns.dh.color, ptr => {
      ptr
        .addOut(ns.dh.colorx, color.x)
        .addOut(ns.dh.colory, color.y)
        .addOut(ns.dh.colorTemperature, color.temperature)
        .addOut(ns.dh.brightness, color.brightness)
    })
  }
}

export {
  fromClownface,
  toClownface
}
