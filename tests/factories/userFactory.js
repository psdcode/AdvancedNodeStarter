const mongoose = require('mongoose')
const User = mongoose.model('User')

mongoose.Promise = global.Promise

const userFactory = () => new User({}).save()

module.exports = userFactory
