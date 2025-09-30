const Post = require("../Modles/Post"); 
const User = require("../Modles/User"); 


const checkPostOwnership = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).select("+imagePublicId");

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Author can only modify their own posts; Admin can modify any post
    if (post.author.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You do not have permission" });
    }

    // Attach post to request for later use in controller (optional)
    req.post = post;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


const checkUserOwnership = async (req, res, next) => {
  try {
    const userIdParam = req.params.id; 
    const user = await User.findById(userIdParam).select("+profileid");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Normal users can only modify their own profile
    if (req.user.role === "user" && req.user.userId !== userIdParam) {
      return res.status(403).json({ success: false, message: " You cannot modify this profile" });
    }

    // Admins and Superadmins can modify any user → no restriction
    // Attach user to request for controller use (optional)
    req.targetUser = user;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


module.exports = { checkPostOwnership, checkUserOwnership}
