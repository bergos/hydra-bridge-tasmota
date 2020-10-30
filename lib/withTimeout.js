import Promise from 'bluebird'

async function withTimeout (fn, timeout, value) {
  return Promise.resolve().then(fn).timeout(timeout).catch(() => value)
}

export default withTimeout
