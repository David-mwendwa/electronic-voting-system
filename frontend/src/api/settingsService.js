import apiClient from './apiClient';

export const getSettings = async () => {
  try {
    const response = await apiClient.get('/settings');
    return (
      response.data?.data || {
        maintenanceMode: false,
        registrationEnabled: true,
      }
    );
  } catch (error) {
    // If 404, return default settings
    if (error.response?.status === 404) {
      console.log('Settings endpoint not found, using default settings');
      return {
        maintenanceMode: false,
        registrationEnabled: true,
      };
    }
    console.error('Error fetching settings:', error);
    // Still return default values even on other errors
    return {
      maintenanceMode: false,
      registrationEnabled: true,
    };
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await apiClient.patch('/settings', settings);
    return response.data?.data || settings; // Return updated settings or fallback to input
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error; // Re-throw to let the caller handle it
  }
};
