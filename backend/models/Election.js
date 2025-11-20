import mongoose from 'mongoose';
import { BadRequestError } from '../errors/customErrors.js';

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide candidate name'],
      trim: true,
    },
    party: {
      type: String,
      required: [true, 'Please provide candidate party'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
  },
  {
    timestamps: true,
  }
);

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide election title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    candidates: [candidateSchema],
    voters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    voted: {
      type: Number,
      default: 0,
    },
    results: {
      type: Map,
      of: Number,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
electionSchema.index({ startDate: 1, endDate: 1 });
electionSchema.index({ status: 1 });
electionSchema.index({ createdBy: 1 });

// Virtual for checking if election is active
electionSchema.virtual('isActive').get(function () {
  const now = new Date();
  return (
    this.status === 'active' && now >= this.startDate && now <= this.endDate
  );
});

// Pre-save middleware to validate and update status
electionSchema.pre('save', async function (next) {
  const now = new Date();

  // Basic date range validation when both dates are present
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    return next(new BadRequestError('Start date must be before end date'));
  }

  // Skip if this is a new document (let createElection handle initial status)
  if (this.isNew) {
    return next();
  }

  // If status is being modified manually, only allow cancelling
  if (this.isModified('status')) {
    const originalDoc = await this.constructor.findById(this._id);
    if (originalDoc) {
      const oldStatus = originalDoc.status;
      const newStatus = this.status;

      // Admins are only allowed to change status to 'cancelled' manually
      if (newStatus !== oldStatus && newStatus !== 'cancelled') {
        return next(
          new BadRequestError(
            'Status can only be changed to cancelled manually; other states are computed from dates'
          )
        );
      }
    }
  }

  // Auto-update status based on dates if not explicitly set
  if (!this.isModified('status') && this.startDate && this.endDate) {
    if (this.status !== 'cancelled') {
      let nextStatus = this.status;

      // Compute the ideal status from dates
      if (now < this.startDate) {
        nextStatus = 'upcoming';
      } else if (now >= this.startDate && now <= this.endDate) {
        nextStatus = 'active';
      } else if (now > this.endDate) {
        nextStatus = 'completed';
      }

      // If the computed status is different, validate the transition
      if (nextStatus !== this.status) {
        const oldStatus = this.status;

        // Allowed transitions for date-driven changes
        const autoTransitions = {
          draft: ['upcoming', 'active', 'completed'],
          upcoming: ['active'], // do not skip straight to completed
          active: ['completed'],
          completed: [], // completed is terminal for auto logic
          cancelled: [],
        };

        if (!autoTransitions[oldStatus]?.includes(nextStatus)) {
          return next(
            new BadRequestError(
              `Invalid status transition from ${oldStatus} to ${nextStatus}`
            )
          );
        }

        this.status = nextStatus;
      }
    }
  }

  // Validate required fields when not in draft
  if (this.status !== 'draft') {
    if (!this.title || !this.description || !this.startDate || !this.endDate) {
      return next(
        new BadRequestError(
          'Title, description, start date, and end date are required to publish an election'
        )
      );
    }
    if (this.candidates.length < 2) {
      return next(
        new BadRequestError(
          'At least 2 candidates are required to publish an election'
        )
      );
    }
  }

  next();
});

// Method to update status based on current time
// This can be called by a scheduled job to update statuses in bulk
electionSchema.statics.updateElectionStatuses = async function () {
  const now = new Date();

  // Update active elections that have ended
  await this.updateMany(
    {
      status: 'active',
      endDate: { $lt: now },
    },
    { $set: { status: 'completed' } }
  );

  // Update upcoming elections that have started
  await this.updateMany(
    {
      status: 'upcoming',
      startDate: { $lte: now },
      endDate: { $gte: now },
    },
    { $set: { status: 'active' } }
  );

  // Update draft/upcoming elections that have already ended (shouldn't happen but just in case)
  await this.updateMany(
    {
      status: { $in: ['draft', 'upcoming'] },
      endDate: { $lt: now },
    },
    { $set: { status: 'completed' } }
  );
};

export default mongoose.model('Election', electionSchema);
