import Election from '../models/Election.js';
import Settings from '../models/Settings.js';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';

// Get all candidates for an election
export const getCandidates = async (req, res) => {
  const election = await Election.findById(req.params.electionId);
  if (!election) {
    throw new NotFoundError('Election not found');
  }
  res.json(election.candidates);
};

// Add candidate to election (admin only)
export const addCandidate = async (req, res) => {
  // Check if registration is enabled
  const settings = await Settings.getSettings();
  if (!settings.registrationEnabled) {
    throw new BadRequestError('Candidate registration is currently disabled');
  }

  const election = await Election.findById(req.params.electionId);
  if (!election) {
    throw new NotFoundError('Election not found');
  }

  election.candidates.push(req.body);
  await election.save();

  res.status(201).json(election.candidates[election.candidates.length - 1]);
};

// Update candidate (admin only)
export const updateCandidate = async (req, res) => {
  const election = await Election.findById(req.params.electionId);
  if (!election) {
    throw new NotFoundError('Election not found');
  }

  const candidate = election.candidates.id(req.params.candidateId);
  if (!candidate) {
    throw new NotFoundError('Candidate not found');
  }

  Object.assign(candidate, req.body);
  await election.save();

  res.json(candidate);
};

// Remove candidate from election (admin only)
export const removeCandidate = async (req, res) => {
  const election = await Election.findById(req.params.electionId);
  if (!election) {
    throw new NotFoundError('Election not found');
  }

  election.candidates.pull(req.params.candidateId);
  await election.save();

  res.json({ message: 'Candidate removed successfully' });
};
