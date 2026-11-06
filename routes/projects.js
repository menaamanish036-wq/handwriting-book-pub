const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// CUSTOMER: VIEW ACTIVE PROJECTS
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find({
            active: true
        }).sort({ createdAt: 1 });

        res.json(projects);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load projects."
        });
    }
});

// CUSTOMER: VIEW SINGLE PROJECT
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid project ID."
            });
        }

        const project = await Project.findOne({
            _id: req.params.id,
            active: true
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        res.json(project);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to load project."
        });
    }
});

// ADMIN: VIEW ALL PROJECTS
router.get("/admin/all", adminAuth, async (req, res) => {
    try {
        const projects = await Project.find()
            .sort({ createdAt: -1 });

        res.json(projects);

    } catch (error) {
        res.status(500).json({
            message: "Unable to load projects."
        });
    }
});

// ADMIN: ADD NEW PROJECT
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
            pages == null ||
            sides == null ||
            duration == null ||
            salary == null ||
            registrationFee == null
        ) {
            return res.status(400).json({
                message: "Please provide all project details."
            });
        }

        const numbers = [
            pages,
            sides,
            duration,
            salary,
            registrationFee
        ];

        if (numbers.some(value =>
            !Number.isFinite(Number(value)) || Number(value) < 0
        )) {
            return res.status(400).json({
                message: "Project values must be valid non-negative numbers."
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
            message: "Project added successfully
