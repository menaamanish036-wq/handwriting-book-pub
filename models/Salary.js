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
      required: true
    },

    totalSalary: {
      type: Number,
      required: true
    },

    advanceAmount: {
      type: Number,
      required: true
    },

    remainingAmount: {
      type: Number,
      required: true
    },

    advanceDueAt: {
      type: Date
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

    advancePaidAt: Date,
    remainingPaidAt: Date,

    transactionId: String,

    paymentNote: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);
