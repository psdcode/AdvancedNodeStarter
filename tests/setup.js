const mongoose = require('mongoose')
const keys = require('../config/keys')
require('../models/User')

mongoose.Promise = global.Promise
// Add useMongoClient to avoid deprecation warning
mongoose.connect(keys.mongoURI, { useMongoClient: true })
