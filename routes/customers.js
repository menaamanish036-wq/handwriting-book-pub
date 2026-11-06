const express = require("express");
const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// VIEW ALL CUSTOMERS
router.get("/", adminAuth, async (req, res) => {
    try {
        const User = mongoose.model("User");

        const customers = await User.find({ role: "customer" })
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(customers);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load customers."
        });
    }
});

// VIEW CUSTOMER DETAILS
router.get("/:id", adminAuth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid customer ID."
            });
        }

        const User = mongoose.model("User");

        const customer = await User.findById(req.params.id)
            .select("-password");

        if (!customer || customer.role !== "customer") {
            return res.status(404).json({
                message: "Customer not found."
            });
        }

        const registrations = await Registration.find({
            customer: customer._id
        }).populate("project");

        res.json({
            customer,
            registrations
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load customer details."
        });
    }
});

// UPDATE CUSTOMER REGISTRATION DETAILS
router.patch("/:id", adminAuth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid customer ID."
            });
        }

        const allowedFields = [
            "fullName",
            "email",
            "address",
            "pinCode",
            "district",
            "state"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = String(req.body[field]).trim();
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided."
            });
        }

        const registration = await Registration.findOneAndUpdate(
            {
                _id: req.body.registrationId,
                customer: req.params.id
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!registration) {
            return res.status(404).json({
                message: "Customer registration not found."
            });
        }

        res.json({
            message: "Customer details updated successfully.",
            registration
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to update customer details."
        });
    }
});

module.exports = router;
