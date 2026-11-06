const express = require("express");
const Parcel = require("../models/Parcel");
const { customerAuth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// CUSTOMER: VIEW MY PARCEL
router.get("/my", customerAuth, async (req, res) => {
  try {
    const parcels = await Parcel.find({
      customer: req.session.userId
    }).sort({ createdAt: -1 });

    res.json(parcels);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load parcel details"
    });
  }
});

// ADMIN: VIEW ALL PARCELS
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const parcels = await Parcel.find()
      .populate("customer", "mobile")
      .sort({ createdAt: -1 });

    res.json(parcels);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load parcels"
    });
  }
});

// ADMIN: ADD PARCEL
router.post("/admin/add", adminAuth, async (req, res) => {
  try {
    const {
      customer,
      courierCompany,
      dispatchDate,
      status,
      parcelNote
    } = req.body;

    if (!customer || !courierCompany || !dispatchDate) {
      return res.status(400).json({
        message: "Please provide all required parcel details"
      });
    }

    const parcel = await Parcel.create({
      customer,
      courierCompany,
      dispatchDate,
      status: status || "Preparing",
      parcelNote
    });

    res.status(201).json({
      message: "Parcel added successfully",
      parcel
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to add parcel"
    });
  }
});

// ADMIN: UPDATE PARCEL STATUS
router.patch("/admin/:id/status", adminAuth, async (req, res) => {
  try {
    const allowedStatuses = [
      "Preparing",
      "Dispatched",
      "In Transit",
      "Delivered",
      "Returned"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid parcel status"
      });
    }

    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!parcel) {
      return res.status(404).json({
        message: "Parcel not found"
      });
    }

    res.json({
      message: "Parcel status updated successfully",
      parcel
    });

  } catch (error) {
    res.status(500).json({
      message: "Unable to update parcel status"
    });
  }
});

module.exports = router;
