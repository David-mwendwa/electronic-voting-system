import mongoose from 'mongoose';

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
      required: [true, 'Please provide election description'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
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

// Pre-save middleware to update status based on dates
electionSchema.pre('save', function (next) {
  const now = new Date();
  if (this.startDate <= now && this.endDate >= now && this.status === 'draft') {
    this.status = 'active';
  } else if (now > this.endDate && this.status === 'active') {
    this.status = 'completed';
  }
  next();
});

export default mongoose.model('Election', electionSchema);
