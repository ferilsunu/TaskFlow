const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
name: {
        type: String,
        required: true
},


email:{
    type: String,
    required: true
},

password:{
    type: String,
    required: true
},

designation: {
    type: String,
    default: 'user'
},

pic: {
    type: String,
    default: 'default.jpg'
}



})

const user_model = mongoose.model('user',userSchema)
module.exports = user_model