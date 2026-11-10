const db = require("../config/database");

// Create a new notification
exports.createNotification = async (
    recipientId,
    message,
    type,
    relatedUrl = null
) => {
    return db.one(
        `INSERT INTO notifications
        (recipient_id, message, type, related_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [recipientId, message, type, relatedUrl]
    );
};

// Get all notifications for a user
exports.getNotificationsByUser = async (userId) => {
    return db.any(
        `SELECT *
         FROM notifications
         WHERE recipient_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );
};

// Count unread notifications
exports.getUnreadNotificationCount = async (userId) => {
    return db.one(
        `SELECT COUNT(*)::int AS count
         FROM notifications
         WHERE recipient_id = $1
         AND is_read = FALSE`,
        [userId]
    );
};

// Mark one notification as read
exports.markNotificationAsRead = async (notificationId, userId) => {
    return db.none(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id = $1
         AND recipient_id = $2`,
        [notificationId, userId]
    );
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (userId) => {
    return db.none(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE recipient_id = $1
         AND is_read = FALSE`,
        [userId]
    );
};