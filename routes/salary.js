const express = require("express");
const Salary = require("../models/Salary");
const { customerAuth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// CUSTOMER: VIEW MY SALARY
router.get("/my", customerAuth, async (req, res) => {
  try {
    const salary = await Salary.find({
      customer: req.session.userId
    }).populate("project");

    res.json(salary);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load salary details"
    });
  }
});

// ADMIN: VIEW ALL SALARIES
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate("customer", "mobile")
      .populate("project");

    res.json(salaries);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load salaries"
    });
  }
});

// ADMIN: CREATE SALARY RECORD
router.post("/admin/add", adminAuth, async (req, res) => {
  try {
    const {
      customer,
      project,
      totalSalary
    } = req.body;

    if (!customer || !project || !totalSalary || totalSalary <= 0) {
      return res.status(400).json({
        message: "Please provide valid salary details"
      });
    }

    const advanceAmount = Number(totalSalary) * 0.50;
    const remainingAmount = Number(totalSalary) - advanceAmount;

    // Advance is due 15 minutes after registration completion.
    // Admin creates this record when registration is complete.
    const advanceDueAt = new Date(Date.now() + 15 * 60 * 1000);

    const salary = await Salary.create({
      customer,
      project,
      totalSalary,
      advanceAmount,
      remainingAmount,
      advanceDueAt,
      advanceStatus: "Pending",
      remainingStatus: "Pending"
    });

    res.status(201).json({
      message: "Salary record created successfully",
      salary
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to create salary record"
    });
  }
});

module.exports = router;
