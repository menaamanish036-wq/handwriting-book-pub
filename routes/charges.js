const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Charge = require("../models/Charge");
const User = require("../models/User");
const { customerAuth, adminAuth } = require("../middleware/auth");

// CUSTOMER: View own charges
router.get("/my", customerAuth, async (req, res) => {
  try {
    const charges = await Charge.find({
      customer: req.session.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      charges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load charges."
    });
  }
});

// ADMIN: Add a charge to a customer
router.post("/admin/add", adminAuth, async (req, res) => {
  try {
    const {
      customerId,
      chargeName,
      reason,
      amount,
      chargeDate
    } = req.body;

    if (
      !customerId ||
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !chargeName ||
      !reason ||
      amount === undefined ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid charge details."
      });
    }

    const customer = await User.findById(customerId);

    if (!customer || customer.role !== "customer") {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    const charge = await Charge.create({
      customer: customerId,
      chargeName: chargeName.trim(),
      reason: reason.trim(),
      amount: Number(amount),
      chargeDate: chargeDate ? new Date(chargeDate) : new Date(),
      status: "Pending"
    });

    res.status(201).json({
      success: true,
      message: "Charge added successfully.",
      charge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add charge."
    });
  }
});

// ADMIN: View all charges
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const charges = await Charge.find()
      .populate("customer", "mobile")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      charges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load charges."
    });
  }
});

// ADMIN: Update charge status
router.patch("/admin/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid charge ID."
      });
    }

    if (!["Pending", "Paid", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid charge status."
      });
    }

    const charge = await Charge.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: "Charge not found."
      });
    }

    res.json({
      success: true,
      message: "Charge status updated.",
      charge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update charge."
    });
  }
});

module.exports = router;
