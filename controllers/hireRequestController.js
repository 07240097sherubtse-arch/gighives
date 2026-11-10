
const hireRequestModel = require("../models/hireRequestModel");
const db = require("../config/database");
const applicationModel = require("../models/applicationModel");

// Check whether the logged-in user is a client
const requireClient = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "client") {
        return res.status(403).send("Only clients can hire freelancers.");
    }

    next();
};

// Allow both clients and students to send hiring requests
const requireRequester = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (!["client", "student"].includes(req.session.user.role)) {
        return res.status(403).send(
            "Only clients and students can hire freelancers."
        );
    }

    next();
};

// Show the hiring request form
exports.showHireForm = [
    requireRequester,
    async (req, res) => {
        try {
            const studentId = req.params.studentId;

            const student = await db.oneOrNone(
                `SELECT id, full_name
                 FROM users
                 WHERE id = $1 AND role = 'student'`,
                [studentId]
            );

            if (!student) {
                return res.status(404).send("Student not found.");
            }

            res.render("hire/request", {
                student: student,
                user: req.session.user
            });

        } catch (error) {
            console.error("Error loading hiring form:", error);
            res.status(500).send("Could not load hiring form.");
        }
    }
];

// Submit a hiring request
exports.submitHireRequest = [
    requireRequester,
    async (req, res) => {
        try {
           const requesterId = req.session.user.id;
           const requesterRole = req.session.user.role;
           const studentId = req.params.studentId;

            const {
                project_title,
                description,
                budget,
                deadline
            } = req.body;

            if (
                !project_title ||
                !description ||
                !budget ||
                Number(budget) <= 0
            ) {
                return res.status(400).send(
                    "Please provide a project title, description, and valid budget."
                );
            }

            const student = await db.oneOrNone(
    `SELECT id, full_name
     FROM users
     WHERE id = $1 AND role = 'student'`,
    [studentId]
);
            if (!student) {
                return res.status(404).send("Student not found.");
            }

            if (Number(studentId) === Number(requesterId)) {
                return res.status(400).send(
                    "You cannot send a hiring request to yourself."
                );
            }

            await hireRequestModel.createHireRequest(
                requesterId,
                studentId,
                project_title,
                description,
                budget,
                deadline || null,
                requesterRole
            );

            res.render("hire/success", {
    studentName: student.full_name
});

        } catch (error) {
            console.error("Error submitting hiring request:", error);
            res.status(500).send("Could not submit hiring request.");
        }
    }
];

// Show hiring requests sent by the logged-in client
exports.showMySentRequests = [
    requireRequester,
    async (req, res) => {
        try {
            const requesterId = req.session.user.id;
            
            const requests = await hireRequestModel.getRequestsByRequester(requesterId);

            res.render("hire/my-sent-requests", {
                user: req.session.user,
                requests
            });

        } catch (error) {
            console.error("Error retrieving sent hiring requests:", error);
            res.status(500).send("Could not load your hiring requests.");
        }
    }
];
// Show the client dashboard

exports.showClientDashboard = [
    requireClient,
    async (req, res) => {
        try {
            const clientId = req.session.user.id;

            // Get direct hiring requests
            const requests =
                await hireRequestModel.getRequestsByClient(clientId);

            // Get applications received for the client's posted jobs
            const applications =
                await applicationModel.getApplicationsForOwner(clientId);

            // Display everything in one dashboard
            res.render("client/dashboard", {
                user: req.session.user,
                requests,
                applications
            });

        } catch (error) {
            console.error("Error loading client dashboard:", error);
            res.status(500).send("Could not load client dashboard.");
        }
    }
];
