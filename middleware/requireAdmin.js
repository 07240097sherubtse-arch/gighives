
function requireAdmin(req, res, next) {

    // Check whether the user is logged in
    if (!req.session.user) {
        return res.redirect("/login");
    }

    // Check whether the logged-in user is an admin
    if (req.session.user.role !== "admin") {
        return res.status(403).send(
            "Access denied. Only administrators can access this page."
        );
    }

    // Allow admin to continue
    next();
}

module.exports = requireAdmin;
