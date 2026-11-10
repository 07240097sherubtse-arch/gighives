
const jobModel = require("../models/jobModel");
const userModel = require("../models/userModel");
const notificationModel = require("../models/notificationModel");

// Display all available jobs
exports.showJobs = async (req, res) => {
    try {
        const jobs = await jobModel.getAllJobs();

        res.render("jobs/index", {
    jobs: jobs,
    user: req.session.user || null,
    applicationSuccess: req.query.applied === "success"
});

    } catch (error) {
        console.error("Error retrieving jobs:", error);
        res.status(500).send("Could not load jobs");
    }
};

// Handle job posting form submission
exports.postJob = async (req, res) => {
    try {
        const { title, description, budget, category, deadline } = req.body;

        const clientId = req.session.user.id;

        await jobModel.createJob(
            clientId,
            title,
            description,
            budget,
            category,
            deadline || null
        );
        // Get all users
const users = await userModel.getAllUsers();

// Notify all students about the new job
for (const user of users) {
    if (user.role === "student") {
        await notificationModel.createNotification(
            user.id,
            `A new job opportunity is available: ${title}`,
            "job",
            "/jobs"
        );
    }
}

        res.redirect("/jobs");

    } catch (error) {
        console.error("Job posting error:", error);
        res.status(500).send("Could not post job");
    }
};
// Admin: Display all posted jobs
exports.showAllJobsForAdmin = async (req, res) => {
    try {
        const jobs = await jobModel.getAllJobsForAdmin();

        res.render("admin/jobs", {
            user: req.session.user,
            jobs: jobs
        });

    } catch (error) {
        console.error("Admin job management error:", error);
        res.status(500).send("Could not load jobs for administration.");
    }
};
// Admin: Close or reopen a job
exports.updateJobStatus = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const { status } = req.body;

        // Only allow these two statuses
        if (!["open", "closed"].includes(status)) {
            return res.status(400).send("Invalid job status.");
        }

        await jobModel.updateJobStatus(jobId, status);

        res.redirect("/admin/jobs");

    } catch (error) {
        console.error("Job status update error:", error);
        res.status(500).send("Could not update job status.");
    }
};
// Admin: Permanently delete a job
exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;

        const deletedJob = await jobModel.deleteJob(jobId);

        if (!deletedJob) {
            return res.status(404).send("Job not found.");
        }

        res.redirect("/admin/jobs");

        } catch (error) {
        console.error("Job deletion error:", error);

        if (error.code === "JOB_NOT_CLOSED") {
            return res.status(400).send(
                "Only closed jobs can be deleted. Close the job first."
            );
        }

        res.status(500).send("Could not delete job.");
    }
};