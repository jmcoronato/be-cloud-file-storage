import pkg from 'jsonwebtoken';
const { verify } = pkg;
// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {

    if (!req.header('Authorization'))
        return res.status(401).json({ message: 'Access denied. No token provided.' });


    const token = req.header('Authorization').replace('Bearer ', '');

    try {
        const decoded = verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adjunta la info del usuario al request
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid user token' });
    }
};

export default verifyToken;
