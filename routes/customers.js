const express = require("express");
const Registration = require("../models/Registration");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// ADMIN: VIEW ALL CUSTOMERS
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const customers = await Registration.find()
      .populate("customer", "mobile role")
      .populate("project")
      .sort({ createdAt: -1 });

    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load customers"
    });
  }
});

// ADMIN: VIEW SINGLE CUSTOMER
router.get("/admin/:id", adminAuth, async (req, res) => {
  try {
    const customer = await Registration.findById(req.params.id)
      .populate("customer", "mobile role")
      .populate("project");

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load customer details"
    });
  }
});

// ADMIN: UPDATE CUSTOMER REGISTRATION DETAILS
router.patch("/admin/:id", adminAuth, async (req, res) => {
  try {
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
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid details provided"
      });
    }

    const customer = await Registration.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json({
      message: "Customer details updated successfully",
      customer
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update customer details"
    });
  }
});

module.exports = router;
