const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    authenticateToken: function authenticateToken(req, res, next) {
        const token = req.cookies.token; 
        console.log('Token from cookies:', token);

        if (!token) {
            console.log('login fail (no token)');
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        } else {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    console.log('login fail (token cannot verify)');
                    return res.status(403).json({ message: 'Invalid token. Please log in again.' });
                } else {
                    req.user = user;
                    next();
                }
            });
        }
    },
};
