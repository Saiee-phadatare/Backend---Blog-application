const express = require("express");
const { createPost, getAllPost, singlePost, getUserPost, searchPost, deletePost, updatePost, toggleLike, getLikes, addComment, getComments, deleteComment} = require('../Controllers/postController');
const { VerifyToken } = require('../Middlewares/verifyToken');
const checkRole = require("../Middlewares/rbac");
const upload = require('../Middlewares/multer');
const { checkPostOwnership }= require('../Middlewares/ownership');

const route = express.Router();

route.post('/create', VerifyToken, checkRole("user", "admin"), upload.single("postImg"), createPost);
route.get('/all', getAllPost);
route.get('/single/:id', singlePost);
route.get('/search', searchPost);
route.get('/userpost/:id', VerifyToken, getUserPost);
route.delete('/delete/:id', VerifyToken, checkRole("user", "admin"),checkPostOwnership, deletePost);
route.patch('/update/:id', VerifyToken, upload.single('postImg'),checkPostOwnership, updatePost);

//likes
route.post("/like/:postId",VerifyToken, toggleLike);
route.get("/likes/:postId",checkRole("admin"), getLikes);


//comments
route.post("/comment/:postId",VerifyToken, addComment);
route.get("/comments/:postId", getComments);
route.delete('/:id/comments/:commentId', VerifyToken, checkRole("user", "admin"), checkPostOwnership,deleteComment);

module.exports = route;