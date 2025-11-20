import express from 'express';
import {
  getCandidates,
  addCandidate,
  updateCandidate,
  removeCandidate,
} from '../controllers/candidateController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all candidates for an election
router.route('/election/:electionId').get(getCandidates);

// Add candidate to election (admin only)
router
  .route('/election/:electionId')
  .post(authenticate, authorizeRoles('admin'), addCandidate);

// Update and remove candidate (admin only)
router
  .route('/election/:electionId/:candidateId')
  .patch(authenticate, authorizeRoles('admin'), updateCandidate)
  .delete(authenticate, authorizeRoles('admin'), removeCandidate);

export default router;
