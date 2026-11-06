const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing");
    }

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      throw new Error("Admin credentials are missing");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await Admin.findOne({
      username: process.env.ADMIN_USERNAME
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      12
    );

    await Admin.create({
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword,
      fullName: "Website Administrator",
      role: "admin",
      active: true
    });

    console.log("Admin account created successfully.");

  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
