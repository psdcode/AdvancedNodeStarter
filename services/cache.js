const mongoose = require('mongoose')
const util = require('util')
const redis = require('redis')
const keys = require('../config/keys')

const exec = mongoose.Query.prototype.exec
const client = redis.createClient(keys.redisUrl)
client.hget = util.promisify(client.hget)

// Custom method for enabling caching on Query instance
mongoose.Query.prototype.cache = function(options) {
  this.useCache = true
  // Make sure key is string
  this.hashKey = JSON.stringify(options.key || '')

  // Allow chaining
  return this
}

// Overwrite default Query#exec method
mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments)
  }

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  })

  const cacheValue = await client.hget(this.hashKey, key)
  if (cacheValue) {
    const doc = JSON.parse(cacheValue)

    // If Array, Hydrate it
    const cacheResult = Array.isArray(doc)
      ? doc.map(obj => new this.model(obj))
      : new this.model(doc)
    return cacheResult
  }

  // Run & return original exec method
  const dbResult = await exec.apply(this, arguments)
  client.hset(this.hashKey, key, JSON.stringify(dbResult), 'EX', 1000)

  return dbResult
}

function resetCache(options = {}) {
  client
}

module.exports = {
  clearHash(hashKey = '') {
    client.del(JSON.stringify(hashKey))
  },
}
