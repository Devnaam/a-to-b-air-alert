import React from 'react';
import { 
  Clock, 
  Route as RouteIcon, 
  Wind, 
  Shield,
  Zap,
  Leaf,
  Loader
} from 'lucide-react';
import { getAQILevel, formatDuration, formatDistance } from '../utils/airQuality';

const RouteCards = ({ routes, selectedRoute, onSelectRoute, loading }) => {
  const handleStartNavigation = (routeData) => {
    console.log('🧭 Starting navigation for route:', routeData);
    // Navigation logic here
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <Loader className="w-8 h-8 text-[#4A90E2] mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-medium text-[#333333] mb-2">Planning Your Route</h3>
        <p className="text-gray-600">
          Analyzing air quality along multiple routes...
        </p>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="card text-center py-12">
        <RouteIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#333333] mb-2">Plan Your First Route</h3>
        <p className="text-gray-600 mb-4">
          Enter your starting point and destination to see route options with air quality information
        </p>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Wind className="w-4 h-4" />
            <span>Real-time AQI</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4" />
            <span>Health Analysis</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Time Intelligence</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#333333]">Route Options</h2>
        <div className="text-sm text-gray-600">
          {routes.length} route{routes.length > 1 ? 's' : ''} found
        </div>
      </div>
      
      <div className="grid gap-4">
        {routes.map((routeData) => {
          const aqiLevel = getAQILevel(routeData.breathability.avgAQI || 0);
          
          return (
            <div
              key={routeData.id}
              onClick={() => onSelectRoute(routeData)}
              className={`card cursor-pointer transition-all hover:shadow-lg transform hover:-translate-y-1 ${
                selectedRoute?.id === routeData.id 
                  ? 'ring-2 ring-[#4A90E2] border-[#4A90E2] shadow-lg' 
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {routeData.isFastest && (
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-[#4A90E2]" />
                        <span className="text-sm font-medium text-[#4A90E2]">Fastest Route</span>
                      </div>
                    )}
                    {routeData.isHealthiest && (
                      <div className="flex items-center space-x-1">
                        <Leaf className="w-4 h-4 text-[#50E3C2]" />
                        <span className="text-sm font-medium text-[#50E3C2]">Healthiest Route</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#333333]">
                    {routeData.breathability.grade || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Breathability</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Duration */}
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-[#333333]">
                      {formatDuration(routeData.duration)}
                    </div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                </div>

                {/* Distance */}
                <div className="flex items-center space-x-2">
                  <RouteIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-[#333333]">
                      {formatDistance(routeData.distance)}
                    </div>
                    <div className="text-xs text-gray-500">Distance</div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-[#333333]">
                      {routeData.breathability.score || 0}/100
                    </div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>

                {/* AQI */}
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: aqiLevel.color }}
                  ></div>
                  <div>
                    <div className="text-sm font-medium text-[#333333]">
                      {routeData.breathability.avgAQI || 0}
                    </div>
                    <div className="text-xs text-gray-500">Avg AQI</div>
                  </div>
                </div>
              </div>

              {/* Route Path Preview */}
              <div className="flex items-center space-x-1 mb-3">
                <span className="text-xs text-gray-600">Route:</span>
                <span className="text-xs text-[#333333] truncate">{routeData.summary}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartNavigation(routeData);
                  }}
                  className={`flex-1 text-sm py-2 ${
                    routeData.isHealthiest ? 'btn-accent' :
                    routeData.isFastest ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    {routeData.isHealthiest ? <Shield className="w-3 h-3" /> :
                     routeData.isFastest ? <Zap className="w-3 h-3" /> :
                     <RouteIcon className="w-3 h-3" />}
                    <span>
                      {routeData.isHealthiest ? 'Choose Healthiest' :
                       routeData.isFastest ? 'Choose Fastest' : 'Select Route'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteCards;
