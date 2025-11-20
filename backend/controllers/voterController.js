import Election from '../models/Election.js';
import User from '../models/User.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../errors/customErrors.js';

// Cast a vote
export const castVote = async (req, res) => {
  const { candidateId } = req.body;
  const electionId = req.params.electionId;
  const voterId = req.user.id;

  // Check if election exists and is active
  const election = await Election.findById(electionId);
  if (!election) {
    throw new NotFoundError('Election not found');
  }

  const now = new Date();
  if (now < new Date(election.startDate) || now > new Date(election.endDate)) {
    throw new BadRequestError('Election is not active');
  }

  // Check if voter exists
  const voter = await User.findById(voterId);
  if (!voter) {
    throw new NotFoundError('Voter not found');
  }

  // Check if voter has already voted
  if (election.voters.some((v) => String(v) === String(voterId))) {
    throw new BadRequestError('You have already voted in this election');
  }

  // Check if candidate exists
  const candidate = election.candidates.id(candidateId);
  if (!candidate) {
    throw new NotFoundError('Candidate not found');
  }

  // Add vote
  election.voters.push(voterId);
  election.voted = (election.voted || 0) + 1;

  // Update results (track votes per candidate on the election)
  if (!election.results) {
    election.results = new Map();
  }

  const currentVotes = election.results.get(candidateId) || 0;
  election.results.set(candidateId, currentVotes + 1);

  await election.save();

  res.json({
    message: 'Vote cast successfully',
    election: {
      id: election._id,
      title: election.title,
      voted: election.voted,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        votes: election.results
          ? election.results.get(String(candidate._id)) || 0
          : 0,
      },
    },
  });
};

// Get election results
export const getResults = async (req, res) => {
  const election = await Election.findById(req.params.electionId);
  if (!election) {
    throw new NotFoundError('Election not found');
  }

  // Only show results to the public when the election is active or completed
  if (election.status !== 'active' && election.status !== 'completed') {
    throw new ForbiddenError(
      'Results are only available while the election is active or after it is completed'
    );
  }

  const results = election.candidates.map((candidate) => {
    const candidateId = String(candidate._id);
    const votes = election.results ? election.results.get(candidateId) || 0 : 0;

    return {
      id: candidate._id,
      name: candidate.name,
      party: candidate.party,
      gender: candidate.gender,
      votes,
      percentage:
        election.voted > 0 ? ((votes / election.voted) * 100).toFixed(2) : 0,
    };
  });

  results.sort((a, b) => b.votes - a.votes);

  res.json({
    election: {
      id: election._id,
      title: election.title,
      totalVoters: election.voters.length,
      voted: election.voted,
      startDate: election.startDate,
      endDate: election.endDate,
    },
    results,
  });
};
