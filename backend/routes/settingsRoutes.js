import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  getSettings,
  updateSettings,
} from '../controllers/settingsController.js';

const router = express.Router();

router
  .route('/')
  .get(authenticate, getSettings)
  .patch(authenticate, authorizeRoles('admin'), updateSettings);

export default router;
