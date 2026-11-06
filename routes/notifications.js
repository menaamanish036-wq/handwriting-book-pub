const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Notification = require("../models/Notification");
const User = require("../models/User");
const { customerAuth, adminAuth } = require("../middleware/auth");

// CUSTOMER: View own notifications
router.get("/my", customerAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      customer: req.session.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load notifications."
    });
  }
});

// CUSTOMER: Mark notification as read
router.patch("/:id/read", customerAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID."
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        customer: req.session.userId
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found."
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read.",
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update notification."
    });
  }
});

// ADMIN: Send notification to a customer
router.post("/admin/send", adminAuth, async (req, res) => {
  try {
    const { customerId, title, message, type } = req.body;

    if (
      !customerId ||
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !title ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid notification details."
      });
    }

    const customer = await User.findById(customerId);

    if (!customer || customer.role !== "customer") {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    const validTypes = [
      "Registration",
      "Payment",
      "Salary",
      "Charge",
      "Parcel",
      "General"
    ];

    const notificationType = type || "General";

    if (!validTypes.includes(notificationType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification type."
      });
    }

    const notification = await Notification.create({
      customer: customerId,
      title: title.trim(),
      message: message.trim(),
      type: notificationType,
      isRead: false
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully.",
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to send notification."
    });
  }
});

module.exports = router;
