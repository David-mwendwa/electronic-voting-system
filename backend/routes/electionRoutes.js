import express from 'express';
import {
  getElections,
  getElection,
  createElection,
  updateElection,
  deleteElection,
  updateElectionStatus,
  getElectionsByStatus,
} from '../controllers/electionController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
const router = express.Router();

// Base route for all elections
router
  .route('/')
  .get(getElections)
  .post(authenticate, authorizeRoles('admin'), createElection);

// Status-based routes
router.route('/status/:status').get(getElectionsByStatus);

// Single election operations
router
  .route('/:id')
  .get(getElection)
  .patch(authenticate, authorizeRoles('admin'), updateElection)
  .delete(authenticate, authorizeRoles('admin'), deleteElection);

// Status update for specific election
router
  .route('/:id/status')
  .patch(authenticate, authorizeRoles('admin'), updateElectionStatus);

export default router;
