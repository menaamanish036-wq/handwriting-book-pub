const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// GET ALL ACTIVE PROJECTS
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ active: true }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch projects"
    });
  }
});

// ADMIN: GET ALL PROJECTS
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    console.error("ADMIN PROJECTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch all projects"
    });
  }
});

// ADMIN: ADD PROJECT
router.post("/admin/add", adminAuth, async (req, res) => {
  try {
    const {
      projectName,
      pages,
      sides,
      duration,
      salary,
      registrationFee
    } = req.body;

    if (
      !projectName ||
      pages === undefined ||
      sides === undefined ||
      duration === undefined ||
      salary === undefined ||
      registrationFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All project fields are required"
      });
    }

    const project = await Project.create({
      projectName,
      pages,
      sides,
      duration,
      salary,
      registrationFee,
      active: true
    });

    res.status(201).json({
      success: true,
      message: "Project added successfully",
      project
    });
  } catch (error) {
    console.error("ADD PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ADMIN: UPDATE PROJECT
router.patch("/admin/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    const allowedFields = [
      "projectName",
      "pages",
      "sides",
      "duration",
      "salary",
      "registrationFee",
      "active"
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ADMIN: DEACTIVATE PROJECT
router.patch("/admin/:id/deactivate", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { active: false },
      {
        new: true,
        runValidators: true
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deactivated successfully",
      project
    });
  } catch (error) {
    console.error("DEACTIVATE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET SINGLE PROJECT
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    const project = await Project.findOne({
      _id: id,
      active: true
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    console.error("GET SINGLE PROJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch project"
    });
  }
});

module.exports = router;
