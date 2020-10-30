import clamp from 'lodash/clamp.js'
import colorMath from 'rawdevjs-math-color'

function isValidNumber (value) {
  if (typeof value !== 'number' || isNaN(value) || value === Infinity) {
    return false
  }

  return true
}

function mapNumber (value, inMin, inMax, outMin, outMax, outClamp = false) {
  const mapped = (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin

  if (outClamp) {
    return clamp(mapped, outMin, outMax)
  }

  return mapped
}

function fromColor ({ x, y, temperature, brightness = 1.0 }) {
  if (isValidNumber(x) && isValidNumber(y) && !isValidNumber(temperature)) {
    temperature = colorMath.temperatureFromXY({ x, y })
  }

  const v = mapNumber(temperature, 2800, 6500, 0, 255, true)
  const warm = Math.round((255 - v) * brightness)
  const cold = Math.round(v * brightness)

  return { red: 0, green: 0, blue: 0, warm, cold }
}

function toColor ({ red, green, blue, cold, warm }) {
  const brightness = (cold + warm) / 255
  const v = cold / brightness
  const temperature = mapNumber(v, 0, 255, 2800, 6500)
  const { x, y } = colorMath.xyFromTemperature(temperature, 0)

  return { x, y, temperature, brightness }
}

export {
  fromColor,
  toColor
}
