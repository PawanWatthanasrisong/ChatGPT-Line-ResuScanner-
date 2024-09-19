import mongoose  from 'mongoose';
const {Schema} = mongoose;

const userSchema = new Schema({
    id: String,
    sessionContexts: String,
    activateBot: Boolean,
    chatHistory: Array,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now},
})

const UserModel = mongoose.model('User', userSchema);

export default  UserModel;