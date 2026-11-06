const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    fullName: {
      type: String,
      default: "Website Administrator"
    },

    role: {
      type: String,
      default: "admin"
    },

    active: {
      type: Boolean,
      default: true
    },

    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Admin ||
  mongoose.model("Admin", adminSchema);
