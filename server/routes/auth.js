import express from 'express';
import authenticateToken from '../middleware/auth.js';
import {registerUser,loginUser,getCurrentUser} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateToken, getCurrentUser);

export default router;