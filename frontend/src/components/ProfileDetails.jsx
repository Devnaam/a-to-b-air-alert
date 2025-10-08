import React from 'react';
import { 
  User, Heart, Shield, Save, AlertTriangle, Info, MapPin, Activity, Zap, Bell, Loader
} from 'lucide-react';

const ProfileDetails = ({
  profile,
  notifications,
  error,
  saved,
  saving,
  healthRisk,
  handleProfileChange,
  handleNotificationChange,
  handleSaveProfile
}) => (
  <div className="grid lg:grid-cols-3 gap-8">
    {/* Profile Section */}
    <div className="lg:col-span-2 space-y-6">
      {/* Personal Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
          <User className="w-5 h-5 text-[#4A90E2]" /><span>Personal Information</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">Full Name</label>
            <input type="text" value={profile.name} onChange={e => handleProfileChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
              placeholder="Enter your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">Email</label>
            <input type="email" value={profile.email} disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              title="Email cannot be changed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">Age</label>
            <input type="number" value={profile.age}
              onChange={e => handleProfileChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
              placeholder="Enter your age" min="1" max="120" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">Activity Level</label>
            <select value={profile.activityLevel}
              onChange={e => handleProfileChange('activityLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]">
              <option value="low">Low (Sedentary)</option>
              <option value="moderate">Moderate (Active)</option>
              <option value="high">High (Very Active)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Health Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" /><span>Health Profile</span>
        </h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="respiratory" checked={profile.hasRespiratoryConditions}
                onChange={e => handleProfileChange('hasRespiratoryConditions', e.target.checked)}
                className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]" />
              <label htmlFor="respiratory" className="text-sm text-gray-700">Respiratory conditions (asthma, COPD, etc.)</label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="heart" checked={profile.hasHeartConditions}
                onChange={e => handleProfileChange('hasHeartConditions', e.target.checked)}
                className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]" />
              <label htmlFor="heart" className="text-sm text-gray-700">Heart conditions</label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="smoker" checked={profile.isSmoker}
                onChange={e => handleProfileChange('isSmoker', e.target.checked)}
                className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]" />
              <label htmlFor="smoker" className="text-sm text-gray-700">Current smoker</label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="pregnant" checked={profile.isPregnant}
                onChange={e => handleProfileChange('isPregnant', e.target.checked)}
                className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]" />
              <label htmlFor="pregnant" className="text-sm text-gray-700">Currently pregnant</label>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="children" checked={profile.hasChildren}
                onChange={e => handleProfileChange('hasChildren', e.target.checked)}
                className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]" />
              <label htmlFor="children" className="text-sm text-gray-700">Traveling with children</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">Air Quality Sensitivity Level</label>
            <select value={profile.sensitivityLevel}
              onChange={e => handleProfileChange('sensitivityLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]">
              <option value="low">Low - I'm generally not sensitive</option>
              <option value="medium">Medium - I notice air quality changes</option>
              <option value="high">High - I'm very sensitive to air quality</option>
            </select>
          </div>
          <div className="p-3 rounded-lg border-l-4"
            style={{ backgroundColor: `${healthRisk.color}15`, borderColor: healthRisk.color }}>
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 mt-0.5" style={{ color: healthRisk.color }} />
              <div>
                <p className="text-sm font-medium" style={{ color: healthRisk.color }}>
                  Health Risk Level: {healthRisk.level}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Based on your health profile, we'll provide personalized air quality alerts and route recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Preferences */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-[#50E3C2]" />
          <span>Route Preferences</span>
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-2">
              Default Route Preference
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              {['fastest', 'healthiest', 'balanced'].map((type) => (
                <div key={type}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    profile.preferredCommute === type 
                      ? 'border-[#4A90E2] bg-[#4A90E2] bg-opacity-10' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProfileChange('preferredCommute', type)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {type === 'fastest' && <Zap className="w-4 h-4 text-[#4A90E2]" />}
                    {type === 'healthiest' && <Shield className="w-4 h-4 text-[#50E3C2]" />}
                    {type === 'balanced' && <Activity className="w-4 h-4 text-[#8F3F97]" />}
                    <span className="font-medium text-[#333333] capitalize">{type}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {type === 'fastest' && 'Always prioritize speed'}
                    {type === 'healthiest' && 'Always prioritize health'}
                    {type === 'balanced' && 'Show me both options'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Settings Sidebar */}
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-[#FF7E00]" />
          <span>Notifications</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Push Notifications</span>
            <input type="checkbox"
              checked={notifications.notificationsEnabled}
              onChange={e => handleNotificationChange('notificationsEnabled', e.target.checked)}
              className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Heads-up Alerts</span>
            <input type="checkbox"
              checked={notifications.headsUpAlertsEnabled}
              onChange={e => handleNotificationChange('headsUpAlertsEnabled', e.target.checked)}
              className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]" />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
      {/* Enhanced Save Button */}
      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
          saved 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : saving 
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {saving ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : saved ? (
          <>
            <Shield className="w-4 h-4" />
            <span>Saved!</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </>
        )}
      </button>
      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <Info className="w-4 h-4" />
            <span className="text-sm">Profile updated successfully!</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ProfileDetails;
