
const db = require("../config/database");

// Create a new hiring request
exports.createHireRequest = async (
    clientId,
    studentId,
    projectTitle,
    description,
    budget,
    deadline,
    requesterRole = "client"
) => {
    return db.one(
        `INSERT INTO hire_requests
        (client_id, student_id, project_title, description,
         budget, deadline, requester_role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
            clientId,
            studentId,
            projectTitle,
            description,
            budget,
            deadline || null,
            requesterRole
        ]
    );
};

// Get hiring requests received by a student
exports.getRequestsByStudent = async (studentId) => {
    return db.any(
        `SELECT
            hire_requests.*,
            users.full_name AS requester_name,
            hire_requests.requester_role
         FROM hire_requests
         JOIN users
            ON hire_requests.client_id = users.id
         WHERE hire_requests.student_id = $1
         ORDER BY hire_requests.created_at DESC`,
        [studentId]
    );
};

// Get hiring requests sent by a client or student
exports.getRequestsByRequester = async (requesterId) => {
    return db.any(
        `SELECT
            hire_requests.*,
            users.full_name AS student_name
         FROM hire_requests
         JOIN users
            ON hire_requests.student_id = users.id
         WHERE hire_requests.client_id = $1
         ORDER BY hire_requests.created_at DESC`,
        [requesterId]
    );
};

// Keep the old function working for the client dashboard
exports.getRequestsByClient = exports.getRequestsByRequester;

// Update hiring request status (Accept or Reject)
exports.updateRequestStatus = async (requestId, studentId, status) => {
    return db.oneOrNone(
        `UPDATE hire_requests
         SET status = $1
         WHERE id = $2
         AND student_id = $3
         AND status = 'pending'
         RETURNING *`,
        [status, requestId, studentId]
    );
};
// 
// Update the work progress of an accepted hiring request
exports.updateWorkStatus = async (requestId, studentId, workStatus) => {
    return db.oneOrNone(
        `UPDATE hire_requests
         SET work_status = $1
         WHERE id = $2
         AND student_id = $3
         AND status = 'accepted'
         RETURNING *`,
        [workStatus, requestId, studentId]
    );
};
module.exports = exports;
