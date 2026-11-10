const hireRequestModel = require("../models/hireRequestModel");

// Show hiring requests received by the student
exports.showMyRequests = async (req, res) => {
    try {
        const studentId = req.session.user.id;

        const requests = await hireRequestModel.getRequestsByStudent(studentId);

        res.render("hire/my-requests", {
            user: req.session.user,
            requests
        });

    } catch (error) {
        console.error("Error retrieving hiring requests:", error);
        res.status(500).send("Error loading hiring requests.");
    }
};

// Accept or reject a hiring request
exports.updateRequestStatus = async (req, res) => {
    try {
        const studentId = req.session.user.id;
        const requestId = req.params.requestId;
        const status = req.body.status;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).send("Invalid request status.");
        }

        const updatedRequest = await hireRequestModel.updateRequestStatus(
            requestId,
            studentId,
            status
        );

        if (!updatedRequest) {
            return res.status(404).send(
                "Request not found or it has already been handled."
            );
        }

        res.redirect("/hire/my-requests");

    } catch (error) {
        console.error("Error updating hiring request:", error);
        res.status(500).send("Error updating hiring request.");
    }
};
// Update the work progress of a project
exports.updateWorkStatus = async (req, res) => {
    try {
        const studentId = req.session.user.id;
        const requestId = req.params.requestId;
        const workStatus = req.body.work_status;

        const allowedStatuses = [
            "In Progress",
            "Submitted",
            "Completed"
        ];

        if (!allowedStatuses.includes(workStatus)) {
            return res.status(400).send("Invalid work status.");
        }

        const updatedRequest = await hireRequestModel.updateWorkStatus(
            requestId,
            studentId,
            workStatus
        );

        if (!updatedRequest) {
            return res.status(404).send(
                "Accepted request not found."
            );
        }

        res.redirect("/hire/my-requests");

    } catch (error) {
        console.error("Error updating work progress:", error);
        res.status(500).send("Error updating work progress.");
    }
};