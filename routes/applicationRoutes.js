
const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/applicationController");

const requireLogin = require("../middleware/authMiddleware");
const requireStudent = require("../middleware/requireStudent");
const requireClient = require("../middleware/requireClient");
const requireAdmin = require("../middleware/requireAdmin");
// Students can submit job applications
router.post(
    "/jobs/:jobId/apply",
    requireStudent,
    applicationController.applyForJob
);

// Job owners can view applications received
router.get(
    "/my-applications",
    requireLogin,
    applicationController.showApplications
);

// Job owners can accept or reject applications
router.post(
    "/applications/:applicationId/status",
    requireClient,
    applicationController.updateApplication
);

// Students can view their submitted applications
router.get(
    "/my-submissions",
    requireStudent,
    applicationController.showMySubmissions
);

// Admin: View all student applications
router.get(
    "/admin/applications",
    requireAdmin,
    applicationController.showAllApplicationsForAdmin
);

module.exports = router;
