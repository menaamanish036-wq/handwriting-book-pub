const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Project = require("../models/Project");
const { adminAuth } = require("../middleware/auth");

// PUBLIC: Get all active projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({
      active: true
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error("Projects error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load projects."
    });
  }
});

// ADMIN: Get all projects
// IMPORTANT: Keep this route before /:id
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error("Admin projects error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load all projects."
    });
  }
});

// ADMIN: Add new project
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
      !Number.isFinite(Number(pages)) ||
      Number(pages) <= 0 ||
      !Number.isFinite(Number(sides)) ||
      Number(sides) <= 0 ||
      !Number.isFinite(Number(duration)) ||
      Number(duration) <= 0 ||
      !Number.isFinite(Number(salary)) ||
      Number(salary) <= 0 ||
      !Number.isFinite(Number(registrationFee)) ||
      Number(registrationFee) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid project details."
      });
    }

    const project = await Project.create({
      projectName: projectName.trim(),
      pages: Number(pages),
      sides: Number(sides),
      duration: Number(duration),
      salary: Number(salary),
      registrationFee: Number(registrationFee),
      active: true
    });

    res.status(201).json({
      success: true,
      message: "Project added successfully.",
      project
    });

  } catch (error) {
    console.error("Add project error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add project."
    });
  }
});

// ADMIN: Update project
router.patch("/admin/:id", adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID."
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

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided."
      });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found."
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully.",
      project
    });

  } catch (error) {
    console.error("Update project error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update project."
    });
  }
});

// ADMIN: Deactivate project
router.patch("/admin/:id/deactivate", adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID."
      });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found."
      });
    }

    res.json({
      success: true,
      message: "Project deactivated successfully.",
      project
    });

  } catch (error) {
    console.error("Deactivate project error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to deactivate project."
    });
  }
});

// PUBLIC: Get one active project
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID."
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      active: true
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found."
      });
    }

    res.json({
      success: true,
      project
    });

  } catch (error) {
    console.error("Single project error:", error);

    res.status(500).json({
      success: false,
      message
