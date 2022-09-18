const mongoose = require('mongoose')
const Schema = mongoose.Schema

const xbongoSchema = new Schema({
    chatid: {
        type: Number,
    }
}, {strict: false })

const model = mongoose.model('xbongoDB', xbongoSchema)
module.exports = model