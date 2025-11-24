import Settings from '../models/Settings.js';

// @desc    Get application settings
// @route   GET /api/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  const settings = await Settings.getSettings();
  res.json({
    maintenanceMode: settings.maintenanceMode,
    registrationEnabled: settings.registrationEnabled,
  });
};

// @desc    Update application settings
// @route   PATCH /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  const { maintenanceMode, registrationEnabled } = req.body;

  const settings = await Settings.getSettings();

  if (typeof maintenanceMode === 'boolean') {
    settings.maintenanceMode = maintenanceMode;
  }

  if (typeof registrationEnabled === 'boolean') {
    settings.registrationEnabled = registrationEnabled;
  }

  settings.updatedBy = req.user.id;

  await settings.save();

  res.status(200).json({
    success: true,
    data: {
      maintenanceMode: settings.maintenanceMode,
      registrationEnabled: settings.registrationEnabled,
    },
  });
};
