const Buffer = require('safe-buffer').Buffer
const Keygrip = require('keygrip')
const keys = require('../../config/keys')

const keygrip = new Keygrip([keys.cookieKey])

const sessionFactory = user => {
  // user._id is an object containing id
  // turn it into string to extract id
  const session = {
    passport: {
      user: String(user._id),
    },
  }
  const sessionStringified = JSON.stringify(session)
  const sessionBuffered = Buffer.from(sessionStringified).toString('base64')

  const sig = keygrip.sign(`session=${sessionBuffered}`)

  return {
    sig,
    session: sessionBuffered,
  }
}

module.exports = sessionFactory
