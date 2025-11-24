import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    registrationEnabled: {
      type: Boolean,
      default: true,
    },
    // Add more settings as needed
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    // Only allow one settings document
    minimize: false,
    versionKey: false,
  }
);

// Ensure there's only one settings document
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({});
  if (!settings) {
    // Create a new settings document with a valid ObjectId
    settings = await this.create({
      maintenanceMode: false,
      registrationEnabled: true,
      updatedBy: new mongoose.Types.ObjectId(), // Create a new ObjectId for initial setup
    });
  }
  return settings;
};

export default mongoose.model('Settings', settingsSchema);
