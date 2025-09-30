const Post = require('../Modles/Post');
const User = require('../Modles/User')
const mongoose = require('mongoose');
const {uploadToCloudinary} = require('../Utils/uploadCloudinary');
const cloudinary = require('../Utils/Cloudinary')

//create Post
async function createPost(req, res){
    try {
        const {title, content, category} = req.body;
        const userid = req.user.userId;

        let postImg = "";
        let imagePublicId = "";
        if (req.file) {
            let result = await uploadToCloudinary(req.file.buffer, "blog");
            //console.log(result);
            postImg = result.secure_url;
            imagePublicId = result.public_id;
        }

        const newPost = new Post({
            title,
            content,
            category,
            postImage : postImg,
            imagePublicId : imagePublicId,
            author : userid
        });
        await newPost.save();
        res.status(201).json({ success: true, message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: 'Post not created ', error: error.message});
    }
}

//Homepage post(all post)
async function getAllPost(req, res){
   try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
        };

        const result = await Post.paginate({}, options);

        res.status(200).json({
            success: true,
            message: "All Posts",
            count: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            result: result.docs,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

//Viewing single post(clicked post)
async function singlePost(req, res){
 try {
   const id = req.params.id;
   //console.log(id);

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

   const existingPost = await Post.findOne( { _id : id });

   if(!existingPost){
        return res.status(401).json({ success : false, message : "No post found"});
   }
   res.status(200).json({ success : true, message : "Post found", existingPost })
 } catch (error) {
    res.status(500).json({ success : false, message : error.message || "Server eror"});
 }
}

//Post by specific author
async function getUserPost(req, res){
    try {
        const userId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const user = await User.findById(userId);
        if(!user){
           return res.status(400).json({success : false , message : "No user found"})
        }

        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
        };

        const result = await Post.paginate({ author : userId }, options);

        if(!result){
            return res.status(401).json({ success : false, message : "No post found"});
        }
        res.status(200).json({ success: true, message: `All Post of ${user.name}`,count: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            result: result.docs,
        });    
    } catch (error) {
        res.status(500).json({ success : false, message : error.message || "Server eror"});
    }

}

//Search by category, title, author
async function searchPost(req, res){
    try {
        const {title, category, author} = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const query = {};

        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
        };
             
        if (title && title.trim() !== "") {
            query.title = { $regex: title.trim(), $options: 'i' }; 
        }
        if (category && category.trim() !== "") {
            query.category = category.trim();
        }

        if (author && mongoose.Types.ObjectId.isValid(author)) {
            query.author = author;
        }

        const result = await Post.paginate(query, options);

        if (result.docs.length === 0) {
            return res.status(404).json({ success: false, message: "No matching posts found." });
        }

        res.status(200).json({ success: true, message: "All Posts",
            count: result.totalDocs,
            totalPages: result.totalPages,
            currentPage: result.page,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            result: result.docs,
        });   
    } catch (error) {
        res.status(500).json({ success : false, message : error.message || "Server eror"});
    }
}

//Delete Post by id
async function deletePost(req, res){
    try {
    const post = req.post;

    if (post.imagePublicId) {
       const result = await cloudinary.uploader.destroy(post.imagePublicId);
       console.log("Cloudinary delete result:", result);
    }

    await Post.findByIdAndDelete(postid);
    
    res.status(200).json({ success: true, message: "Post deleted" });

    } catch (error) {
        res.status(500).json({ success : false, message : error.message || "Server eror"});
    }
}

//Update Post by id
async function updatePost(req, res) {
  try {
    const { title, content, category } = req.body;
    const existingPost = req.post;
    
    let updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;

    // Upload new image if provided
    if (req.file) {
      if (existingPost.imagePublicId) {
        const result = await cloudinary.uploader.destroy(existingPost.imagePublicId);
        console.log("Cloudinary image delete:", result);      
      }

      // Upload new image
      const result = await uploadToCloudinary(req.file.buffer, "blog");
      updates.postImage = result.secure_url;
      updates.imagePublicId = result.public_id;
    }

    const updatedPost = await Post.findByIdAndUpdate(existingPost._id, updates, { new: true });

    res.status(200).json({success: true, message: "Post updated successfully", post: updatedPost});

  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error"});
  }
}

//Post:- like for specific post 
 const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // unlike
      post.likes.pull(userId);
    } else {
      // like
      post.likes.push(userId);
    }

    post.likesCount = post.likes.length;
    await post.save();

    res.json({ liked: !alreadyLiked, likesCount: post.likesCount});
  } catch (err) {
    res.status(500).json({ error: err.message, message : "Failed to toggle like"});
  }
};

// GET likecount for specific post
const getLikes = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("likes", "name profilePic") // show who liked
      .select("likes likesCount");

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({likesCount: post.likesCount, likes: post.likes,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch likes" });
  }
};

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: req.user.userId,   
      text: req.body.text,
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ 
      message: "Comment added", 
      commentsCount: post.comments.length 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("comments.user", "name email"); 
      // populate to get commenter’s details (instead of just userId)

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ postId: post._id, commentsCount: post.comments.length, comments: post.comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteComment = async (req, res) => {
   try {
    const  commentId  = req.params;
    const post = req.post;
    // const post = await Post.findById(postId);
    // if(!post){
    //     return res.status(404).json({ success: false, message: "No posts found." });
    // }

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // if(post.author.toString() !== req.user.userId && req.user.role !== "admin"){
    //     return res.status(404).json({ success: false, message: "Not allowed" });       
    // }

    post.comments.pull({ _id: commentId });   
    await post.save();
    
    res.status(200).json({ success: true,  message: "Comment deleted successfully" });

    } catch (error) {
        res.status(500).json({ success : false, message : error.message || "Server eror"});
    }
}

module.exports = {
    createPost,
    getAllPost,
    singlePost,
    getUserPost,
    searchPost,
    deletePost,
    updatePost,
    toggleLike,
    getLikes,
    addComment,
    getComments,
    deleteComment,
}