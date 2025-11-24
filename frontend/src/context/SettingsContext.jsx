import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  getSettings,
  updateSettings as updateSettingsApi,
} from '../api/settingsService';

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
      const data = await getSettings();
      setSettings((prev) => ({
        ...prev,
        ...data,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettings((prev) => ({
        ...prev,
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
      const updatedSettings = await updateSettingsApi(updates);
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
