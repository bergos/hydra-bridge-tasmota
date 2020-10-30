function decode (mac) {
  return mac.slice(0, 2) + ':' +
    mac.slice(2, 4) + ':' +
    mac.slice(4, 6) + ':' +
    mac.slice(6, 8) + ':' +
    mac.slice(8, 10) + ':' +
    mac.slice(10, 12)
}

function encode (mac) {
  return mac.split(':').join('')
}

export {
  decode,
  encode
}
