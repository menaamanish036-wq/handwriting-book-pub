const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null
    },

    totalSalary: {
      type: Number,
      required: true,
      min: 0
    },

    advanceAmount: {
      type: Number,
      required: true,
      min: 0
    },

    remainingAmount: {
      type: Number,
      required: true,
      min: 0
    },

    advanceDueAt: {
      type: Date,
      default: null
    },

    advanceStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },

    remainingStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },

    advancePaidAt: {
      type: Date,
      default: null
    },

    remainingPaidAt: {
      type: Date,
      default: null
    },

    transactionId: {
      type: String,
      default: "",
      trim: true
    },

    paymentNote: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Salary", salarySchema);
