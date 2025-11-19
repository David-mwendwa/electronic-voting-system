import Election from '../models/Election.js';

// Get all candidates for an election
export const getCandidates = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election.candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add candidate to election (admin only)
export const addCandidate = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    election.candidates.push(req.body);
    await election.save();

    res.status(201).json(election.candidates[election.candidates.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update candidate (admin only)
export const updateCandidate = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidate = election.candidates.id(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    Object.assign(candidate, req.body);
    await election.save();

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove candidate from election (admin only)
export const removeCandidate = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    election.candidates.pull(req.params.candidateId);
    await election.save();

    res.json({ message: 'Candidate removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
