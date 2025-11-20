import express from 'express';
import { castVote, getResults } from '../controllers/voterController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Cast a vote in an election (authenticated users only)
router.route('/election/:electionId').post(authenticate, castVote);

// Get public election results (only when active or completed)
router.route('/election/:electionId/results').get(getResults);

export default router;
