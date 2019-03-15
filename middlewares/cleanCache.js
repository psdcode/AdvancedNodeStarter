const { clearHash } = require('../services/cache')

module.exports = async (req, res, next) => {
  // Trick with async & await next to make middleware act on the completion of the last function in route chain
  await next()
  clearHash(req.user.id)
}
