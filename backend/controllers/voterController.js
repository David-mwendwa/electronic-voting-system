import Election from '../models/Election.js';
import User from '../models/User.js';

// Cast a vote
export const castVote = async (req, res) => {
  try {
    const { candidateId, voterId } = req.body;
    const electionId = req.params.electionId;

    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const now = new Date();
    if (
      now < new Date(election.startDate) ||
      now > new Date(election.endDate)
    ) {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Check if voter exists
    const voter = await User.findById(voterId);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    // Check if voter has already voted
    if (election.voters.includes(voterId)) {
      return res
        .status(400)
        .json({ message: 'You have already voted in this election' });
    }

    // Check if candidate exists
    const candidate = election.candidates.id(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Add vote
    election.voters.push(voterId);
    election.voted = (election.voted || 0) + 1;

    // Update results (track votes per candidate on the election)
    if (!election.results) {
      election.results = {};
    }
    election.results[candidateId] = (election.results[candidateId] || 0) + 1;

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
          votes: election.results[candidateId] || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get election results
export const getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const results = election.candidates.map((candidate) => {
      const candidateId = String(candidate._id);
      const votes = (election.results && election.results[candidateId]) || 0;

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
