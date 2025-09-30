const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select : false
    },
    profilePic: {
        type: String,
        default: 'null', 
    },
    profileid: {
        type :String,
        select : false
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other',
    },
    bio: {
        type: String,
    },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    role: {
        type: String,
        enum: ['user','author','admin','superadmin'], 
        default: 'user'
    },
}, { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

const User = mongoose.model('User', userSchema);
module.exports = User;
