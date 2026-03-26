const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');;
    
    // Step 2: Check if no token

    if(!token) return res.status(401).json({msg:'No token, authorization denied'});

    // Step 3: Verify token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; //Remember when we created the token we put { user: { id: user.id } } inside it. After verifying,
        // we decode that data and attach it to the request so any route can access req.user.id to know who is making the request.
        next();
    }catch(err){
        res.status(401).json({msg:'Token is not valid'});
    }
};