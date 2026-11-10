const notificationModel = require("../models/notificationModel");

// Display notifications
exports.showNotifications = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const notifications =
            await notificationModel.getNotificationsByUser(userId);

        const unreadCount =
            await notificationModel.getUnreadNotificationCount(userId);

        res.render("notifications/index", {
            notifications,
            unreadCount: unreadCount.count
        });

    } catch (error) {
        console.error("Error displaying notifications:", error);
        res.status(500).send("Unable to load notifications.");
    }
};

// Mark one notification as read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const notificationId = req.params.notificationId;

        await notificationModel.markNotificationAsRead(
            notificationId,
            userId
        );

        res.redirect("/notifications");

    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).send("Unable to update notification.");
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.session.user.id;

        await notificationModel.markAllNotificationsAsRead(userId);

        res.redirect("/notifications");

    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).send("Unable to update notifications.");
    }
};