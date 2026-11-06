const mongoose = require("mongoose");

const chargeSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    chargeName: {
      type: String,
      required: true
    },

    reason: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    chargeDate: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Charge", chargeSchema);
