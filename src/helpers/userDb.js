const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    id: String,
    sessionContexts: String,
    activateBot: Boolean
})

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;