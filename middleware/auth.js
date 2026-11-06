// Authentication Middleware

// Check Customer Login
function customerAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first"
        });
    }

    next();
}

// Check Admin Login
function adminAuth(req, res, next) {
    if (!req.session || !req.session.adminId) {
        return res.status(401).json({
            success: false,
            message: "Admin login required"
        });
    }

    next();
}

module.exports = {
    customerAuth,
    adminAuth
};
