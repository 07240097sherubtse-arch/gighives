
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

// Display login page
exports.showLogin = (req, res) => {
    res.render("partials/login");
};

// Handle login form submission
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.getUserByEmail(
            email.trim().toLowerCase()
        );

        if (!user) {
            return res.status(401).send("Invalid email or password");
        }
// Check whether the account is suspended
if (user.account_status === "suspended") {
    return res.status(403).send(
        "Your account has been suspended. Please contact the administrator."
    );
}
        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(401).send("Invalid email or password");
        }

        // Regenerate session after successful login
        req.session.regenerate((error) => {
            if (error) {
                console.error("Session error:", error);
                return res.status(500).send("Could not create login session");
            }

            // Store user information
            req.session.user = {
                id: user.id,
                name: user.full_name,
                email: user.email,
                role: user.role
            };

            // Redirect according to account role
            if (user.role === "admin") {
                return req.session.save(() =>
                    res.redirect("/admin/dashboard")
                );
            }

            if (user.role === "student") {
                return req.session.save(() =>
                    res.redirect("/student/dashboard")
                );
            }

            if (user.role === "client") {
                return req.session.save(() =>
                    res.redirect("/client/dashboard")
                );
            }

            // Reject unknown roles
            req.session.destroy(() => {
                return res.status(403).send("Invalid account role");
            });
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Something went wrong");
    }
};

// Check whether a user has an active session
exports.checkSession = (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("You are not logged in.");
    }

    res.json({
        message: "Session is active!",
        user: req.session.user
    });
};

// Handle logout
exports.logoutUser = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).send("Could not log out");
        }

        res.clearCookie("connect.sid");
        res.redirect("/login");
    });
};
