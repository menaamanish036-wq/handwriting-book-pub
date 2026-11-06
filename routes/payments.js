const express = require("express");
const Payment = require("../models/Payment");
const Registration = require("../models/Registration");
const { customerAuth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// CUSTOMER: VIEW MY PAYMENTS
router.get("/my", customerAuth, async (req, res) => {
  try {
    const payments = await Payment.find({
      customer: req.session.userId
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to load payments."
    });
  }
});

// ADMIN: VIEW ALL PAYMENTS
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("customer", "mobile")
      .populate("registration")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to load payments."
    });
  }
});

// ADMIN: APPROVE OR REJECT PAYMENT
router.patch("/admin/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid payment status."
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found."
      });
    }

    payment.paymentStatus = status;
    payment.verifiedBy = req.session.adminId;
    payment.verifiedAt = new Date();

    await payment.save();

    // Update payment status in linked registration.
    // Registration approval remains a separate admin decision.
    if (payment.registration) {
      await Registration.findByIdAndUpdate(
        payment.registration,
        {
          paymentStatus: status
        }
      );
    }

    res.json({
      message: `Payment ${status.toLowerCase()} successfully.`,
      payment
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to update payment."
    });
  }
});

module.exports = router;
