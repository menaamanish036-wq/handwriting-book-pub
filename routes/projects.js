const express = require("express");
const Project = require("../models/Project");

const router = express.Router();

// Show All Active Projects
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
        res.status(500).json({
            success: false,
            message: "Unable to load projects"
        });
    }
});

// Get Single Project
router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            active: true
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            project
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Unable to load project"
        });
    }
});

module.exports = router;
