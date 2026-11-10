
const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const applicationController = require("../controllers/applicationController");
const requireLogin = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

// Registration route
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", userController.registerUser);

// Protected student dashboard
router.get("/student/dashboard", requireLogin, (req, res) => {
    res.render("student/dashboard", {
        user: req.session.user
    });
});

// Protected admin dashboard
router.get(
    "/admin/dashboard",
    requireAdmin,
    userController.showAdminDashboard
);
// Admin: View all registered users
router.get(
    "/admin/users",
    requireAdmin,
    userController.showAllUsers
);
// Admin: Suspend a user account
router.post(
    "/admin/users/:userId/suspend",
    requireAdmin,
    userController.suspendUser
);

// Admin: Reactivate a user account
router.post(
    "/admin/users/:userId/reactivate",
    requireAdmin,
    userController.reactivateUser
);

module.exports = router;
