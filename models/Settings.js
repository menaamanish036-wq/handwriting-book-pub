const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: "Handwriting Book Publication"
    },

    contactEmail: {
      type: String,
      default: "meenamanish036@gmail.com"
    },

    whatsappNumber: {
      type: String,
      default: "9460642427"
    },

    paymentQrImage: {
      type: String,
      default: ""
    },

    paymentInstructions: {
      type: String,
      default: "Scan the QR code to make payment."
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
