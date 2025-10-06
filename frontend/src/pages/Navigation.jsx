import React, { useState, useEffect } from 'react';
import { 
  Navigation as NavigationIcon, 
  MapPin, 
  Clock, 
  Wind, 
  AlertTriangle, 
  Shield,
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
  Car,
  Eye,
  Activity,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { getAQILevel, formatDuration, formatDistance, getHealthRecommendation } from '../utils/airQuality';

const Navigation = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentAQI, setCurrentAQI] = useState(95);
  const [upcomingAQI, setUpcomingAQI] = useState(168);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [routeProgress, setRouteProgress] = useState(35);
  
  // PRD-Compliant Proactive Alerts
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 1,
      distance: '2.1 km',
      aqi: 185,
      type: 'heads-up',
      message: 'High PM2.5 zone ahead (AQI 185). Consider closing car windows and switching A/C to recirculation.',
      action: 'Close Windows',
      severity: 'high'
    }
  ]);

  const [completedActions, setCompletedActions] = useState([]);

  // Mock navigation data
  const navigationData = {
    destination: 'Downtown Office Complex',
    remainingTime: 1425, // seconds
    remainingDistance: 8200, // meters
    currentSpeed: 35, // km/h
    nextTurn: 'Turn right on Main Street in 300m',
    currentLocation: 'Connaught Place',
    upcomingLocation: 'Outer Ring Road'
  };

  const currentAQILevel = getAQILevel(currentAQI);
  const upcomingAQILevel = getAQILevel(upcomingAQI);

  const handleStartNavigation = () => {
    setIsNavigating(true);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setRouteProgress(0);
    setActiveAlerts([]);
    setCompletedActions([]);
  };

  const handleAlertAction = (alertId, action) => {
    const alert = activeAlerts.find(a => a.id === alertId);
    if (alert) {
      setCompletedActions(prev => [...prev, { ...alert, completedAction: action, timestamp: new Date() }]);
      setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
      
      // Simulate new alert after some time
      setTimeout(() => {
        setActiveAlerts(prev => [...prev, {
          id: Date.now(),
          distance: '1.5 km',
          aqi: 78,
          type: 'improvement',
          message: 'Air quality improving ahead! Good area for taking a break if needed.',
          action: 'Plan Break',
          severity: 'low'
        }]);
      }, 10000);
    }
  };

  const dismissAlert = (alertId) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Simulate navigation progress and dynamic AQI changes
  useEffect(() => {
    if (isNavigating) {
      const interval = setInterval(() => {
        setRouteProgress(prev => Math.min(prev + 1, 100));
        
        // Simulate dynamic AQI changes based on location
        const variation = (Math.random() - 0.5) * 20;
        setCurrentAQI(prev => Math.max(30, Math.min(300, prev + variation)));
        setUpcomingAQI(prev => Math.max(30, Math.min(300, prev + variation * 1.2)));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isNavigating]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white shadow-lg rounded-lg p-3 border-l-4 border-[#4A90E2]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <NavigationIcon className="w-4 h-4 text-[#4A90E2]" />
              <span className="text-sm font-medium">
                {formatDuration(navigationData.remainingTime)} • AQI {Math.floor(currentAQI)}
              </span>
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#333333]">Live Navigation</h1>
            <p className="text-gray-600">Real-time air quality monitoring during your journey</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg ${soundEnabled ? 'bg-[#4A90E2] bg-opacity-10 text-[#4A90E2]' : 'bg-gray-100 text-gray-400'}`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRD-Compliant Live AQI Dashboard */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Current Location AQI */}
          <div className="card" style={{ backgroundColor: currentAQILevel.bgColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: currentAQILevel.color }}
                >
                  <Wind className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#333333]">Current Location</h3>
                  <p className="text-sm text-gray-600">{navigationData.currentLocation}</p>
                </div>
              </div>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#333333] mb-1">
                AQI {Math.floor(currentAQI)}
              </div>
              <div 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: currentAQILevel.color, 
                  color: currentAQILevel.textColor 
                }}
              >
                {currentAQILevel.label}
              </div>
            </div>
          </div>

          {/* Upcoming Location AQI */}
          <div className="card" style={{ backgroundColor: upcomingAQILevel.bgColor }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: upcomingAQILevel.color }}
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#333333]">Ahead (2 km)</h3>
                  <p className="text-sm text-gray-600">{navigationData.upcomingLocation}</p>
                </div>
              </div>
              <NavigationIcon className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#333333] mb-1">
                AQI {Math.floor(upcomingAQI)}
              </div>
              <div 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: upcomingAQILevel.color, 
                  color: upcomingAQILevel.textColor 
                }}
              >
                {upcomingAQILevel.label}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="card">
            <h3 className="text-lg font-semibold text-[#333333] mb-4">Navigation Status</h3>
            
            {!isNavigating ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Ready to start navigation</p>
                <button
                  onClick={handleStartNavigation}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Journey</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{routeProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-[#4A90E2] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${routeProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* ETA & Distance */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#333333]">
                      {formatDuration(navigationData.remainingTime)}
                    </div>
                    <div className="text-sm text-gray-600">ETA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[#333333]">
                      {formatDistance(navigationData.remainingDistance)}
                    </div>
                    <div className="text-sm text-gray-600">Distance</div>
                  </div>
                </div>

                {/* Next Turn */}
                <div className="bg-[#4A90E2] bg-opacity-10 p-3 rounded-lg">
                  <div className="text-sm font-medium text-[#4A90E2]">Next Turn:</div>
                  <div className="text-[#333333]">{navigationData.nextTurn}</div>
                </div>

                <button
                  onClick={handleStopNavigation}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Square className="w-4 h-4" />
                  <span>End Journey</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PRD-Compliant Proactive Alerts System */}
        {activeAlerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-[#FF7E00]" />
              <span>Proactive Health Alerts</span>
            </h3>
            
            <div className="space-y-4">
              {activeAlerts.map((alert) => {
                const alertLevel = getAQILevel(alert.aqi);
                const severityColors = {
                  high: { bg: 'bg-red-50', border: 'border-red-200', button: 'bg-red-500 hover:bg-red-600' },
                  medium: { bg: 'bg-orange-50', border: 'border-orange-200', button: 'bg-orange-500 hover:bg-orange-600' },
                  low: { bg: 'bg-green-50', border: 'border-green-200', button: 'bg-green-500 hover:bg-green-600' }
                };
                const colors = severityColors[alert.severity];

                return (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-xl border-2 ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle 
                          className="w-6 h-6" 
                          style={{ color: alertLevel.color }}
                        />
                        <div>
                          <div className="font-semibold text-[#333333]">
                            Heads-up: {alert.distance} ahead
                          </div>
                          <div 
                            className="text-sm font-medium"
                            style={{ color: alertLevel.color }}
                          >
                            AQI {alert.aqi} - {alertLevel.label}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{alert.message}</p>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAlertAction(alert.id, alert.action)}
                        className={`${colors.button} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
                      >
                        {alert.action}
                      </button>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Actions Log */}
        {completedActions.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-[#333333] mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-[#50E3C2]" />
              <span>Health Actions Taken</span>
            </h3>
            
            <div className="space-y-3">
              {completedActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#50E3C2] bg-opacity-10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#50E3C2]" />
                    <div>
                      <div className="font-medium text-[#333333]">{action.completedAction}</div>
                      <div className="text-sm text-gray-600">
                        {action.timestamp.toLocaleTimeString()} • AQI {action.aqi} zone
                      </div>
                    </div>
                  </div>
                  <Shield className="w-4 h-4 text-[#50E3C2]" />
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-[#4A90E2] bg-opacity-10 rounded-lg">
              <div className="text-sm text-[#4A90E2] font-medium">
                Great job! You're actively protecting your health during this journey.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;
