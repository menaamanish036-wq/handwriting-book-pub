const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Registration = require("../models/Registration");
const Payment = require("../models/Payment");
const Charge = require("../models/Charge");
const Salary = require("../models/Salary");
const User = mongoose.model("User");

const { adminAuth } = require("../middleware/auth");

// ADMIN: Dashboard statistics
router.get("/", adminAuth, async (req, res) => {
  try {
    const [
      totalCustomers,
      totalRegistrations,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalCharges,
      pendingCharges,
      paidCharges,
      totalSalaries,
      pendingAdvances,
      paidAdvances
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

      Payment.countDocuments({
        paymentStatus: "Approved"
      }),

      Payment.countDocuments({
        paymentStatus: "Rejected"
      }),

      Charge.countDocuments(),

      Charge.countDocuments({
        status: "Pending"
      }),

      Charge.countDocuments({
        status: "Paid"
      }),

      Salary.countDocuments(),

      Salary.countDocuments({
        advanceStatus: "Pending"
      }),

      Salary.countDocuments({
        advanceStatus: "Paid"
      })
    ]);

    const [registrationCollection, chargeCollection, salaryTotal] =
      await Promise.all([
        Payment.aggregate([
          { $match: { paymentStatus: "Approved" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        Charge.aggregate([
          { $match: { status: "Paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),

        Salary.aggregate([
          { $group: { _id: null, total: { $sum: "$totalSalary" } } }
        ])
      ]);

    res.json({
      success: true,
      dashboard: {
        customers: {
          total: totalCustomers
        },

        registrations: {
          total: totalRegistrations,
          pending: pendingRegistrations,
          approved: approvedRegistrations,
          rejected: rejectedRegistrations
        },

        payments: {
          pending: pendingPayments,
          approved: approvedPayments,
          rejected: rejectedPayments,
          approvedCollection: registrationCollection[0]?.total || 0
        },

        charges: {
          total: totalCharges,
          pending: pendingCharges,
          paid: paidCharges,
          paidCollection: chargeCollection[0]?.total || 0
        },

        salaries: {
          totalRecords: totalSalaries,
          pendingAdvances,
          paidAdvances,
          totalSalaryAmount: salaryTotal[0]?.total || 0
        }
      }
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics."
    });
  }
});

module.exports = router;
