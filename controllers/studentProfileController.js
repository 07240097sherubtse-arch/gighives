
const studentProfileModel = require("../models/studentProfileModel");

// Display the student's profile form
exports.showProfileForm = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const profile =
            await studentProfileModel.getProfileByUserId(userId);

       res.render("student/profile", {
    user: req.session.user,
    profile: profile,
    success: req.query.success === "1"
});
    } catch (error) {
        console.error("Error loading profile:", error);
        res.status(500).send("Could not load profile.");
    }
};

// Save the student's profile
exports.saveProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const { bio, skills, experience, portfolio_url } = req.body;

        await studentProfileModel.saveProfile(
            userId,
            bio,
            skills,
            experience,
            portfolio_url
        );

       res.redirect("/student/profile?success=1");

    } catch (error) {
        console.error("Error saving profile:", error);
        res.status(500).send("Could not save profile.");
    }
};
// Display all available student freelancers
exports.showAllFreelancers = async (req, res) => {
    try {
        const freelancers =
            await studentProfileModel.getAllStudentProfiles();

        res.render("hire/index", {
            user: req.session.user,
            freelancers: freelancers
        });

    } catch (error) {
        console.error("Error loading freelancers:", error);
        res.status(500).send("Could not load freelancers.");
    }
};