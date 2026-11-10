
const db = require("../config/database");

// Get all available jobs
exports.getAllJobs = async () => {
    return db.any(
        "SELECT * FROM jobs WHERE status = 'open' ORDER BY created_at DESC"
    );
};

// Create a new job
exports.createJob = async (
    clientId,
    title,
    description,
    budget,
    category,
    deadline
) => {
    return db.one(
        `INSERT INTO jobs
        (client_id, title, description, budget, category, deadline)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [clientId, title, description, budget, category, deadline]
    );
};

// Get all jobs for admin dashboard
exports.getAllJobsForAdmin = async () => {
    return db.any(
        `SELECT
            jobs.*,
            users.full_name AS poster_name,
            users.email AS poster_email
         FROM jobs
         LEFT JOIN users
         ON jobs.client_id = users.id
         ORDER BY jobs.created_at DESC`
    );
};

// Get job statistics for admin dashboard
exports.getJobStatistics = async () => {
    return db.one(
        `SELECT
            COUNT(*) AS total_jobs,
            COUNT(*) FILTER (WHERE status = 'open') AS open_jobs,
            COUNT(*) FILTER (WHERE status = 'closed') AS closed_jobs,
            COUNT(*) FILTER (
                WHERE created_at::date = CURRENT_DATE
            ) AS jobs_today
         FROM jobs`
    );
};

// Update job status (open or closed)
exports.updateJobStatus = async (jobId, status) => {
    return db.oneOrNone(
        `UPDATE jobs
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [status, jobId]
    );
};

// Permanently delete a job and its applications
// Permanently delete a closed job and its applications
exports.deleteJob = async (jobId) => {
    return db.tx(async (transaction) => {

        // Check whether the job exists and is closed
        const job = await transaction.oneOrNone(
            "SELECT id, status FROM jobs WHERE id = $1 FOR UPDATE",
            [jobId]
        );

        if (!job) {
            return null;
        }

        // Do not allow open jobs to be deleted
        if (job.status !== "closed") {
            const error = new Error("Only closed jobs can be deleted.");
            error.code = "JOB_NOT_CLOSED";
            throw error;
        }

        // Delete applications belonging to this job
        await transaction.none(
            "DELETE FROM applications WHERE job_id = $1",
            [jobId]
        );

        // Delete the job
        return transaction.oneOrNone(
            "DELETE FROM jobs WHERE id = $1 RETURNING *",
            [jobId]
        );
    });
};

    