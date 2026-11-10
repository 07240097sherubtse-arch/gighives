
const userModel = require("../models/userModel");
const applicationModel = require("../models/applicationModel");
const jobModel = require("../models/jobModel");
const bcrypt = require("bcrypt");

// Register a new user
exports.registerUser = async (req, res) => {
    console.log("Registration controller is running!");

    try {
        let { name, email, password, role } = req.body;

        name = name ? name.trim() : "";
        email = email ? email.trim().toLowerCase() : "";

        if (!name || !email || !password || !role) {
            return res.status(400).send("Please fill in all fields");
        }

        if (!["student", "client"].includes(role)) {
            return res.status(403).send("Invalid account type");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).send("Please enter a valid email address");
        }

        if (role === "student" && !email.endsWith("@rub.edu.bt")) {
            return res.status(400).send(
                "Sherubtse students must register using their official RUB email address."
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await userModel.createUser(
            name,
            email,
            hashedPassword,
            role
        );

        return res.redirect("/login");

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "23505") {
            return res.status(409).send(
                "This email is already registered. Please log in instead."
            );
        }

        return res.status(500).send("Something went wrong");
    }
};

// Display all registered users for the admin
exports.showAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();

        res.render("admin/users", {
            user: req.session.user,
            users: users
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Could not load registered users.");
    }
};

// Display admin dashboard with all statistics
exports.showAdminDashboard = async (req, res) => {
    try {
        const userStatistics = await userModel.getUserStatistics();

        const applicationStatistics =
            await applicationModel.getApplicationStatistics();

        const jobStatistics =
            await jobModel.getJobStatistics();

        res.render("admin/dashboard", {
            user: req.session.user,
            userStatistics: userStatistics,
            statistics: applicationStatistics,
            jobStatistics: jobStatistics
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).send("Could not load admin dashboard.");
    }
};
// Admin: Suspend a user account
exports.suspendUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const result = await userModel.suspendUser(userId);

        if (!result) {
            return res.status(404).send("User not found or cannot be suspended.");
        }

        res.redirect("/admin/users");

    } catch (error) {
        console.error("User suspension error:", error);
        res.status(500).send("Could not suspend user.");
    }
};

// Admin: Reactivate a user account
exports.reactivateUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const result = await userModel.reactivateUser(userId);

        if (!result) {
            return res.status(404).send("User not found or cannot be reactivated.");
        }

        res.redirect("/admin/users");

    } catch (error) {
        console.error("User reactivation error:", error);
        res.status(500).send("Could not reactivate user.");
    }
};