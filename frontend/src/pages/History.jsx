import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Calendar, 
  MapPin, 
  Wind, 
  Clock, 
  Route,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  Eye,
  Shield,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle,
  Award,
  BarChart3
} from 'lucide-react';
import { getAQILevel, formatDuration, formatDistance } from '../utils/airQuality';

const History = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('trips'); // trips, exposure, insights

  // PRD-Compliant Trip History with Exposure Data
  const trips = [
    {
      id: 1,
      date: '2025-10-06',
      time: '09:15 AM',
      from: 'Home',
      to: 'Office Downtown',
      duration: 1800, // 30 minutes
      distance: 12000, // 12 km
      avgAQI: 78,
      maxAQI: 145,
      minAQI: 32,
      exposureLevel: 'moderate',
      routeType: 'fastest',
      breathabilityScore: { grade: 'B', score: 78 },
      healthActions: ['Closed windows at high AQI zone', 'Used A/C recirculation'],
      exposureTime: {
        good: 15, // minutes
        moderate: 12,
        unhealthy: 3,
        veryUnhealthy: 0
      },
      healthImpact: {
        respiratoryStress: 'low',
        recommendation: 'Consider 30min indoor recovery',
        pm25Exposure: 24.5, // μg/m³
        cumulativeScore: 85
      }
    },
    {
      id: 2,
      date: '2025-10-05',
      time: '06:30 PM',
      from: 'Office Downtown',
      to: 'Home',
      duration: 2100, // 35 minutes
      distance: 12500, // 12.5 km
      avgAQI: 134,
      maxAQI: 189,
      minAQI: 67,
      exposureLevel: 'unhealthy',
      routeType: 'healthiest',
      breathabilityScore: { grade: 'D', score: 45 },
      healthActions: ['Wore N95 mask', 'Avoided outdoor activities post-trip'],
      exposureTime: {
        good: 5,
        moderate: 10,
        unhealthy: 15,
        veryUnhealthy: 5
      },
      healthImpact: {
        respiratoryStress: 'high',
        recommendation: 'Use air purifier for 2+ hours',
        pm25Exposure: 67.8,
        cumulativeScore: 45
      }
    },
    {
      id: 3,
      date: '2025-10-05',
      time: '08:45 AM',
      from: 'Home',
      to: 'Office Downtown',
      duration: 1650,
      distance: 11800,
      avgAQI: 65,
      maxAQI: 89,
      minAQI: 41,
      exposureLevel: 'moderate',
      routeType: 'healthiest',
      breathabilityScore: { grade: 'A', score: 92 },
      healthActions: ['Chose healthier route', 'Took short break in clean zone'],
      exposureTime: {
        good: 20,
        moderate: 7,
        unhealthy: 0,
        veryUnhealthy: 0
      },
      healthImpact: {
        respiratoryStress: 'minimal',
        recommendation: 'Great choice! No additional precautions needed',
        pm25Exposure: 15.2,
        cumulativeScore: 95
      }
    }
  ];

  // PRD-Compliant Weekly Exposure Summary
  const weeklyExposure = {
    totalTrips: trips.length,
    totalTime: trips.reduce((sum, trip) => sum + trip.duration, 0),
    avgAQI: Math.round(trips.reduce((sum, trip) => sum + trip.avgAQI, 0) / trips.length),
    totalPM25: trips.reduce((sum, trip) => sum + trip.healthImpact.pm25Exposure, 0),
    healthScore: Math.round(trips.reduce((sum, trip) => sum + trip.healthImpact.cumulativeScore, 0) / trips.length),
    improvement: 12, // % improvement from last week
    exposureBreakdown: {
      good: trips.reduce((sum, trip) => sum + trip.exposureTime.good, 0),
      moderate: trips.reduce((sum, trip) => sum + trip.exposureTime.moderate, 0),
      unhealthy: trips.reduce((sum, trip) => sum + trip.exposureTime.unhealthy, 0),
      veryUnhealthy: trips.reduce((sum, trip) => sum + trip.exposureTime.veryUnhealthy, 0)
    }
  };

  const getExposureLevelColor = (level) => {
    switch (level) {
      case 'minimal': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthImpactIcon = (stress) => {
    switch (stress) {
      case 'minimal': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'low': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#333333] mb-2">Your Exposure Diary</h1>
            <p className="text-gray-600">
              Track your air quality exposure and analyze your health journey
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 3 months</option>
              <option value="year">Last year</option>
            </select>
            
            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <button className="btn-primary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* PRD-Compliant Exposure Summary Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-3xl font-bold text-[#333333]">{weeklyExposure.healthScore}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">+{weeklyExposure.improvement}% better</span>
                </div>
              </div>
              <Award className="w-8 h-8 text-[#50E3C2]" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PM2.5 Exposure</p>
                <p className="text-3xl font-bold text-[#333333]">{weeklyExposure.totalPM25.toFixed(1)}</p>
                <p className="text-xs text-gray-500">μg/m³ total</p>
              </div>
              <Activity className="w-8 h-8 text-[#FF7E00]" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clean Air Time</p>
                <p className="text-3xl font-bold text-[#333333]">{weeklyExposure.exposureBreakdown.good}m</p>
                <p className="text-xs text-gray-500">Good AQI zones</p>
              </div>
              <Wind className="w-8 h-8 text-[#4A90E2]" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-3xl font-bold text-[#333333]">{weeklyExposure.totalTrips}</p>
                <p className="text-xs text-gray-500">{formatDuration(weeklyExposure.totalTime)} total</p>
              </div>
              <HistoryIcon className="w-8 h-8 text-[#8F3F97]" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { id: 'trips', label: 'Trip History', icon: Route },
              { id: 'exposure', label: 'Exposure Analysis', icon: BarChart3 },
              { id: 'insights', label: 'Health Insights', icon: Heart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-[#4A90E2] shadow-sm'
                      : 'text-gray-600 hover:text-[#333333]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'trips' && (
              <div className="card">
                <h2 className="text-lg font-semibold text-[#333333] mb-4">Recent Journeys</h2>
                
                <div className="space-y-4">
                  {trips.map((trip) => {
                    const aqiLevel = getAQILevel(trip.avgAQI);
                    
                    return (
                      <div
                        key={trip.id}
                        onClick={() => setSelectedTrip(trip)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-[#4A90E2] hover:shadow-sm cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{trip.date}</span>
                              <span className="text-gray-400">•</span>
                              <span>{trip.time}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExposureLevelColor(trip.healthImpact.respiratoryStress)}`}>
                                {trip.healthImpact.respiratoryStress} impact
                              </span>
                              <span className="text-2xl font-bold text-[#333333]">
                                {trip.breathabilityScore.grade}
                              </span>
                            </div>
                          </div>
                          
                          <button className="text-[#4A90E2] hover:text-[#357ABD]">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-[#333333]">{trip.from}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm text-[#333333]">{trip.to}</span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Duration</span>
                            <div className="font-medium text-[#333333]">{formatDuration(trip.duration)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Avg AQI</span>
                            <div className="font-medium" style={{ color: aqiLevel.color }}>
                              {trip.avgAQI}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">PM2.5</span>
                            <div className="font-medium text-[#333333]">{trip.healthImpact.pm25Exposure} μg/m³</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Score</span>
                            <div className="font-medium text-[#333333]">{trip.healthImpact.cumulativeScore}/100</div>
                          </div>
                        </div>

                        {/* Health Actions Taken */}
                        {trip.healthActions.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-[#50E3C2]" />
                            <span className="text-xs text-gray-600">
                              {trip.healthActions.length} health action{trip.healthActions.length > 1 ? 's' : ''} taken
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'exposure' && (
              <div className="card">
                <h2 className="text-lg font-semibold text-[#333333] mb-4">Exposure Breakdown</h2>
                
                {/* Exposure Time Chart */}
                <div className="mb-6">
                  <h3 className="font-medium text-[#333333] mb-3">Time in Different AQI Zones</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Good (0-50)', time: weeklyExposure.exposureBreakdown.good, color: '#00E400' },
                      { label: 'Moderate (51-100)', time: weeklyExposure.exposureBreakdown.moderate, color: '#FFFF00' },
                      { label: 'Unhealthy (101-150)', time: weeklyExposure.exposureBreakdown.unhealthy, color: '#FF7E00' },
                      { label: 'Very Unhealthy (151+)', time: weeklyExposure.exposureBreakdown.veryUnhealthy, color: '#FF0000' }
                    ].map((zone, index) => {
                      const totalTime = Object.values(weeklyExposure.exposureBreakdown).reduce((sum, time) => sum + time, 0);
                      const percentage = totalTime > 0 ? (zone.time / totalTime) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: zone.color }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#333333]">{zone.label}</span>
                              <span className="text-gray-600">{zone.time}m ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="h-2 rounded-full"
                                style={{ backgroundColor: zone.color, width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly Trend */}
                <div className="bg-[#4A90E2] bg-opacity-10 p-4 rounded-lg">
                  <h3 className="font-medium text-[#333333] mb-2">Weekly Improvement</h3>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-[#333333]">
                      Your exposure to unhealthy air decreased by {weeklyExposure.improvement}% this week!
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="card">
                <h2 className="text-lg font-semibold text-[#333333] mb-4">Personalized Health Insights</h2>
                
                <div className="space-y-6">
                  {/* Health Score Trend */}
                  <div className="bg-gradient-to-r from-[#50E3C2] to-[#4A90E2] p-6 rounded-xl text-white">
                    <h3 className="text-lg font-bold mb-2">Your Health Score: {weeklyExposure.healthScore}/100</h3>
                    <p className="text-sm opacity-90 mb-4">
                      You're doing great! Your smart route choices have improved your air quality exposure by 12% this week.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span className="text-sm font-medium">Health Champion Badge Earned!</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-semibold text-[#333333] mb-3">Personalized Recommendations</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-green-900">Great Route Choices</div>
                          <div className="text-sm text-green-800">You chose healthier routes 67% of the time this week.</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-900">Optimal Travel Times</div>
                          <div className="text-sm text-blue-800">Consider traveling after 10 AM for 20% better air quality.</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                        <Heart className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-orange-900">Recovery Time</div>
                          <div className="text-sm text-orange-800">Your Tuesday trip had high exposure. Consider 2+ hours with air purifier.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trip Details Sidebar */}
          <div>
            {selectedTrip ? (
              <div className="card">
                <h3 className="text-lg font-semibold text-[#333333] mb-4">Trip Analysis</h3>
                
                <div className="space-y-4">
                  {/* Route Info */}
                  <div>
                    <h4 className="font-medium text-[#333333] mb-2">Journey</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-[#333333]">{selectedTrip.from} → {selectedTrip.to}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {selectedTrip.date} at {selectedTrip.time}
                    </div>
                  </div>

                  {/* Health Impact */}
                  <div>
                    <h4 className="font-medium text-[#333333] mb-3">Health Impact</h4>
                    <div className="flex items-center space-x-3 mb-3">
                      {getHealthImpactIcon(selectedTrip.healthImpact.respiratoryStress)}
                      <div>
                        <div className="font-medium text-[#333333]">
                          {selectedTrip.healthImpact.respiratoryStress.charAt(0).toUpperCase() + selectedTrip.healthImpact.respiratoryStress.slice(1)} Impact
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {selectedTrip.healthImpact.cumulativeScore}/100
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <div className="text-sm text-amber-800">
                        <strong>Recommendation:</strong> {selectedTrip.healthImpact.recommendation}
                      </div>
                    </div>
                  </div>

                  {/* Exposure Breakdown */}
                  <div>
                    <h4 className="font-medium text-[#333333] mb-3">Exposure Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">PM2.5 Exposure</span>
                        <span className="font-medium text-[#333333]">{selectedTrip.healthImpact.pm25Exposure} μg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peak AQI</span>
                        <span className="font-medium text-red-600">{selectedTrip.maxAQI}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best AQI</span>
                        <span className="font-medium text-green-600">{selectedTrip.minAQI}</span>
                      </div>
                    </div>
                  </div>

                  {/* Health Actions */}
                  {selectedTrip.healthActions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#333333] mb-3">Actions Taken</h4>
                      <div className="space-y-2">
                        {selectedTrip.healthActions.map((action, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-[#50E3C2]" />
                            <span className="text-[#333333]">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <HistoryIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#333333] mb-2">Select a Journey</h3>
                <p className="text-gray-600">
                  Click on any trip to see detailed health impact analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
