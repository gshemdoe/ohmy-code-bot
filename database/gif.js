const mongoose = require('mongoose')
const Schema = mongoose.Schema

const gifSchema = new Schema({
    nano: {
        type: String
    },
    gifId: {
        type: String
    }
}, { timestamps: true, strict: false})

const model = mongoose.model('gifsModel', gifSchema)
module.exports = model