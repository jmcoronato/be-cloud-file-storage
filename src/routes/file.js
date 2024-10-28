import { Router } from 'express';
import verifyToken from '../middlewares/authMiddleware.js';
import checkMonthlyStorageLimit from '../middlewares/fileMiddleware.js';
import { uploadFile, deleteFile } from '../controllers/fileController.js';

const router = Router();

router.post('/upload', verifyToken, checkMonthlyStorageLimit, uploadFile);
router.delete('/delete/:fileName', verifyToken, deleteFile);

export default router;
