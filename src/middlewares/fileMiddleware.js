import db from '../db/sqlite.js';

const MAX_STORAGE_BYTES = 5 * Math.pow(2, 30) // 5 GB

const checkMonthlyStorageLimit = (req, res, next) => {
    const userId = req.user.userId;
    const query = `
        SELECT IFNULL(SUM(size), 0) AS total_storage
        FROM file
        WHERE user_id = ? AND substr(uploaded_date,6, 2) = strftime('%m')
    `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }

        const totalStorageUsed = row.total_storage || 0;

        // console.log(totalStorageUsed);

        // Verificar si supera el limite
        if (totalStorageUsed >= MAX_STORAGE_BYTES) {
            return res.status(401).json({ message: 'Storage limit exceeded. Cannot upload more files this month.' });
        }

        // Si no supera el limite continuo con la solicitud
        next();
    });
};

export default checkMonthlyStorageLimit;
