import Election from '../models/Election.js';
import User from '../models/User.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/customErrors.js';
import { getMany, deleteOne } from '../utils/handleAPI.js';

// Get all elections (with filtering, search, pagination via APIFeatures)
export const getElections = getMany(Election);

// Get single election
export const getElection = async (req, res) => {
  const electionDoc = await Election.findById(req.params.id);

  if (!electionDoc) {
    throw new NotFoundError('Election not found');
  }

  // Convert to plain object so we can safely add computed properties
  const election = electionDoc.toObject ? electionDoc.toObject() : electionDoc;

  // Compute whether the current authenticated user has voted in this election
  const userId = req.user?.id;
  let hasVotedForCurrentUser = false;

  if (userId && Array.isArray(election.voters)) {
    hasVotedForCurrentUser = election.voters.some(
      (voterId) => String(voterId) === String(userId)
    );
  }

  election.hasVotedForCurrentUser = hasVotedForCurrentUser;

  // Compute total eligible voters (all non-admin, non-sysadmin users)
  try {
    const eligibleVotersCount = await User.countDocuments({
      role: { $nin: ['admin', 'sysadmin'] },
      status: 'active',
    });
    election.eligibleVotersCount = eligibleVotersCount;
  } catch (err) {
    // If this fails, we simply omit eligibleVotersCount and let the frontend fall back
    console.error('Failed to compute eligibleVotersCount:', err);
  }

  res.json(election);
};

// Create election (admin only)
export const createElection = async (req, res) => {
  const { title, description, startDate, endDate, candidates = [] } = req.body;

  if (!title) {
    throw new BadRequestError('Title is required');
  }

  // For new elections, we'll let the pre-save hook handle status
  // based on the provided dates and validation rules
  const election = new Election({
    title,
    description,
    startDate: startDate || null,
    endDate: endDate || null,
    candidates,
    status: 'draft', // Default status
    createdBy: req.user.id,
  });

  await election.save();
  res.status(201).json(election);
};

// Update election (admin only)
export const updateElection = async (req, res) => {
  const { title, description, startDate, endDate, candidates } = req.body;

  const election = await Election.findById(req.params.id);

  if (!election) {
    throw new NotFoundError('Election not found');
  }

  // Only update fields that were provided (status is computed from dates)
  if (title !== undefined) election.title = title;
  if (description !== undefined) election.description = description;
  if (startDate !== undefined) election.startDate = startDate;
  if (endDate !== undefined) election.endDate = endDate;
  if (candidates !== undefined) election.candidates = candidates;

  await election.save();

  res.json(election);
};

// Update election status (admin only) - only allow cancelling
export const updateElectionStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new BadRequestError('Status is required');
  }

  if (status !== 'cancelled') {
    throw new BadRequestError(
      'Status can only be set to cancelled manually; other states are computed from dates'
    );
  }

  const election = await Election.findById(req.params.id);

  if (!election) {
    throw new NotFoundError('Election not found');
  }

  election.status = 'cancelled';

  await election.save();

  res.json(election);
};

// Get elections by status (delegates to getMany with status preset)
export const getElectionsByStatus = async (req, res, next) => {
  const { status } = req.params;

  const validStatuses = [
    'draft',
    'upcoming',
    'active',
    'completed',
    'cancelled',
  ];

  if (status && !validStatuses.includes(status)) {
    throw new BadRequestError('Invalid status');
  }

  // Inject status into query so getMany can filter on it
  req.query.status = status;

  return getMany(Election)(req, res, next);
};

// Delete election (admin only)
export const deleteElection = deleteOne(Election);

export const deleteAllElections = async (req, res) => {
  const result = await Election.deleteMany({});

  res.status(200).json({
    success: true,
    deletedCount: result.deletedCount,
    message: 'All elections have been deleted',
  });
};

// Cast a vote in an election (authenticated user)
export const voteElection = async (req, res) => {
  const { id } = req.params;
  const { candidateId } = req.body;

  if (!candidateId) {
    throw new BadRequestError('candidateId is required');
  }

  const election = await Election.findById(id);

  if (!election) {
    throw new NotFoundError('Election not found');
  }

  // Only allow voting on active elections
  if (!election.isActive) {
    throw new BadRequestError('This election is not currently active');
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    throw new ForbiddenError('You must be authenticated to vote');
  }

  // Ensure only active users can vote
  const voter = await User.findById(userId).select('status role');

  if (!voter) {
    throw new ForbiddenError(
      'Your account could not be found. Please contact support.'
    );
  }

  if (String(voter.status).toLowerCase() !== 'active') {
    throw new ForbiddenError(
      'Your account is not active. Inactive users cannot cast votes.'
    );
  }

  // Prevent admin and sysadmin accounts from voting in elections
  if (userRole === 'admin' || userRole === 'sysadmin') {
    throw new ForbiddenError(
      `${userRole} accounts are not allowed to vote in elections`
    );
  }

  // Prevent duplicate voting
  const alreadyVoted = election.voters.some(
    (voterId) => String(voterId) === String(userId)
  );

  if (alreadyVoted) {
    throw new BadRequestError('You have already voted in this election');
  }

  // Ensure candidate exists in this election
  const candidateExists = election.candidates.some(
    (candidate) => String(candidate._id) === String(candidateId)
  );

  if (!candidateExists) {
    throw new BadRequestError(
      'Selected candidate does not belong to this election'
    );
  }

  // Update voters list and counters
  election.voters.push(userId);
  election.voted = (election.voted || 0) + 1;

  // Update results map
  const currentCount = election.results.get(String(candidateId)) || 0;
  election.results.set(String(candidateId), currentCount + 1);

  await election.save();

  res.status(200).json(election);
};
