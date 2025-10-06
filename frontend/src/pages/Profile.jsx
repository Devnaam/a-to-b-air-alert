import React, { useState } from 'react';
import { 
  User, 
  Heart, 
  Settings, 
  Bell, 
  Shield, 
  Save,
  AlertTriangle,
  Info,
  Calendar,
  MapPin,
  Clock,
  Activity,
  Zap,
  Wind
} from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 32,
    isPregnant: false,
    hasRespiratoryConditions: false,
    hasHeartConditions: false,
    hasAllergies: false,
    isElderly: false,
    activityLevel: 'moderate',
    preferredCommute: 'balanced',
    workSchedule: 'flexible',
    sensitivityLevel: 'normal'
  });

  const [notifications, setNotifications] = useState({
    airQualityAlerts: true,
    routeAlerts: true,
    healthRecommendations: true,
    dailySummary: true,
    proactiveAlerts: true,
    timeIntelligence: true
  });

  const [alertThresholds, setAlertThresholds] = useState({
    moderateAQI: 51,
    unhealthyAQI: 101,
    veryUnhealthyAQI: 151,
    customThreshold: false
  });

  const [saved, setSaved] = useState(false);

  const handleSaveProfile = () => {
    // In real app, this would save to backend
    console.log('Saving profile:', { profile, notifications, alertThresholds });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleThresholdChange = (field, value) => {
    setAlertThresholds(prev => ({ ...prev, [field]: parseInt(value) || value }));
  };

  // Calculate personalized health risk level
  const getHealthRiskLevel = () => {
    let riskScore = 0;
    if (profile.hasRespiratoryConditions) riskScore += 3;
    if (profile.hasHeartConditions) riskScore += 3;
    if (profile.isPregnant) riskScore += 2;
    if (profile.hasAllergies) riskScore += 1;
    if (profile.age > 65 || profile.age < 12) riskScore += 2;
    
    if (riskScore >= 5) return { level: 'High', color: '#FF0000' };
    if (riskScore >= 3) return { level: 'Moderate', color: '#FF7E00' };
    return { level: 'Low', color: '#00E400' };
  };

  const healthRisk = getHealthRiskLevel();

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#333333] mb-2">Health Profile & Settings</h1>
          <p className="text-gray-600">
            Customize your health profile for personalized air quality recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="card">
              <h2 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-[#4A90E2]" />
                <span>Personal Information</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => handleProfileChange('age', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Activity Level
                  </label>
                  <select
                    value={profile.activityLevel}
                    onChange={(e) => handleProfileChange('activityLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  >
                    <option value="low">Low (Sedentary)</option>
                    <option value="moderate">Moderate (Active)</option>
                    <option value="high">High (Very Active)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Enhanced Health Information */}
            <div className="card">
              <h2 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>Health Profile</span>
              </h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="respiratory"
                      checked={profile.hasRespiratoryConditions}
                      onChange={(e) => handleProfileChange('hasRespiratoryConditions', e.target.checked)}
                      className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                    />
                    <label htmlFor="respiratory" className="text-sm text-gray-700">
                      Respiratory conditions (asthma, COPD, etc.)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="heart"
                      checked={profile.hasHeartConditions}
                      onChange={(e) => handleProfileChange('hasHeartConditions', e.target.checked)}
                      className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                    />
                    <label htmlFor="heart" className="text-sm text-gray-700">
                      Heart conditions
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="allergies"
                      checked={profile.hasAllergies}
                      onChange={(e) => handleProfileChange('hasAllergies', e.target.checked)}
                      className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                    />
                    <label htmlFor="allergies" className="text-sm text-gray-700">
                      Environmental allergies
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="pregnant"
                      checked={profile.isPregnant}
                      onChange={(e) => handleProfileChange('isPregnant', e.target.checked)}
                      className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                    />
                    <label htmlFor="pregnant" className="text-sm text-gray-700">
                      Currently pregnant
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Sensitivity Level
                  </label>
                  <select
                    value={profile.sensitivityLevel}
                    onChange={(e) => handleProfileChange('sensitivityLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  >
                    <option value="normal">Normal sensitivity</option>
                    <option value="sensitive">Sensitive to air quality</option>
                    <option value="very-sensitive">Very sensitive</option>
                  </select>
                </div>

                <div 
                  className="p-3 rounded-lg border-l-4"
                  style={{ backgroundColor: `${healthRisk.color}15`, borderColor: healthRisk.color }}
                >
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 mt-0.5" style={{ color: healthRisk.color }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: healthRisk.color }}>
                        Health Risk Level: {healthRisk.level}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        This helps us provide personalized air quality alerts and route recommendations based on your health needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PRD-Compliant Route & Time Preferences */}
            <div className="card">
              <h2 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#50E3C2]" />
                <span>Route & Travel Preferences</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Default Route Preference
                  </label>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div 
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        profile.preferredCommute === 'fastest' 
                          ? 'border-[#4A90E2] bg-[#4A90E2] bg-opacity-10' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProfileChange('preferredCommute', 'fastest')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-4 h-4 text-[#4A90E2]" />
                        <span className="font-medium text-[#333333]">Fastest</span>
                      </div>
                      <p className="text-xs text-gray-600">Always prioritize speed</p>
                    </div>
                    
                    <div 
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        profile.preferredCommute === 'healthiest' 
                          ? 'border-[#50E3C2] bg-[#50E3C2] bg-opacity-10' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProfileChange('preferredCommute', 'healthiest')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-[#50E3C2]" />
                        <span className="font-medium text-[#333333]">Healthiest</span>
                      </div>
                      <p className="text-xs text-gray-600">Always prioritize health</p>
                    </div>
                    
                    <div 
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        profile.preferredCommute === 'balanced' 
                          ? 'border-[#8F3F97] bg-[#8F3F97] bg-opacity-10' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleProfileChange('preferredCommute', 'balanced')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="w-4 h-4 text-[#8F3F97]" />
                        <span className="font-medium text-[#333333]">Balanced</span>
                      </div>
                      <p className="text-xs text-gray-600">Show me both options</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">
                    Work Schedule
                  </label>
                  <select
                    value={profile.workSchedule}
                    onChange={(e) => handleProfileChange('workSchedule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  >
                    <option value="fixed">Fixed schedule (9-5)</option>
                    <option value="flexible">Flexible schedule</option>
                    <option value="remote">Mostly remote</option>
                    <option value="shift">Shift work</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Notification Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-[#FF7E00]" />
                <span>Alert Preferences</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Proactive Health Alerts</span>
                  <input
                    type="checkbox"
                    checked={notifications.proactiveAlerts}
                    onChange={(e) => handleNotificationChange('proactiveAlerts', e.target.checked)}
                    className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Time-of-Day Intelligence</span>
                  <input
                    type="checkbox"
                    checked={notifications.timeIntelligence}
                    onChange={(e) => handleNotificationChange('timeIntelligence', e.target.checked)}
                    className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Route Alerts</span>
                  <input
                    type="checkbox"
                    checked={notifications.routeAlerts}
                    onChange={(e) => handleNotificationChange('routeAlerts', e.target.checked)}
                    className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Health Recommendations</span>
                  <input
                    type="checkbox"
                    checked={notifications.healthRecommendations}
                    onChange={(e) => handleNotificationChange('healthRecommendations', e.target.checked)}
                    className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Daily Health Summary</span>
                  <input
                    type="checkbox"
                    checked={notifications.dailySummary}
                    onChange={(e) => handleNotificationChange('dailySummary', e.target.checked)}
                    className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                  />
                </div>
              </div>
            </div>

            {/* Custom Alert Thresholds */}
            <div className="card">
              <h3 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-[#8F3F97]" />
                <span>Alert Thresholds</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    id="customThreshold"
                    checked={alertThresholds.customThreshold}
                    onChange={(e) => handleThresholdChange('customThreshold', e.target.checked)}
                    className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
                  />
                  <label htmlFor="customThreshold" className="text-sm text-gray-700">
                    Use custom alert thresholds
                  </label>
                </div>

                {alertThresholds.customThreshold && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moderate Alert (AQI)
                      </label>
                      <input
                        type="number"
                        value={alertThresholds.moderateAQI}
                        onChange={(e) => handleThresholdChange('moderateAQI', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#4A90E2]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unhealthy Alert (AQI)
                      </label>
                      <input
                        type="number"
                        value={alertThresholds.unhealthyAQI}
                        onChange={(e) => handleThresholdChange('unhealthyAQI', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#4A90E2]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Very Unhealthy Alert (AQI)
                      </label>
                      <input
                        type="number"
                        value={alertThresholds.veryUnhealthyAQI}
                        onChange={(e) => handleThresholdChange('veryUnhealthyAQI', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#4A90E2]"
                      />
                    </div>
                  </>
                )}

                {!alertThresholds.customThreshold && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    Using standard thresholds based on your health risk level ({healthRisk.level}).
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              className={`w-full btn-primary flex items-center justify-center space-x-2 ${
                saved ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saved ? 'Saved!' : 'Save Changes'}</span>
            </button>

            {saved && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Profile updated successfully!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
