import pkg from 'bcryptjs';
const { compare } = pkg;
import pkg2 from 'jsonwebtoken';
const { sign } = pkg2;
import db from '../db/sqlite.js';

export function login(req, res) {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

        // Generamos token JWT con los datos del usuario
        const token = sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        // devuelvo el token y el tiempo de expiracion
        res.json({ token, expiresIn });
    });
}
