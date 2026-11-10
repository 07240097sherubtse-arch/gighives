
const db = require("../config/database");

// Get a student's profile
exports.getProfileByUserId = async (userId) => {
    return db.oneOrNone(
        `SELECT * FROM student_profiles
         WHERE user_id = $1`,
        [userId]
    );
};

// Create or update a student's profile
exports.saveProfile = async (userId, bio, skills, experience, portfolioUrl) => {
    return db.one(
        `INSERT INTO student_profiles
        (user_id, bio, skills, experience, portfolio_url)
        VALUES ($1, $2, $3, $4, $5)

        ON CONFLICT (user_id)
        DO UPDATE SET
            bio = EXCLUDED.bio,
            skills = EXCLUDED.skills,
            experience = EXCLUDED.experience,
            portfolio_url = EXCLUDED.portfolio_url

        RETURNING *`,
        [userId, bio, skills, experience, portfolioUrl]
    );
};
// Get all student freelancer profiles
exports.getAllStudentProfiles = async () => {
    return db.any(
        `SELECT
            users.id AS user_id,
            users.full_name,
            student_profiles.bio,
            student_profiles.skills,
            student_profiles.experience,
            student_profiles.portfolio_url
         FROM student_profiles
         JOIN users
            ON student_profiles.user_id = users.id
         WHERE users.role = 'student'
         ORDER BY student_profiles.created_at DESC`
    );
};