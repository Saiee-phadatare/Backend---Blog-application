const jwt = require('jsonwebtoken');

exports.VerifyToken = (req, res, next) => {
    const token = req.cookies.token; 
    if (!token) {
        return res.status(401).json({ success: false, message: "Please login first" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        //console.log(decoded);
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

