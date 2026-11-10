
function requireStudent(req, res, next) {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    if (req.session.user.role !== "student") {
        return res.status(403).send(
            "Access denied. Only students can perform this action."
        );
    }

    next();
}

module.exports = requireStudent;
