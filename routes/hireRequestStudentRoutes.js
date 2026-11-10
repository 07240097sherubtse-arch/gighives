const express = require("express");
const router = express.Router();

const hireRequestStudentController = require("../controllers/hireRequestStudentController");
const requireLogin = require("../middleware/authMiddleware");
// View received hiring requests
router.get(
    "/hire/my-requests",
    requireLogin,
    hireRequestStudentController.showMyRequests
);

// Accept or reject a hiring request
router.post(
    "/hire/my-requests/:requestId",
    requireLogin,
    hireRequestStudentController.updateRequestStatus
);
// Update project work progress
router.post(
    "/hire/request/:requestId/progress",
    hireRequestStudentController.updateWorkStatus
);

module.exports = router;