const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// PROXY SETTINGS FOR HOSTING
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// MIDDLEWARE
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
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

// CREATE UPLOAD FOLDER
const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadFolder));

// USER MODEL
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
    }
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

// ROUTES
const adminRoutes = require("./routes/admin");
const registrationRoutes = require("./routes/registration");
const projectRoutes = require("./routes/projects");
const paymentRoutes = require("./routes/payments");
const chargeRoutes = require("./routes/charges");
const salaryRoutes = require("./routes/salary");
const parcelRoutes = require("./routes/parcel");
const notificationRoutes = require("./routes/notifications");
const settingsRoutes = require("./routes/settings");
const customerRoutes = require("./routes/customers");
const dashboardRoutes = require("./routes/dashboard");

// CUSTOMER REGISTRATION
app.post("/api/register", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        message: "Mobile number and password are required"
      });
    }

    const existingUser = await User.findOne({ mobile });

    if (existingUser) {
      return res.status(409).json({
        message: "This mobile number is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      mobile,
      password: hashedPassword
    });

    req.session.userId = user._id.toString();

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        mobile: user.mobile
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Registration failed"
    });
  }
});

// CUSTOMER LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(401).json({
        message: "Invalid mobile number or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid mobile number or password"
      });
    }

    req.session.userId = user._id.toString();

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        mobile: user.mobile
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed"
    });
  }
});

// CHECK LOGIN
app.get("/api/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Please login first"
      });
    }

    const user = await User.findById(req.session.userId)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: "Unable to get user details"
    });
  }
});

// CUSTOMER LOGOUT
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");

    res.json({
      message: "Logout successful"
    });
  });
});

// CONNECT ALL API ROUTES
app.use("/api/admin", adminRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/charges", chargeRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/parcel", parcelRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);

// HOME PAGE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    website: "Handwriting Book Publication"
  });
});

// DATABASE CONNECTION
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(
        `Handwriting Book Publication running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  });
