const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Parcel = require("../models/Parcel");
const User = require("../models/User");
const { customerAuth, adminAuth } = require("../middleware/auth");

// CUSTOMER: View own parcel details
router.get("/my", customerAuth, async (req, res) => {
  try {
    const parcels = await Parcel.find({
      customer: req.session.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      parcels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load parcel details."
    });
  }
});

// ADMIN: View all parcels
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const parcels = await Parcel.find()
      .populate("customer", "mobile")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      parcels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load parcels."
    });
  }
});

// ADMIN: Add parcel details
router.post("/admin/add", adminAuth, async (req, res) => {
  try {
    const {
      customerId,
      courierCompany,
      dispatchDate,
      status,
      parcelNote
    } = req.body;

    if (
      !customerId ||
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !courierCompany ||
      !dispatchDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid parcel details."
      });
    }

    const customer = await User.findById(customerId);

    if (!customer || customer.role !== "customer") {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    const validStatuses = [
      "Preparing",
      "Dispatched",
      "In Transit",
      "Delivered",
      "Returned"
    ];

    const parcelStatus = status || "Preparing";

    if (!validStatuses.includes(parcelStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parcel status."
      });
    }

    const parcel = await Parcel.create({
      customer: customerId,
      courierCompany: courierCompany.trim(),
      dispatchDate: new Date(dispatchDate),
      status: parcelStatus,
      parcelNote: parcelNote || ""
    });

    res.status(201).json({
      success: true,
      message: "Parcel details added successfully.",
      parcel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add parcel details."
    });
  }
});

// ADMIN: Update parcel status and details
router.patch("/admin/:id", adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parcel ID."
      });
    }

    const {
      courierCompany,
      dispatchDate,
      status,
      parcelNote
    } = req.body;

    const updates = {};

    if (courierCompany !== undefined) {
      updates.courierCompany = courierCompany.trim();
    }

    if (dispatchDate !== undefined) {
      const date = new Date(dispatchDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid dispatch date."
        });
      }

      updates.dispatchDate = date;
    }

    if (status !== undefined) {
      const validStatuses = [
        "Preparing",
        "Dispatched",
        "In Transit",
        "Delivered",
        "Returned"
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parcel status."
        });
      }

      updates.status = status;
    }

    if (parcelNote !== undefined) {
      updates.parcelNote = parcelNote;
    }

    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found."
      });
    }

    res.json({
      success: true,
      message: "Parcel details updated successfully.",
      parcel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update parcel details."
    });
  }
});

module.exports = router;
