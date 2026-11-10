// Homepage
const showHome = (req, res) => {
    res.render("home");
};

// About page
const showAbout = (req, res) => {
    res.render("about");
};

module.exports = {
    showHome,
    showAbout
};