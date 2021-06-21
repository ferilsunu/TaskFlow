const mongoose = require('mongoose')
const toDoSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
},
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
},

date: {
    type: Date,
    default: Date.now()
}




})

const todo_model = mongoose.model('toDo',toDoSchema)
module.exports = todo_model