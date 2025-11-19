import Election from '../models/Election.js';
import { BadRequestError } from '../errors/customErrors.js';

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
    const { title, description, startDate, endDate } = req.body;

    // Only title is required for draft creation
    if (!title) {
      throw new BadRequestError('Please provide title');
    }

    // Determine status based on provided fields
    let status = 'draft';
    if (title && description && startDate && endDate) {
      // Check if at least 2 candidates are provided
      const candidates = req.body.candidates || [];
      if (candidates.length >= 2) {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now >= start && now <= end) {
          status = 'active';
        } else if (now < start) {
          status = 'upcoming';
        } else if (now > end) {
          status = 'completed';
        }
      }
    }

    const election = new Election({
      title,
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      status,
      createdBy: req.user.id,
    });

    await election.save();
    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update election (admin only)
export const updateElection = async (req, res) => {
  try {
    const { startDate, endDate, ...otherFields } = req.body;

    // Auto-update status based on complete election information
    let updateData = { ...otherFields };

    // Get current election to check all fields
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Merge current and updated fields
    const finalTitle =
      otherFields.title !== undefined ? otherFields.title : election.title;
    const finalDescription =
      otherFields.description !== undefined
        ? otherFields.description
        : election.description;
    const finalStartDate =
      startDate !== undefined ? startDate : election.startDate;
    const finalEndDate = endDate !== undefined ? endDate : election.endDate;

    // Only update status if all required fields are complete
    if (finalTitle && finalDescription && finalStartDate && finalEndDate) {
      // Check if election has at least 2 candidates (current or updated)
      const candidates =
        otherFields.candidates !== undefined
          ? otherFields.candidates
          : election.candidates;
      if (candidates.length >= 2) {
        const now = new Date();
        const start = new Date(finalStartDate);
        const end = new Date(finalEndDate);

        if (now >= start && now <= end) {
          updateData.status = 'active';
        } else if (now < start) {
          updateData.status = 'upcoming';
        } else if (now > end) {
          updateData.status = 'completed';
        }
      } else {
        // Not enough candidates, keep as draft
        updateData.status = 'draft';
      }
    } else {
      // If any required field is missing, set to draft
      updateData.status = 'draft';
    }

    // Update dates if provided
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;

    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedElection) {
      return res.status(404).json({ message: 'Election not found' });
    }

    res.json(updatedElection);
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
