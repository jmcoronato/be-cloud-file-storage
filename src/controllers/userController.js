import db from '../db/sqlite.js';

// Get User Stats Controller (Only admins)
export function getStats(req, res) {
    const query = `
        SELECT
        u.id,
        u.username,
        u.role,
        IFNULL(SUM(f.size), 0) AS bytes_consumed_today
        FROM users u
        LEFT JOIN file f ON u.id = f.user_id AND substr(f.uploaded_date, 1, 10) = date()
        GROUP BY u.id, u.username, u.role
        HAVING bytes_consumed_today > 0;
    `;

    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        res.json({ users: rows });
    });
}
