const express = require("express");
const Charge = require("../models/Charge");
const { customerAuth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// Customer: View Own Charges
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
            message: "Unable to load charges"
        });
    }
});

// Admin: Add Charge
router.post("/admin/add", adminAuth, async (req, res) => {
    try {
        const { customer, chargeName, reason, amount } = req.body;

        if (!customer || !chargeName || !reason || amount === undefined ||
            !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter valid charge details"
            });
        }

        const charge = await Charge.create({
            customer,
            chargeName,
            reason,
            amount: Number(amount)
        });

        res.status(201).json({
            success: true,
            message: "Charge added successfully",
            charge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to add charge"
        });
    }
});

// Admin: View All Charges
router.get("/admin/all", adminAuth, async (req, res) => {
    try {
        const charges = await Charge.find()
            .populate("customer", "mobile fullName")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            charges
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to load charges"
        });
    }
});

// Admin: Update Charge Status
router.patch("/admin/:id/status", adminAuth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!["Pending", "Paid", "Cancelled"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid charge status"
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
                message: "Charge not found"
            });
        }

        res.json({
            success: true,
            message: "Charge status updated",
            charge
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Charge update failed"
        });
    }
});

module.exports = router;
