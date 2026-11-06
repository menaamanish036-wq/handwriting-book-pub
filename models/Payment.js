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
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    paymentType: {
      type: String,
      enum: ["Registration Fee", "Extra Charge"],
      default: "Registration Fee"
    },

    transactionId: {
      type: String,
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
      ref: "User",
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
