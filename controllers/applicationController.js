const applicationModel = require("../models/applicationModel");
const notificationModel = require("../models/notificationModel");

// Handle a student's job application
exports.applyForJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const studentId = req.session.user.id;
        const { coverLetter } = req.body;

        const existingApplication = await applicationModel.hasApplied(
            jobId,
            studentId
        );

        if (existingApplication) {
            return res.status(400).send(
                "You have already applied for this job."
            );
        }

        await applicationModel.createApplication(
            jobId,
            studentId,
            coverLetter
        );

        // Get the client who posted the job
        const job = await applicationModel.getJobOwner(jobId);
        console.log("Job details:", job);

        // Notify the client about the new application
        if (job) {
            await notificationModel.createNotification(
                job.client_id,
                `${req.session.user.name} applied for your job: ${job.title}`,
                "job_application",
                "/my-applications"
            );
        }

        res.redirect("/jobs?applied=success");

    } catch (error) {
        console.error("Application error:", error);
        res.status(500).send("Could not submit your application.");
    }
};

// Display applications for jobs posted by the logged-in user
exports.showApplications = async (req, res) => {
    try {
        const ownerId = req.session.user.id;

        const applications =
            await applicationModel.getApplicationsForOwner(ownerId);

        res.render("applications/index", {
            applications: applications,
            user: req.session.user
        });

    } catch (error) {
        console.error("Error retrieving applications:", error);
        res.status(500).send("Could not load applications.");
    }
};

// Accept or reject a student's application
exports.updateApplication = async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        const ownerId = req.session.user.id;
        const { status } = req.body;

        // Only allow these two status values
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).send("Invalid application status.");
        }

        // Update the application status
        const updatedApplication =
            await applicationModel.updateApplicationStatus(
                applicationId,
                ownerId,
                status
            );
console.log("UPDATE APPLICATION FUNCTION RUNNING");
console.log("Updated application:", updatedApplication);
        if (!updatedApplication) {
            return res.status(404).send(
                "Application not found or access denied."
            );
        }

        // Get the job title
        const job = await applicationModel.getJobOwner(
            updatedApplication.job_id
        );

        // Notify the student about the application status
        if (job) {
            await notificationModel.createNotification(
                updatedApplication.student_id,
                `Your application for ${job.title} has been ${status} by the client.`,
                "application_status",
                "/my-submissions"
            );
        }

        res.redirect("/client/dashboard");

    } catch (error) {
        console.error("Application update error:", error);
        res.status(500).send("Could not update application.");
    }
};

// Display applications submitted by the logged-in student
exports.showMySubmissions = async (req, res) => {
    try {
        const studentId = req.session.user.id;

        const applications =
            await applicationModel.getApplicationsByStudent(studentId);

        res.render("applications/my-submissions", {
            applications: applications,
            user: req.session.user
        });

    } catch (error) {
        console.error("Error retrieving submitted applications:", error);
        res.status(500).send("Could not load your submitted applications.");
    }
};
// Admin: Display all applications
exports.showAllApplicationsForAdmin = async (req, res) => {
    try {
        const applications =
            await applicationModel.getAllApplicationsForAdmin();

        res.render("admin/applications", {
            user: req.session.user,
            applications: applications
        });

    } catch (error) {
        console.error("Admin application management error:", error);
        res.status(500).send(
            "Could not load applications for administration."
        );
    }
};

// Get application statistics for admin dashboard
exports.showApplicationStatistics = async (req, res) => {
    try {
        const statistics =
            await applicationModel.getApplicationStatistics();

        res.render("admin/dashboard", {
            user: req.session.user,
            statistics: statistics
        });

    } catch (error) {
        console.error("Error retrieving application statistics:", error);
        res.status(500).send("Could not load application statistics.");
    }
};