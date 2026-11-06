const express = require("express");
const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");
const Project = require("../models/Project");
const { customerAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// CUSTOMER: SUBMIT PROJECT REGISTRATION
router.post(
  "/",
  customerAuth,
  upload.single("paymentScreenshot"),
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        address,
        pinCode,
        district,
        state,
        transactionId
      } = req.body;

      const projectId = req.body.project || req.body.projectId;

      if (
        !fullName ||
        !email ||
        !address ||
        !pinCode ||
        !district ||
        !state ||
        !transactionId ||
        !projectId
      ) {
        return res.status(400).json({
          message: "Please fill in all required details."
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Please upload your payment screenshot."
        });
      }

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          message: "Invalid project selected."
        });
      }

      const User = mongoose.model("User");

      const customer = await User.findById(req.session.userId);

      if (!customer) {
        return res.status(404).json({
          message: "Customer account not found."
        });
      }

      const project = await Project.findOne({
        _id: projectId,
        active: true
      });

      if (!project) {
        return res.status(404).json({
          message: "Selected project is not available."
        });
      }

      const screenshotPath = "/uploads/" + req.file.filename;

      const registration = await Registration.create({
        customer: customer._id,
        fullName: fullName.trim(),
        mobile: customer.mobile,
        email: email.trim().toLowerCase(),
        address: address.trim(),
        pinCode: pinCode.trim(),
        district: district.trim(),
        state: state.trim(),
        project: project._id,
        paymentTransactionId: transactionId.trim(),
        paymentScreenshot: screenshotPath,
        paymentStatus: "Pending",
        registrationStatus: "Pending"
      });

      try {
        await Payment.create({
          customer: customer._id,
          registration: registration._id,
          amount: project.registrationFee,
          paymentType: "Registration Fee",
          transactionId: transactionId.trim(),
          paymentScreenshot: screenshotPath,
          paymentStatus: "Pending"
        });
      } catch (paymentError) {
        await Registration.findByIdAndDelete(registration._id);
        throw paymentError;
      }

      res.status(201).json({
        message: "Registration submitted successfully. Please wait for admin verification.",
        registration
      });

    } catch (error) {
      console.error("Registration Error:", error);

      res.status(500).json({
        message: "Unable to submit registration."
      });
    }
  }
);

module.exports = router;
