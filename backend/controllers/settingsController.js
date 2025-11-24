import Settings from '../models/Settings.js';

// @desc    Get application settings
// @route   GET /api/v1/settings
// @access  Public
export const getSettings = async (req, res) => {
  // Get settings or create default if not exists
  let settings = await Settings.findOne();

  if (!settings) {
    // Create default settings if none exist
    settings = await Settings.create({
      maintenanceMode: false,
      registrationEnabled: true,
      updatedBy: 'system',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      maintenanceMode: settings.maintenanceMode,
      registrationEnabled: settings.registrationEnabled,
    },
  });
};

// @desc    Update application settings
// @route   PATCH /api/v1/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  const { maintenanceMode, registrationEnabled } = req.body;
  const userId = req.user?.id || 'system';

  // Find or create settings
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({
      maintenanceMode: false,
      registrationEnabled: true,
      updatedBy: userId,
    });
  }

  // Update fields if provided
  if (typeof maintenanceMode === 'boolean') {
    settings.maintenanceMode = maintenanceMode;
  }
  if (typeof registrationEnabled === 'boolean') {
    settings.registrationEnabled = registrationEnabled;
  }

  settings.updatedBy = userId;
  await settings.save();

  res.status(200).json({
    success: true,
    data: {
      maintenanceMode: settings.maintenanceMode,
      registrationEnabled: settings.registrationEnabled,
    },
  });
};
