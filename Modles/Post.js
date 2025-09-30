const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = mongoose.Schema({
    title : {
        type: String,
        required: true,
        trim: true
    },
    content : {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Tech', 'Music', 'News', 'Games', 'Personal', 'Other'],
        default: 'Other'
    },
    postImage : { //url of image form cloudinary
        type: String,
        default : "null"
    },
    imagePublicId: {  //public_id of image from cloudinary (user for deleting images)
        type : String,
        select : false
    },
    author : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    likesCount: { 
        type: Number, 
        default: 0 
    },
    comments: [commentSchema],
    commentsCount: {
         type: Number, 
         default: 0 
    },
}, { timestamps: true });

postSchema.pre("save", function (next) {
  this.commentsCount = this.comments.length;
  next();
});

postSchema.plugin(mongoosePaginate);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;


