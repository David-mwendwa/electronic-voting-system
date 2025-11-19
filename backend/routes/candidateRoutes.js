import express from 'express';
import {
  getCandidates,
  addCandidate,
  updateCandidate,
  removeCandidate,
} from '../controllers/candidateController.js';

const router = express.Router();

// Get all candidates for an election
router.route('/election/:electionId').get(getCandidates);

// Add candidate to election (admin only)
router.route('/election/:electionId').post(addCandidate);

// Update and remove candidate (admin only)
router
  .route('/election/:electionId/:candidateId')
  .put(updateCandidate)
  .delete(removeCandidate);

export default router;
