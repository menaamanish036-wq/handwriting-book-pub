const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Salary = require("../models/Salary");
const Registration = require("../models/Registration");
const { customerAuth, adminAuth } = require("../middleware/auth");

// CUSTOMER: View own salary
router.get("/my", customerAuth, async (req, res) => {
  try {
    const salaries = await Salary.find({
      customer: req.session.userId
    })
      .populate("project")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      salaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load salary details."
    });
  }
});

// ADMIN: View all salary records
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("customer", "mobile")
      .populate("project")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      salaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load salary records."
    });
  }
});

// ADMIN: Create salary record after registration approval
router.post("/admin/add", adminAuth, async (req, res) => {
  try {
    const { registrationId, totalSalary } = req.body;

    if (
      !registrationId ||
      !mongoose.Types.ObjectId.isValid(registrationId) ||
      !totalSalary ||
      Number(totalSalary) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid registration and salary details."
      });
    }

    const registration = await Registration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found."
      });
    }

    if (registration.registrationStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Approve the registration before creating salary."
      });
    }

    if (!registration.approvedAt) {
      return res.status(400).json({
        success: false,
        message: "Registration approval time is missing."
      });
    }

    const existingSalary = await Salary.findOne({
      customer: registration.customer,
      project: registration.project
    });

    if (existingSalary) {
      return res.status(409).json({
        success: false,
        message: "Salary record already exists for this customer and project."
      });
    }

    const salaryAmount = Number(totalSalary);
    const advanceAmount = salaryAmount * 0.5;
    const remainingAmount = salaryAmount - advanceAmount;

    // Advance is due 15 minutes after registration approval.
    const advanceDueAt = new Date(
      new Date(registration.approvedAt).getTime() + 15 * 60 * 1000
    );

    const salary = await Salary.create({
      customer: registration.customer,
      project: registration.project,
      totalSalary: salaryAmount,
      advanceAmount,
      remainingAmount,
      advanceDueAt,
      advanceStatus: "Pending",
      remainingStatus: "Pending"
    });

    res.status(201).json({
      success: true,
      message: "Salary record created successfully.",
      salary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create salary record."
    });
  }
});

// ADMIN: Update advance or remaining salary payment status
router.patch("/admin/:id/status", adminAuth, async (req, res) => {
  try {
    const { paymentPart, status, transactionId, paymentNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
