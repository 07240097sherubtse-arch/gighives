
const express = require("express");
const router = express.Router();

const hireRequestController =
    require("../controllers/hireRequestController");

// Show the hiring form
router.get(
    "/hire/request/:studentId",
    hireRequestController.showHireForm
);
// View hiring requests sent by the client
router.get(
    "/hire/my-sent-requests",
    hireRequestController.showMySentRequests
);
// Submit the hiring request
router.post(
    "/hire/request/:studentId",
    hireRequestController.submitHireRequest
);
// Client dashboard
router.get(
    "/client/dashboard",
    hireRequestController.showClientDashboard
);

module.exports = router;
