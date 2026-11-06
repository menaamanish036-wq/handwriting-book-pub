const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      default: null
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    paymentType: {
      type: String,
      enum: ["Registration Fee", "Extra Charge"],
      required: true
    },

    transactionId: {
      type: String,
      trim: true,
      required: true
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

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
