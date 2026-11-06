const express = require("express");
const mongoose = require("mongoose");

const Registration = require("../models/Registration");
const Payment = require("../models/Payment");
const Charge = require("../models/Charge");
const Salary = require("../models/Salary");

const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// ADMIN DASHBOARD STATISTICS
router.get("/", adminAuth, async (req, res) => {
    try {
        const User = mongoose.model("User");

        const [
            totalCustomers,
            totalRegistrations,
            pendingApprovals,
            approvedRegistrations,
            rejectedRegistrations,
            pendingPayments,
            totalCharges,
            totalSalaries
        ] = await Promise.all([

            User.countDocuments({ role: "customer" }),

            Registration.countDocuments(),

            Registration.countDocuments({
                registrationStatus: "Pending"
            }),

            Registration.countDocuments({
                registrationStatus: "Approved"
            }),

            Registration.countDocuments({
                registrationStatus: "Rejected"
            }),

            Payment.countDocuments({
                paymentStatus: "Pending"
            }),

            Charge.countDocuments(),

            Salary.countDocuments()

        ]);

        res.json({
            totalCustomers,
            totalRegistrations,
            pendingApprovals,
            approvedRegistrations,
            rejectedRegistrations,
            pendingPayments,
            totalCharges,
            totalSalaries
        });

    } catch (error) {
        console.error("Dashboard Error:", error);

        res.status(500).json({
            message: "Unable to load dashboard statistics."
        });
    }
});

module.exports = router;
