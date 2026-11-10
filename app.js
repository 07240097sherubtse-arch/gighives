
require("dotenv").config();

const db = require("./config/database");
const express = require("express");
const path = require("path");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

// Routes
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const authRoutes = require("./routes/authRoutes");
const pageRoutes = require("./routes/pageRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const hireRequestRoutes = require("./routes/hireRequestRoutes");
const hireRequestStudentRoutes = require("./routes/hireRequestStudentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Models
const notificationModel = require("./models/notificationModel");

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    store: new pgSession({
        conString: process.env.DATABASE_URL,
        tableName: "user_sessions",
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    }
}));
// Make the logged-in user available in all EJS pages
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Make unread notification count available in all EJS pages
app.use(async (req, res, next) => {
    try {
        if (req.session.user) {
            const result =
                await notificationModel.getUnreadNotificationCount(
                    req.session.user.id
                );

            res.locals.unreadNotificationCount = result.count;
        } else {
            res.locals.unreadNotificationCount = 0;
        }

        next();

    } catch (error) {
        console.error("Notification count error:", error);
        res.locals.unreadNotificationCount = 0;
        next();
    }
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/test-css", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "css", "style.css"));
});

// Connect student profile routes
app.use(studentProfileRoutes);

// Connect routes
app.use("/", pageRoutes);
app.use("/", userRoutes);
app.use(authRoutes);
app.use("/", jobRoutes);
app.use("/", applicationRoutes);
app.use("/", hireRequestRoutes);
app.use("/", hireRequestStudentRoutes);
app.use("/", notificationRoutes);

// Check database connection
db.one("SELECT NOW() AS current_time")
    .then((result) => {
        console.log("Database connected successfully!");
        console.log("Database time:", result.current_time);
    })
    .catch((error) => {
        console.log("Database connection failed!");
        console.log(error.message);
    });

// Start server
app.listen(PORT, () => {
    console.log(`GigHives is running at http://localhost:${PORT}`);
});
