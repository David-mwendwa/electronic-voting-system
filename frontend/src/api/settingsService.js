import apiClient from './apiClient';

export const getSettings = async () => {
  try {
    const response = await apiClient.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await apiClient.patch('/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};
