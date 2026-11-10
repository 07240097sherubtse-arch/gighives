
const express = require("express");
const router = express.Router();

const studentProfileController =
    require("../controllers/studentProfileController");

const requireLogin = require("../middleware/authMiddleware");

// Display profile form
router.get(
    "/student/profile",
    requireLogin,
    studentProfileController.showProfileForm
);

// Save profile
router.post(
    "/student/profile",
    requireLogin,
    studentProfileController.saveProfile
);
// Show all available student freelancers
router.get(
    "/hire",
    requireLogin,
    studentProfileController.showAllFreelancers
);

module.exports = router;
