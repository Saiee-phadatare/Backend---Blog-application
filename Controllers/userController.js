const User = require('../Modles/User');
const jwt = require('jsonwebtoken');
const Post = require('../Modles/Post');
const {uploadToCloudinary} = require('../Utils/uploadCloudinary');
const cloudinary = require('../Utils/Cloudinary')
const { hash, compare } = require('../Middlewares/Hashing');
const {signupSchema , signinSchema } = require('../Utils/Validation');


//add user
async function Registration(req, res) {
    const {name, email, password, gender, bio} = req.body;

   try {
    const { error } = signupSchema.validate({name, email, password, gender, bio});
    if(error) {
        return res.status(400).json({ success:false, message:error.details[0].message});
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({success:false, message: "User already exists!"});
    }

    const hashedpassword = await hash(password);

    let profileid = null;
    let profilePic = null;
    if (req.file) {
            let result = await uploadToCloudinary(req.file.buffer, "users");
            //console.log(result);
            profilePic = result.secure_url;
            profileid = result.public_id;
    }
    
    const newUser = new User({
        name,
        email,
        password : hashedpassword,
        profilePic : profilePic,
        profileid : profileid,
        gender,
        bio
    });
    await newUser.save();

    return res.status(200).json({success:true, message : "Account created"})

   } catch (error) {
     console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: "Failed to signup", error: error.message });
   }
}

//login 
async function Signin (req, res){
    const { email, password} = req.body;
 try{
    const { error } = signinSchema.validate({email, password});
    if(error) {
        return res.status(400).json({ success:false, message:error.details[0].message});
    }

    const existingUser = await User.findOne({email}).select("+password");
    if(!existingUser){
        return res.status(400).json({success:false, message: "User does not exists!"});
    }

    const comparepassword = compare(password, existingUser.password);
    if(!comparepassword){
        return res.status(200).json({success: true, message : "Invalid password"});
    }

    const { password: pw, ...userData } = existingUser._doc;

    const token = jwt.sign(
    {   userId: existingUser._id,
        role: existingUser.role,
        email: existingUser.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }  
    );

    //console.log(existingUser);
    res.cookie("token", token, {
        httpOnly: true,     // Prevent access via JavaScript (mitigates XSS)
        secure: true,        // Only send over HTTPS
        sameSite: "Strict",
    })

    return res.status(200).json({success : true, message : "Log In successfully", user : userData} )

 }catch(error){
    console.error(error);
    res.status(500).json({success:false , message:"Failed to signin"})
 }
}

//get all user
async function getAllUser (req, res){
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 }
    };

    const result = await User.paginate({}, options);

    const users = result.docs.map(user => {
      const { password, email, ...rest } = user._doc;
      return rest;
    });

    res.status(200).json({success: true, message: "All Users", count: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      users: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


//Get single user by id
async function getSingleUsre(req, res){
    try{
    const userid = req.params.id;
    if(!userid){
        return res.status(404).json({ success: false, message : "No author id"});
    } 
    const authorid = await User.findById(userid);
    if(!authorid){
        return res.status(404).json({ success: false, message : "No author found"});  
    }

    const {password : pw, email : em, ...data} = authorid._doc;
    
    res.status(200).json({ success: true, message : "Author found" , data});

    }catch(error) {
    res.status(500).json({success:false , message: error.message})  
    }
}

//delete user by id 
async function deleteUser(req, res){
    try {
       const user = req.targetUser;

        if (user.profileid) {
          const result = await cloudinary.uploader.destroy(user.profileid);
          console.log("Cloudinary delete result:", result);
        }

        await User.findByIdAndDelete(user._id);
        await Post.deleteMany( { author : user._id }); //delete all post of that user
        
    res.status(200).json({ success: true, message: "User deleted", post: "also delete all post" });

    } catch (error) {
        res.status(500).json({ success : false, message : error.message || "Server erorr"});
    }
}

//Update user by id
async function updateUser(req, res) {
    try{
        const {name, bio} = req.body;
        const existingUser = req.targetUser;
        const update = {};

        if(name) update.name = name;
        if(bio) update.bio = bio;

        // Upload new image if provided
        if (req.file) {
          //delete old image
            if (existingUser.profileid) {
                const result = await cloudinary.uploader.destroy(existingUser.profileid);
                console.log("Cloudinary image delete:", result);      
            }
            // Upload new image
            const result = await uploadToCloudinary(req.file.buffer, "users");
            update.profilePic = result.secure_url;
            update.profileid = result.public_id;
        }

        const UpdatedUser = await User.findByIdAndUpdate(existingUser._id , update, { new: true });
        
      res.status(200).json({ success : true, message : "User updated Successfully", UpdatedUser});
    }catch (error) {
        res.status(500).json({ success : false, message : error.message || "Server erorr"});    
    }
}

const logout = async (req, res) => {
  try {
        res.clearCookie("Authorization", {
        httpOnly: true,
        secure: false,   // true in prod
        sameSite: "Strict"
        });
return res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookmark= async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const postId = req.params.id;

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.savedPosts.includes(postId)) {
      // Unsave
      user.savedPosts.pull(postId);
      await user.save();
      return res.json({ message: "Post unsaved" });
    } else {
      // Save
      user.savedPosts.push(postId);
      await user.save();
      return res.json({ message: "Post saved" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getbookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("savedPosts");
    if (!user) return res.status(404).json({ error: "User not found" });

    const bookmark = user.savedPosts;

    res.json({success : "true", message : "All bookmarked post", count: bookmark.length ,result: bookmark });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};



module.exports = {
    Registration,
    Signin,
    deleteUser,
    updateUser,
    getAllUser,
    getSingleUsre,
    logout,
    bookmark,
    getbookmark
}