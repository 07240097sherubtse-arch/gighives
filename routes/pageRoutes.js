
const express = require("express");
const router = express.Router();

// Homepage
router.get("/", (req, res) => {
    res.render("home", {
        user: req.session.user || null
    });
});

// About page
router.get("/about", (req, res) => {
    res.send("GigHives connects students with freelance opportunities.");
});

module.exports = router;
