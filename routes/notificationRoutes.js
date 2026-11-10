const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");
const requireLogin = require("../middleware/authMiddleware");

// Display all notifications
router.get(
    "/notifications",
    requireLogin,
    notificationController.showNotifications
);

// Mark one notification as read
router.post(
    "/notifications/:notificationId/read",
    requireLogin,
    notificationController.markAsRead
);

// Mark all notifications as read
router.post(
    "/notifications/read-all",
    requireLogin,
    notificationController.markAllAsRead
);

module.exports = router;