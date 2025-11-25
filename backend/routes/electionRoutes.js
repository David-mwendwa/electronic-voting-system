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

/******************[ PUBLIC ROUTES ]******************/
// Anyone can view elections and their status
router.route('/').get(getElections);
router.route('/status/:status').get(getElectionsByStatus);
router.route('/:id').get(getElection);

/******************[ ADMIN ROUTES ]******************/
// Both admin and sysadmin can manage elections
const adminRoles = ['admin', 'sysadmin'];

// Create new election
router
  .route('/')
  .post(authenticate, authorizeRoles(adminRoles), createElection);

// Update and delete election
router
  .route('/:id')
  .patch(authenticate, authorizeRoles(adminRoles), updateElection)
  .delete(authenticate, authorizeRoles(adminRoles), deleteElection);

// Update election status
router
  .route('/:id/status')
  .patch(authenticate, authorizeRoles(adminRoles), updateElectionStatus);

export default router;
