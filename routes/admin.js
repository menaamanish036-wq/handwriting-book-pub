const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const router = express.Router();

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const admin = await Admin.findOne({
      username: username.trim()
    });

    if (!admin || !admin.active) {
      return res.status(401).json({
        message: "Invalid login details"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid login details"
      });
    }

    req.session.regenerate((error) => {
      if (error) {
        return res.status(500).json({
          message: "Login failed"
        });
      }

      req.session.adminId = admin._id.toString();

      admin.lastLogin = new Date();
      admin.save();

      res.json({
        message: "Admin login successful",
        admin: {
          id: admin._id,
          username: admin.username,
          fullName: admin.fullName
        }
      });
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error during login"
    });
  }
});

// CHECK ADMIN LOGIN
router.get("/me", async (req, res) => {
  try {
    if (!req.session.adminId) {
      return res.status(401).json({
        message: "Admin login required"
      });
    }

    const admin = await Admin.findById(req.session.adminId)
      .select("-password");

    if (!admin || !admin.active) {
      return res.status(401).json({
        message: "Admin account unavailable"
      });
    }

    res.json(admin);

  } catch (error) {
    res.status(500).json({
      message: "Unable to verify admin"
    });
  }
});

// ADMIN LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed"
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      message: "Admin logout successful"
    });
  });
});

module.exports = router;
