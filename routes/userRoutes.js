const express = require("express");

const { Registration, Signin, deleteUser, updateUser, getAllUser, getSingleUsre, logout, bookmark, getbookmark} = require('../Controllers/userController');
const { VerifyToken } = require("../Middlewares/verifyToken");
const checkRole = require("../Middlewares/rbac");
const upload = require('../Middlewares/multer');
const {checkUserOwnership} = require('../Middlewares/ownership');

const route = express.Router();

route.post('/signup', upload.single("profilePic"), Registration);
route.post('/signin', Signin);
route.get('/all', VerifyToken, checkRole('admin'), getAllUser);
route.get('/single/:id', getSingleUsre);
route.delete('/delete/:id', VerifyToken, checkRole("user","admin"),checkUserOwnership, deleteUser);
route.patch('/update/:id', VerifyToken, checkRole("user","admin"), checkUserOwnership, upload.single("profilePic"), updateUser);
route.post('/logout' , logout);

//bookmark
route.post("/bookmark/:id", VerifyToken, bookmark);
route.get("/bookmark",VerifyToken, getbookmark);

module.exports = route