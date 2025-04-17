import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { userApi } from "../services/api";
import {
  FiSettings,
  FiMoon,
  FiSun,
  FiMonitor,
  FiBell,
  FiToggleRight,
  FiToggleLeft,
  FiCheck,
  FiAlertCircle,
  FiVolume2,
} from "react-icons/fi";

const UserSettingsPage = () => {
  const { user, theme, setTheme, updateUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [sound, setSound] = useState(true);

  // Load user preferences on component mount
  useEffect(() => {
    if (user?.preferences) {
      // Set theme from context (already handled)
      setNotifications(user.preferences.notifications_enabled !== false);
      setEmailNotifications(user.preferences.email_notifications === true);
      setLanguage(user.preferences.language || "en");
      setSound(user.preferences.sound_enabled !== false);
    }
  }, [user]);

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct preferences object with all values explicitly set
      const preferences = {
        theme: theme || "light",
        notifications_enabled: notifications === true,
        email_notifications: emailNotifications === true,
        sound_enabled: sound === true,
        language: language || "en",
      };

      // Create FormData object
      const formData = new FormData();
      formData.append("preferences", JSON.stringify(preferences));

      // Update user in the database
      const response = await userApi.updateProfile(user.id, formData);

      // Update local user context
      if (response && response.data) {
        updateUser({
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences,
          },
        });

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Preferences update error:", err);
      setError(
        `Failed to save preferences: ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
          <FiAlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 flex items-center">
          <FiCheck className="mr-2" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <FiSettings className="text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Application Settings</h2>
          </div>

          {/* Theme Settings */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-4">Theme</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex items-center p-3 border rounded-lg ${
                  theme === "light"
                    ? "border-primary-600 text-primary-600 bg-primary-50"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <FiSun className="mr-2" />
                <span>Light</span>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center p-3 border rounded-lg ${
                  theme === "dark"
                    ? "border-primary-600 text-primary-600 bg-primary-50"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <FiMoon className="mr-2" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => handleThemeChange("system")}
                className={`flex items-center p-3 border rounded-lg ${
                  theme === "system"
                    ? "border-primary-600 text-primary-600 bg-primary-50"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <FiMonitor className="mr-2" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiBell className="text-gray-500 mr-2" />
                  <span>In-app notifications</span>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className="focus:outline-none"
                >
                  {notifications ? (
                    <FiToggleRight className="text-2xl text-primary-600" />
                  ) : (
                    <FiToggleLeft className="text-2xl text-gray-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiBell className="text-gray-500 mr-2" />
                  <span>Email notifications</span>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className="focus:outline-none"
                >
                  {emailNotifications ? (
                    <FiToggleRight className="text-2xl text-primary-600" />
                  ) : (
                    <FiToggleLeft className="text-2xl text-gray-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiVolume2 className="text-gray-500 mr-2" />
                  <span>Notification sounds</span>
                </div>
                <button
                  onClick={() => setSound(!sound)}
                  className="focus:outline-none"
                >
                  {sound ? (
                    <FiToggleRight className="text-2xl text-primary-600" />
                  ) : (
                    <FiToggleLeft className="text-2xl text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-4">Language</h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        <div className="p-6 flex justify-end">
          <button
            onClick={handleSavePreferences}
            className="btn btn-primary flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">
                  <FiSettings />
                </span>
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
