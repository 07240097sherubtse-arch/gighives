
const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const requireLogin = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

// Display available jobs
router.get("/jobs", jobController.showJobs);

// Display job posting form
router.get("/jobs/post", requireLogin, (req, res) => {
    res.render("client/post-job");
});

// Handle job posting submission
router.post("/jobs/post", requireLogin, jobController.postJob);

// Admin: View all posted jobs
router.get(
    "/admin/jobs",
    requireAdmin,
    jobController.showAllJobsForAdmin
);

// Admin: Close or reopen a job
router.post(
    "/admin/jobs/:jobId/status",
    requireAdmin,
    jobController.updateJobStatus
);

// Admin: Permanently delete a job
router.post(
    "/admin/jobs/:jobId/delete",
    requireAdmin,
    jobController.deleteJob
);

module.exports = router;
