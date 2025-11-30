import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import apiClient from '../api/apiClient';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    isLoading: true,
    error: null,
  });

  // Load settings from backend on initial render
  const fetchSettings = useCallback(async () => {
    try {
      const response = await apiClient.get('/settings');
      const data = response.data?.data || {
        maintenanceMode: false,
        registrationEnabled: true,
      };

      setSettings((prev) => ({
        ...prev,
        ...data,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      // If 404, fall back to defaults without surfacing an error
      if (error.response?.status === 404) {
        console.log('Settings endpoint not found, using default settings');
        setSettings((prev) => ({
          ...prev,
          maintenanceMode: false,
          registrationEnabled: true,
          isLoading: false,
          error: null,
        }));
        return;
      }

      console.error('Failed to fetch settings:', error);
      setSettings((prev) => ({
        ...prev,
        maintenanceMode: false,
        registrationEnabled: true,
        isLoading: false,
        error: error.message || 'Failed to load settings',
      }));
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update settings in backend
  const updateSettings = async (updates) => {
    try {
      setSettings((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await apiClient.patch('/settings', updates);
      const updatedSettings = response.data?.data || updates;

      setSettings((prev) => ({
        ...prev,
        ...updatedSettings,
        isLoading: false,
      }));

      return updatedSettings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      setSettings((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update settings',
      }));
      throw error;
    }
  };

  const toggleMaintenanceMode = async () => {
    const newValue = !settings.maintenanceMode;
    setSettings((prev) => ({
      ...prev,
      maintenanceMode: newValue,
    }));

    try {
      await updateSettings({ maintenanceMode: newValue });
    } catch (error) {
      // Revert on error
      setSettings((prev) => ({
        ...prev,
        maintenanceMode: !newValue,
      }));
      throw error;
    }
  };

  const toggleRegistration = async () => {
    const newValue = !settings.registrationEnabled;
    setSettings((prev) => ({
      ...prev,
      registrationEnabled: newValue,
    }));

    try {
      await updateSettings({ registrationEnabled: newValue });
    } catch (error) {
      // Revert on error
      setSettings((prev) => ({
        ...prev,
        registrationEnabled: !newValue,
      }));
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        toggleMaintenanceMode,
        toggleRegistration,
      }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;
