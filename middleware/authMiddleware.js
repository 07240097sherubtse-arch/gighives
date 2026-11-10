
const userModel = require("../models/userModel");

async function requireLogin(req, res, next) {

    try {
        // Check whether a user is logged in
        if (!req.session.user) {
            return res.redirect("/login");
        }

        // Get the latest account information from the database
        const user = await userModel.getUserById(
            req.session.user.id
        );

        // Check whether the account still exists
        if (!user) {
            req.session.destroy(() => {
                return res.redirect("/login");
            });
            return;
        }

        // Check whether the account has been suspended
        if (user.account_status === "suspended") {
            req.session.destroy(() => {
                return res.redirect("/login?error=suspended");
            });
            return;
        }

        // Allow active users to continue
        next();

    } catch (error) {
        console.error("Authentication middleware error:", error);
        return res.status(500).send("Something went wrong.");
    }
}

module.exports = requireLogin;
