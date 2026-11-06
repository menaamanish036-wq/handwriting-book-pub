const express = require("express");
const router = express.Router();

const Settings = require("../models/Settings");
const upload = require("../middleware/upload");
const { adminAuth } = require("../middleware/auth");

// Get or create website settings
async function getSettings() {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      businessName: "Handwriting Book Publication",
      contactEmail: "meenamanish036@gmail.com",
      whatsappNumber: "9460642427",
      paymentInstructions: "Please complete your payment and submit the transaction ID."
    });
  }

  return settings;
}

// PUBLIC: Get contact and payment settings
router.get("/", async (req, res) => {
  try {
    const settings = await getSettings();

    res.json({
      success: true,
      settings: {
        businessName: settings.businessName,
        contactEmail: settings.contactEmail,
        whatsappNumber: settings.whatsappNumber,
        paymentQrImage: settings.paymentQrImage,
        paymentInstructions: settings.paymentInstructions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load website settings."
    });
  }
});

// ADMIN: View all settings
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const settings = await getSettings();

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load admin settings."
    });
  }
});

// ADMIN: Update contact and payment settings
router.patch("/admin/update", adminAuth, async (req, res) => {
  try {
    const {
      businessName,
      contactEmail,
      whatsappNumber,
      paymentInstructions
    } = req.body;

    const settings = await getSettings();

    if (businessName !== undefined) {
      settings.businessName = businessName.trim();
    }

    if (contactEmail !== undefined) {
      settings.contactEmail = contactEmail.trim();
    }

    if (whatsappNumber !== undefined) {
      settings.whatsappNumber = whatsappNumber.trim();
    }

    if (paymentInstructions !== undefined) {
      settings.paymentInstructions = paymentInstructions.trim();
    }

    await settings.save();

    res.json({
      success: true,
      message: "Website settings updated successfully.",
      settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update website settings."
    });
  }
});

// ADMIN: Upload or replace payment QR code
router.post(
  "/admin/upload-qr",
  adminAuth,
  upload.single("paymentQr"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a QR code image."
        });
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Only JPG, PNG and WEBP QR images are allowed."
        });
      }

      const settings = await getSettings();

      settings.paymentQrImage = `/uploads/${req.file.filename}`;

      await settings.save();

      res.json({
        success: true,
        message: "Payment QR code uploaded successfully.",
        paymentQrImage: settings.paymentQrImage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Unable to upload QR code."
      });
    }
  }
);

module.exports = router;
