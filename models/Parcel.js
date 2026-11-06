const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    courierCompany: {
      type: String,
      required: true
    },

    dispatchDate: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: [
        "Preparing",
        "Dispatched",
        "In Transit",
        "Delivered",
        "Returned"
      ],
      default: "Preparing"
    },

    parcelNote: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parcel", parcelSchema);
