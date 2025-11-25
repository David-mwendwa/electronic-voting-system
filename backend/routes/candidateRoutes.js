import express from 'express';
import {
  getCandidates,
  addCandidate,
  updateCandidate,
  removeCandidate,
} from '../controllers/candidateController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/******************[ PUBLIC ROUTES ]******************/
// Anyone can view candidates
router.route('/election/:electionId').get(getCandidates);

/******************[ ADMIN ROUTES ]******************/
// Both admin and sysadmin can manage candidates
const adminRoles = ['admin', 'sysadmin'];

// Add candidate to election
router
  .route('/election/:electionId')
  .post(authenticate, authorizeRoles(adminRoles), addCandidate);

// Update and remove candidate
router
  .route('/election/:electionId/:candidateId')
  .patch(authenticate, authorizeRoles(adminRoles), updateCandidate)
  .delete(authenticate, authorizeRoles(adminRoles), removeCandidate);

export default router;
