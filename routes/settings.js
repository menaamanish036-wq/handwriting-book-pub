const express = require("express");
const Settings = require("../models/Settings");
const { adminAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// GET PUBLIC BUSINESS SETTINGS
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        businessName: "Handwriting Book Publication",
        contactEmail: "meenamanish036@gmail.com",
        whatsappNumber: "9460642427"
      });
    }

    res.json({
      businessName: settings.businessName,
      contactEmail: settings.contactEmail,
      whatsappNumber: settings.whatsappNumber,
      paymentQrImage: settings.paymentQrImage,
      paymentInstructions: settings.paymentInstructions
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to load settings"
    });
  }
});

// ADMIN: VIEW SETTINGS
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load admin settings"
    });
  }
});

// ADMIN: UPDATE BUSINESS CONTACT DETAILS
router.patch("/admin/update", adminAuth, async (req, res) => {
  try {
    const {
      businessName,
      contactEmail,
      whatsappNumber,
      paymentInstructions
    } = req.body;

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        businessName,
        contactEmail,
        whatsappNumber,
        paymentInstructions
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      message: "Settings updated successfully",
      settings
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update settings"
    });
  }
});

// ADMIN: UPLOAD OR REPLACE PAYMENT QR
router.post(
  "/admin/upload-qr",
  adminAuth,
  upload.single("paymentQrImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a QR image"
        });
      }

      const settings = await Settings.findOneAndUpdate(
        {},
        {
          paymentQrImage: `/uploads/${req.file.filename}`
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      res.json({
        message: "Payment QR uploaded successfully",
        paymentQrImage: settings.paymentQrImage
      });
    } catch (error) {
      res.status(500).json({
        message: "Unable to upload payment QR"
      });
    }
  }
);

module.exports = router;
