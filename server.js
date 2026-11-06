require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((error) => console.error("MongoDB Error:", error.message));

// User Schema
const userSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "customer"
    },
    fullName: String,
    email: String,
    address: String,
    project: String,
    registrationStatus: {
      type: String,
      default: "Not Registered"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Handwriting Book Publication Server is running"
  });
});

// Customer Registration
app.post("/api/register", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and password are required"
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This mobile number is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      mobile,
      password: hashedPassword
    });

    req.session.userId = user._id;

    res.status(201).json({
      success: true,
      message: "Registration successful"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
});

// Customer Login
app.post("/api/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    req.session.userId = user._id;

    res.json({
      success: true,
      message: "Login successful"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// Check Login
app.get("/api/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Please login first"
    });
  }

  const user = await User.findById(req.session.userId).select("-password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found"
    });
  }

  res.json({
    success: true,
    user
  });
});

// Customer Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  });
});

// Website Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
