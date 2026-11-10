
const db = require("../config/database");

// Submit an application for a job
exports.createApplication = async (jobId, studentId, coverLetter) => {
    return db.one(
        `INSERT INTO applications
        (job_id, student_id, cover_letter)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [jobId, studentId, coverLetter]
    );
};

// Check whether a student has already applied
exports.hasApplied = async (jobId, studentId) => {
    return db.oneOrNone(
        `SELECT * FROM applications
         WHERE job_id = $1 AND student_id = $2`,
        [jobId, studentId]
    );
};

// Get applications for jobs posted by a particular user
exports.getApplicationsForOwner = async (ownerId) => {
    return db.any(
        `SELECT
            applications.id AS application_id,
            applications.cover_letter,
            applications.status,
            applications.applied_at,
            jobs.id AS job_id,
            jobs.title AS job_title,
            users.full_name AS student_name,
            users.email AS student_email
         FROM applications
         JOIN jobs
            ON applications.job_id = jobs.id
         JOIN users
            ON applications.student_id = users.id
         WHERE jobs.client_id = $1
         ORDER BY applications.applied_at DESC`,
        [ownerId]
    );
};

// Update an application's status
exports.updateApplicationStatus = async (applicationId, ownerId, status) => {
    return db.oneOrNone(
        `UPDATE applications
         SET status = $1
         FROM jobs
         WHERE applications.id = $2
         AND applications.job_id = jobs.id
         AND jobs.client_id = $3
         RETURNING applications.*`,
        [status, applicationId, ownerId]
    );
};


// Get all applications submitted by a student
exports.getApplicationsByStudent = async (studentId) => {
    return db.any(
        `SELECT
            applications.id AS application_id,
            applications.cover_letter,
            applications.status,
            applications.applied_at,
            jobs.title AS job_title,
            jobs.budget,
            users.full_name AS job_owner
         FROM applications
         JOIN jobs
            ON applications.job_id = jobs.id
         JOIN users
            ON jobs.client_id = users.id
         WHERE applications.student_id = $1
         ORDER BY applications.applied_at DESC`,
        [studentId]
     );
    }
// Get the client who owns a job
exports.getJobOwner = async (jobId) => {
    return db.oneOrNone(
        `SELECT client_id, title
         FROM jobs
         WHERE id = $1`,
        [jobId]
    );
};
// Get all applications for admin dashboard
exports.getAllApplicationsForAdmin = async () => {
    return db.any(
        `SELECT
            applications.id AS application_id,
            applications.cover_letter,
            applications.status,
            applications.applied_at,
            jobs.id AS job_id,
            jobs.title AS job_title,
            users.full_name AS student_name,
            users.email AS student_email
         FROM applications
         JOIN jobs
            ON applications.job_id = jobs.id
         JOIN users
            ON applications.student_id = users.id
         ORDER BY applications.applied_at DESC`
    );
};

// Get application statistics for admin dashboard
exports.getApplicationStatistics = async () => {
    return db.one(
        `SELECT
            COUNT(*) AS total_applications,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending_applications,
            COUNT(*) FILTER (WHERE status = 'accepted') AS accepted_applications,
            COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_applications
         FROM applications`
    );
};