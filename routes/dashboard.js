const express = require("express");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");
const Charge = require("../models/Charge");
const Salary = require("../models/Salary");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// ADMIN DASHBOARD STATISTICS
router.get("/", adminAuth, async (req, res) => {
  try {
    const [
      totalCustomers,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      pendingPayments,
      approvedPayments,
      totalCharges,
      totalSalaries
    ] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ registrationStatus: "Pending" }),
      Registration.countDocuments({ registrationStatus: "Approved" }),
      Registration.countDocuments({ registrationStatus: "Rejected" }),
      Payment.countDocuments({ paymentStatus: "Pending" }),
      Payment.countDocuments({ paymentStatus: "Approved" }),
      Charge.countDocuments(),
      Salary.countDocuments()
    ]);

    res.json({
      totalCustomers,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      pendingPayments,
      approvedPayments,
      totalCharges,
      totalSalaries
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to load dashboard"
    });
  }
});

module.exports = router;
