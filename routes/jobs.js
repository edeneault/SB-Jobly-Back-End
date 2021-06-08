"use strict";
// JOB Routes //

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });

// POST new job //
// DATA required: title and company handle //
// AUTH admin required //

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

// GET all jobs - filters optional //
// Filters - minSalary, hasEquity, title //
// AUTH: no required //

router.get("/", async function (req, res, next) {
    const qParams = req.query;
    if (qParams.minSalary !== undefined) qParams .minSalary = parseInt(qParams.minSalary);
    qParams.hasEquity = qParams.hasEquity === "true";

    try {
        const validator = jsonschema.validate(qParams, jobSearchSchema);
        if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
        }

        const jobs = await Job.findAll(qParams);
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
});

// GET job by ID //
// RETURNS job object { id, title, salary, equity, company } and associated company object //
// AUTH: no requirted //

router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.find(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});


// UPDATE by job ID //
// Partial update OK, data fields can include { title, Salary, equity }
// RETURNS job object { id, titlem, salary, equity, comapnyHandle }

router.patch("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

// DELETE by jiob ID //
// AUTH: not required //
// RETURNS: { deleted: id }

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: +req.params.id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
