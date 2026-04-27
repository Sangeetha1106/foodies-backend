const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            console.error("[AuthMiddleware] Token verification failed:", error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // Temporarily permissive for testing
    console.log("[AuthMiddleware] No token found. Continuing in permissive mode.");
    next();
};

const adminProtect = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, adminProtect };
