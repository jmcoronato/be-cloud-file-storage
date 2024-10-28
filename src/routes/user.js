import { Router } from 'express';
import { getStats } from '../controllers/userController.js';
import verifyToken from '../middlewares/authMiddleware.js';
import verifyAdmin from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/stats', verifyToken, verifyAdmin, getStats); // 2 Middlewares para verificar token y que sea admin

export default router;