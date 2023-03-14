const mongoose = require('mongoose')
const Schema = mongoose.Schema

const countSchema = new Schema({
    count: {
        type: Number
    },
    id: {
        type: String,
        default: 'shemdoe'
    }
})

const model = mongoose.model('Redirectors', countSchema)
module.exports = model