import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Register and Login
router.route('/register').post(register);
router.route('/login').post(login);

export default router;
