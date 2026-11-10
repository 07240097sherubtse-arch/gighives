const db = require("../config/database");

exports.getAllUsers = async () => {
    return db.any(
        `SELECT id, full_name, email, role, account_status, created_at
         FROM users
         ORDER BY created_at DESC`
    );
};
exports.createUser = async (name, email, password, role) => {
    return db.one(
        `INSERT INTO users (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, email, role, created_at`,
        [name, email, password, role]
    );
};
exports.getUserByEmail = async (email) => {
    return db.oneOrNone(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
};

// Get user statistics for admin dashboard
exports.getUserStatistics = async () => {
    return db.one(
        `SELECT
            COUNT(*) AS total_users,
            COUNT(*) FILTER (WHERE role = 'student') AS total_students,
            COUNT(*) FILTER (WHERE role = 'client') AS total_clients,
            COUNT(*) FILTER (WHERE role = 'admin') AS total_admins
         FROM users`
    );
};
// Suspend a user account
exports.suspendUser = async (userId) => {
    return db.oneOrNone(
        `UPDATE users
         SET account_status = 'suspended'
         WHERE id = $1 AND role != 'admin'
         RETURNING id, full_name, account_status`,
        [userId]
    );
};

// Reactivate a user account
exports.reactivateUser = async (userId) => {
    return db.oneOrNone(
        `UPDATE users
         SET account_status = 'active'
         WHERE id = $1 AND role != 'admin'
         RETURNING id, full_name, account_status`,
        [userId]
    );
};
// Get a user by ID
exports.getUserById = async (userId) => {
    return db.oneOrNone(
        `SELECT id, full_name, email, role, account_status
         FROM users
         WHERE id = $1`,
        [userId]
    );
};