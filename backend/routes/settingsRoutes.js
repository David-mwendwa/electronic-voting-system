import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  getSettings,
  updateSettings,
} from '../controllers/settingsController.js';

const router = express.Router();

router
  .route('/')
  .get(getSettings) // Public access
  .patch(authenticate, authorizeRoles('admin'), updateSettings); // Admin only

export default router;
