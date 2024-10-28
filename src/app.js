import 'dotenv/config'
import express, { json } from 'express';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import fileRoutes from './routes/file.js';

const app = express();

// parsear JSON
app.use(json());

// Rutas
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/file', fileRoutes);

app.disable('x-powered-by')

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
