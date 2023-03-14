const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chanSchema = new Schema({
    chan_id: {
        type: Number
    },
    owner: {
        type: String
    },
    title: {
        type: String
    }
})

const model = mongoose.model('oh_channels', chanSchema)
module.exports = model