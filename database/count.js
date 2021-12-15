const mongoose = require('mongoose')
const Schema = mongoose.Schema

const countSchema = new Schema({
    times: {
        type: Number
    }
})

const model = mongoose.model('analytics', countSchema)
module.exports = model