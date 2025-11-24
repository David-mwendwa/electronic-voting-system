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
    updatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    // Ensure there's only one settings document
    minimize: false,
  }
);

// Static method to get or create settings
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      maintenanceMode: false,
      registrationEnabled: true,
      updatedBy: 'system',
    });
  }
  return settings;
};

export default mongoose.model('Settings', settingsSchema);
