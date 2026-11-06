const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true
    },
    pages: {
      type: Number,
      required: true
    },
    sides: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    salary: {
      type: Number,
      required: true
    },
    registrationFee: {
      type: Number,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
