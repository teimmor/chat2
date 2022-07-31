const { isInteger, toInteger } = require('lodash')
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: String
})

const userModel = mongoose.model('User', userSchema)
module.exports = userModel