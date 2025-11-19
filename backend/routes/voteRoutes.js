import express from 'express';
import { castVote, getResults } from '../controllers/voterController.js';

const router = express.Router();

// Cast a vote and get election results
router.route('/election/:electionId').post(castVote);

router.route('/election/:electionId/results').get(getResults);

export default router;
