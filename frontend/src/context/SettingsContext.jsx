import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    isLoading: true,
  });

  // Load settings from localStorage on initial render
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
          setSettings((prev) => ({
            ...JSON.parse(savedSettings),
            isLoading: false,
          }));
        } else {
          setSettings((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!settings.isLoading) {
      try {
        localStorage.setItem(
          'appSettings',
          JSON.stringify({
            maintenanceMode: settings.maintenanceMode,
            registrationEnabled: settings.registrationEnabled,
          })
        );
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [
    settings.maintenanceMode,
    settings.registrationEnabled,
    settings.isLoading,
  ]);

  const toggleMaintenanceMode = async () => {
    setSettings((prev) => ({
      ...prev,
      maintenanceMode: !prev.maintenanceMode,
    }));

    // In a real app, you would also update the backend here
    // await api.updateSettings({ maintenanceMode: !settings.maintenanceMode });
  };

  const toggleRegistration = async () => {
    setSettings((prev) => ({
      ...prev,
      registrationEnabled: !prev.registrationEnabled,
    }));

    // In a real app, you would also update the backend here
    // await api.updateSettings({ registrationEnabled: !settings.registrationEnabled });
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
