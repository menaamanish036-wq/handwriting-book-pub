const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fullName: {
      type: String,
      required: true
    },

    mobile: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    pinCode: {
      type: String,
      required: true
    },

    district: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    paymentTransactionId: {
      type: String,
      default: ""
    },

    paymentScreenshot: {
      type: String,
      default: ""
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    registrationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", registrationSchema);
