import Election from '../models/Election.js';
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
  const election = await Election.findById(req.params.id);

  if (!election) {
    throw new NotFoundError('Election not found');
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
