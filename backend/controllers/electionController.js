import Election from '../models/Election.js';

// Get all elections
export const getElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single election
export const getElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create election (admin only)
export const createElection = async (req, res) => {
  try {
    const election = new Election(req.body);
    await election.save();
    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update election (admin only)
export const updateElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete election (admin only)
export const deleteElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
