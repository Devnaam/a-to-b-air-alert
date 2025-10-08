import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Loader, 
  AlertTriangle,
  Eye,
  EyeOff,
  Wind,
  Heart,
  Baby,
  Cigarette,
  Stethoscope,
  ChevronRight,
  Check
} from 'lucide-react';

const Signup = () => {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Health Profile
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    healthProfile: {
      hasRespiratoryConditions: false,
      hasHeartConditions: false,
      isPregnant: false,
      isSmoker: false,
      hasChildren: false,
      age: '',
      sensitivityLevel: 'medium',
      preferredUnits: 'metric',
      notificationsEnabled: true,
      headsUpAlertsEnabled: true
    }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('healthProfile.')) {
      const healthField = name.replace('healthProfile.', '');
      setFormData(prev => ({
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          [healthField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (error) setError('');
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setError('');
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const signupData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      healthProfile: {
        ...formData.healthProfile,
        age: formData.healthProfile.age ? parseInt(formData.healthProfile.age) : null
      }
    };

    const result = await signup(signupData);
    
    if (result.success) {
      console.log('✅ Signup successful, redirecting to profile');
      navigate('/profile');
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setIsLoading(false);
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-6">
      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[#333333] mb-2">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition-all"
            placeholder="Enter your full name"
          />
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#333333] mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition-all"
            placeholder="Enter your email address"
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#333333] mb-2">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition-all"
            placeholder="Create a password (min 6 characters)"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#333333] mb-2">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition-all"
            placeholder="Confirm your password"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Next Button */}
      <button
        type="submit"
        className="w-full btn-primary flex items-center justify-center space-x-2"
      >
        <span>Continue to Health Profile</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleFinalSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-[#333333] mb-2">
          Health Profile Setup
        </h3>
        <p className="text-sm text-gray-600">
          Help us personalize your air quality experience (optional but recommended)
        </p>
      </div>

      {/* Age Input */}
      <div>
        <label htmlFor="healthProfile.age" className="block text-sm font-medium text-[#333333] mb-2">
          Age
        </label>
        <input
          id="healthProfile.age"
          name="healthProfile.age"
          type="number"
          min="1"
          max="120"
          value={formData.healthProfile.age}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition-all"
          placeholder="Enter your age"
        />
      </div>

      {/* Health Conditions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-[#333333]">Health Conditions</h4>
        
        <div className="grid grid-cols-1 gap-3">
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="healthProfile.hasRespiratoryConditions"
              checked={formData.healthProfile.hasRespiratoryConditions}
              onChange={handleChange}
              className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
            />
            <Stethoscope className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-[#333333]">Respiratory conditions (Asthma, COPD, etc.)</span>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="healthProfile.hasHeartConditions"
              checked={formData.healthProfile.hasHeartConditions}
              onChange={handleChange}
              className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
            />
            <Heart className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-[#333333]">Heart conditions</span>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="healthProfile.isPregnant"
              checked={formData.healthProfile.isPregnant}
              onChange={handleChange}
              className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
            />
            <Baby className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-[#333333]">Pregnant</span>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="healthProfile.isSmoker"
              checked={formData.healthProfile.isSmoker}
              onChange={handleChange}
              className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
            />
            <Cigarette className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-[#333333]">Current smoker</span>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="healthProfile.hasChildren"
              checked={formData.healthProfile.hasChildren}
              onChange={handleChange}
              className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
            />
            <Baby className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-[#333333]">Traveling with children</span>
          </label>
        </div>
      </div>

      {/* Sensitivity Level */}
      <div>
        <label htmlFor="healthProfile.sensitivityLevel" className="block text-sm font-medium text-[#333333] mb-2">
          Air Quality Sensitivity Level
        </label>
        <select
          id="healthProfile.sensitivityLevel"
          name="healthProfile.sensitivityLevel"
          value={formData.healthProfile.sensitivityLevel}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition-all"
        >
          <option value="low">Low - I'm generally not sensitive to air pollution</option>
          <option value="medium">Medium - I notice air quality changes sometimes</option>
          <option value="high">High - I'm very sensitive to air quality</option>
        </select>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-[#333333]">Preferences</h4>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="healthProfile.notificationsEnabled"
              checked={formData.healthProfile.notificationsEnabled}
              onChange={handleChange}
              className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
            />
            <span className="text-sm text-[#333333]">Enable push notifications</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="healthProfile.headsUpAlertsEnabled"
              checked={formData.healthProfile.headsUpAlertsEnabled}
              onChange={handleChange}
              className="w-4 h-4 text-[#4A90E2] border-gray-300 rounded focus:ring-[#4A90E2]"
            />
            <span className="text-sm text-[#333333]">Enable heads-up alerts during navigation</span>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 btn-secondary"
        >
          Back
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-[#4A90E2] rounded-xl">
              <Wind className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#333333]">AirAlert Pro</h1>
          </div>
          <h2 className="text-xl font-semibold text-[#333333] mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600">
            Join thousands who prioritize their health while traveling
          </p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className={`w-3 h-3 rounded-full transition-colors ${
              step >= 1 ? 'bg-[#4A90E2]' : 'bg-gray-300'
            }`}></div>
            <div className={`w-8 h-1 rounded-full transition-colors ${
              step >= 2 ? 'bg-[#4A90E2]' : 'bg-gray-300'
            }`}></div>
            <div className={`w-3 h-3 rounded-full transition-colors ${
              step >= 2 ? 'bg-[#4A90E2]' : 'bg-gray-300'
            }`}></div>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          {step === 1 ? renderStep1() : renderStep2()}
          
          {/* Login Link */}
          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#4A90E2] hover:text-[#357ABD] transition-colors"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
