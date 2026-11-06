const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({
            username,
            active: true
        });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin username or password"
            });
        }

        req.session.adminId = admin._id;

        admin.lastLogin = new Date();
        await admin.save();

        res.json({
            success: true,
            message: "Admin login successful"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Admin login failed"
        });
    }
});

// Check Admin Login
router.get("/me", adminAuth, async (req, res) => {
    const admin = await Admin.findById(req.session.adminId)
        .select("-password");

    res.json({ success: true, admin });
});

// Admin Logout
router.post("/logout", adminAuth, (req, res) => {
    req.session.adminId = null;

    res.json({
        success: true,
        message: "Admin logged out successfully"
    });
});

module.exports = router;
