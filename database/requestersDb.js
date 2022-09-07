const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reqSchema = new Schema({
    chatid: {
        type: Number,
    }
}, {strict: false })

const model = mongoose.model('requesters', reqSchema)
module.exports = model