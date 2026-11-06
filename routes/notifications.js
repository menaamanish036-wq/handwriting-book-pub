const express = require("express");
const Notification = require("../models/Notification");
const { customerAuth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// CUSTOMER: VIEW MY NOTIFICATIONS
router.get("/my", customerAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      customer: req.session.userId
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load notifications"
    });
  }
});

// CUSTOMER: MARK NOTIFICATION AS READ
router.patch("/:id/read", customerAuth, async (req, res) => {
  try {
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
        message: "Notification not found"
      });
    }

    res.json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update notification"
    });
  }
});

// ADMIN: SEND NOTIFICATION TO CUSTOMER
router.post("/admin/send", adminAuth, async (req, res) => {
  try {
    const { customer, title, message, type } = req.body;

    if (!customer || !title || !message) {
      return res.status(400).json({
        message: "Customer, title and message are required"
      });
    }

    const notification = await Notification.create({
      customer,
      title,
      message,
      type: type || "General"
    });

    res.status(201).json({
      message: "Notification sent successfully",
      notification
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to send notification"
    });
  }
});

module.exports = router;
