const express = require("express");
const Payment = require("../models/Payment");
const { customerAuth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// Customer: View Own Payments
router.get("/my", customerAuth, async (req, res) => {
    try {
        const payments = await Payment.find({
            customer: req.session.userId
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to load payments"
        });
    }
});

// Admin: View All Payments
router.get("/admin/all", adminAuth, async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("customer", "mobile fullName")
            .sort({ createdAt: -1 });

        res.json({ success: true, payments });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to load payments"
        });
    }
});

// Admin: Approve or Reject Payment
router.patch("/admin/:id/status", adminAuth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            {
                paymentStatus: status,
                verifiedBy: req.session.adminId,
                verifiedAt: new Date()
            },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        res.json({
            success: true,
            message: "Payment status updated",
            payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Payment update failed"
        });
    }
});

module.exports = router;
