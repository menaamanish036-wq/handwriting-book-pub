const express = require("express");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");
const Project = require("../models/Project");
const { customerAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Submit Project Registration
router.post(
    "/",
    customerAuth,
    upload.single("paymentScreenshot"),
    async (req, res) => {
        try {
            const {
                fullName,
                email,
                address,
                pinCode,
                district,
                state,
                project,
                transactionId
            } = req.body;

            if (
                !fullName ||
                !email ||
                !address ||
                !pinCode ||
                !district ||
                !state ||
                !project ||
                !transactionId ||
                !req.file
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please complete all fields and upload payment screenshot."
                });
            }

            const selectedProject = await Project.findOne({
                _id: project,
                active: true
            });

            if (!selectedProject) {
                return res.status(404).json({
                    success: false,
                    message: "Selected project not found."
                });
            }

            const registration = await Registration.create({
                customer: req.session.userId,
                fullName,
                mobile: req.body.mobile,
                email,
                address,
                pinCode,
                district,
                state,
                project: selectedProject._id,
                paymentTransactionId: transactionId,
                paymentScreenshot: "/uploads/" + req.file.filename
            });

            await Payment.create({
                customer: req.session.userId,
                registration: registration._id,
                amount: selectedProject.registrationFee,
                paymentType: "Registration Fee",
                transactionId,
                paymentScreenshot: "/uploads/" + req.file.filename,
                paymentStatus: "Pending"
            });

            res.status(201).json({
                success: true,
                message: "Registration submitted. Awaiting admin verification.",
                registrationId: registration._id
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Registration submission failed."
            });
        }
    }
);

module.exports = router;
