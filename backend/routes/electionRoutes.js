import express from 'express';
import {
  getElections,
  getElection,
  createElection,
  updateElection,
  deleteElection,
} from '../controllers/electionController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
const router = express.Router();

// Get all elections
router.route('/').get(getElections);

// Create election (admin only)
router.route('/').post(authenticate, authorizeRoles('admin'), createElection);

// Get, update, and delete single election
router
  .route('/:id')
  .get(getElection)
  .patch(authenticate, authorizeRoles('admin'), updateElection)
  .delete(authenticate, authorizeRoles('admin'), deleteElection);

export default router;
