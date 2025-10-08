import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader, LogOut } from 'lucide-react';
import ProfileDetails from '../components/ProfileDetails';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    isPregnant: false,
    hasRespiratoryConditions: false,
    hasHeartConditions: false,
    hasAllergies: false,
    isSmoker: false,
    hasChildren: false,
    activityLevel: 'moderate',
    preferredCommute: 'balanced',
    workSchedule: 'flexible',
    sensitivityLevel: 'medium'
  });

  const [notifications, setNotifications] = useState({
    airQualityAlerts: true,
    routeAlerts: true,
    healthRecommendations: true,
    dailySummary: true,
    proactiveAlerts: true,
    timeIntelligence: true,
    notificationsEnabled: true,
    headsUpAlertsEnabled: true
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        if (user) {
          setProfile(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            age: user.healthProfile?.age || '',
            hasRespiratoryConditions: user.healthProfile?.hasRespiratoryConditions || false,
            hasHeartConditions: user.healthProfile?.hasHeartConditions || false,
            isPregnant: user.healthProfile?.isPregnant || false,
            isSmoker: user.healthProfile?.isSmoker || false,
            hasChildren: user.healthProfile?.hasChildren || false,
            sensitivityLevel: user.healthProfile?.sensitivityLevel || 'medium',
            preferredUnits: user.healthProfile?.preferredUnits || 'metric'
          }));
          setNotifications(prev => ({
            ...prev,
            notificationsEnabled: user.healthProfile?.notificationsEnabled || true,
            headsUpAlertsEnabled: user.healthProfile?.headsUpAlertsEnabled || true
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      const updateData = {
        name: profile.name,
        healthProfile: {
          age: profile.age ? parseInt(profile.age) : null,
          hasRespiratoryConditions: profile.hasRespiratoryConditions,
          hasHeartConditions: profile.hasHeartConditions,
          isPregnant: profile.isPregnant,
          isSmoker: profile.isSmoker,
          hasChildren: profile.hasChildren,
          sensitivityLevel: profile.sensitivityLevel,
          preferredUnits: profile.preferredUnits || 'metric',
          notificationsEnabled: notifications.notificationsEnabled,
          headsUpAlertsEnabled: notifications.headsUpAlertsEnabled
        }
      };
      const result = await updateProfile(updateData);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || 'Failed to save profile');
      }
    } catch {
      setError('Failed to save profile. Please try again.');
    }
    setSaving(false);
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  // Health risk utility so you don't break props
  const getHealthRiskLevel = () => {
    let riskScore = 0;
    if (profile.hasRespiratoryConditions) riskScore += 3;
    if (profile.hasHeartConditions) riskScore += 3;
    if (profile.isPregnant) riskScore += 2;
    if (profile.isSmoker) riskScore += 2;
    if (profile.age && (profile.age > 65 || profile.age < 12)) riskScore += 2;
    if (profile.hasChildren) riskScore += 1;
    if (riskScore >= 5) return { level: 'High', color: '#FF0000' };
    if (riskScore >= 3) return { level: 'Moderate', color: '#FF7E00' };
    return { level: 'Low', color: '#00E400' };
  };
  const healthRisk = getHealthRiskLevel();

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    setTimeout(() => {
      setSigningOut(false);
      navigate('/welcome', { replace: true });
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Profile...</h2>
          <p className="text-gray-600">Fetching your health profile and preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#333333] mb-2">Health Profile & Settings</h1>
            <p className="text-gray-600">
              Customize your health profile for personalized air quality recommendations
            </p>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <Shield className="w-4 h-4" />
                <span className="text-sm">
                  Welcome <strong>{profile.name || user?.name}</strong>! Your account was created successfully.
                </span>
              </div>
            </div>
          </div>
          {/* SIGN OUT button */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              signingOut
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {signingOut ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
        <ProfileDetails
          profile={profile}
          notifications={notifications}
          error={error}
          saved={saved}
          saving={saving}
          healthRisk={healthRisk}
          handleProfileChange={handleProfileChange}
          handleNotificationChange={handleNotificationChange}
          handleSaveProfile={handleSaveProfile}
        />
      </div>
    </div>
  );
};

export default Profile;
