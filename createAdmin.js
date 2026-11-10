
require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("./config/database");

async function createAdmin() {
    try {
        // Admin account details
        const name = "GigHives Admin";
        const email = "admin@gighives.com";
        const password = "admin##[ADMIN]2026#";

        // Check if the admin email already exists
        const existingUser = await db.oneOrNone(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser) {
            console.log("An account with this email already exists.");
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin into database
        await db.none(
            `INSERT INTO users
            (full_name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)`,
            [name, email, hashedPassword, "admin"]
        );

        console.log("--------------------------------");
        console.log("ADMIN ACCOUNT CREATED!");
        console.log("--------------------------------");
        console.log("Email:", email);
        console.log("Role: admin");
        console.log("Remember to change your temporary password.");
        console.log("--------------------------------");

    } catch (error) {
        console.error("Admin creation failed:", error);
    } finally {
        await db.$pool.end();
    }
}

createAdmin();
