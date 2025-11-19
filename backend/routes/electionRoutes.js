import express from 'express';
import {
  getElections,
  getElection,
  createElection,
  updateElection,
  deleteElection,
} from '../controllers/electionController.js';

const router = express.Router();

// Get all elections
router.route('/').get(getElections);

// Create election (admin only)
router.route('/').post(createElection);

// Get, update, and delete single election
router
  .route('/:id')
  .get(getElection)
  .put(updateElection)
  .delete(deleteElection);

export default router;
