import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wind, 
  MapPin, 
  Shield, 
  Clock, 
  Route,
  AlertTriangle,
  TrendingUp,
  Leaf,
  Zap,
  ArrowRight,
  Play,
  CheckCircle,
  Users,
  Award,
  Globe,
  User
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Route,
      title: "Live Route Visualization",
      description: "See real-time air quality data with color-coded route mapping",
      color: "#4A90E2"
    },
    {
      icon: Shield,
      title: "Smart Health Scoring",
      description: "Get instant A+ to F ratings based on your personal health profile",
      color: "#50E3C2"
    },
    {
      icon: AlertTriangle,
      title: "Proactive Alerts",
      description: "Advanced warnings before entering high-pollution zones",
      color: "#FF7E00"
    },
    {
      icon: Clock,
      title: "Time Intelligence",
      description: "AI-powered timing recommendations for optimal air quality",
      color: "#8F3F97"
    }
  ];

  const stats = [
    { icon: Globe, label: "Cities Covered", value: "500+", color: "#4A90E2" },
    { icon: Route, label: "Routes Analyzed", value: "1M+", color: "#50E3C2" },
    { icon: Users, label: "Active Users", value: "25K+", color: "#FF7E00" },
    { icon: Award, label: "Health Score", value: "98%", color: "#8F3F97" }
  ];

  const benefits = [
    "Reduce respiratory exposure by up to 40%",
    "Save time with intelligent route planning",
    "Personalized health recommendations",
    "Real-time pollution forecasting"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#4A90E2] via-[#357ABD] to-[#50E3C2] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 border border-white rounded-full"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 mb-6">
                <Wind className="w-4 h-4" />
                <span className="text-sm font-medium">Smart Air Quality Navigation</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Breathe Safer,<br />
                <span className="text-[#50E3C2]">Travel Smarter</span>
              </h1>
              
              <p className="text-xl opacity-90 mb-8 leading-relaxed">
                Revolutionary air quality navigation that adapts to your health profile. 
                Choose between fastest routes or healthiest paths with real-time pollution forecasting.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/plan"
                  className="bg-white text-[#4A90E2] hover:bg-gray-100 font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 inline-flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  <MapPin className="w-5 h-5" />
                  <span>Start Planning</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#4A90E2] font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 inline-flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm opacity-80">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-[#50E3C2]" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-[#50E3C2]" />
                  <span>Real-time data</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-[#50E3C2]" />
                  <span>Health focused</span>
                </div>
              </div>
            </div>

            {/* Right Content - Route Preview Cards */}
            <div className="relative">
              <div className="grid gap-4">
                {/* Fastest Route Card */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-[#4A90E2]" />
                      <span className="font-semibold text-[#333333]">Fastest Route</span>
                    </div>
                    <span className="text-2xl font-bold text-[#333333]">B</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-[#333333] font-medium">25 min</div>
                      <div className="text-gray-500">Duration</div>
                    </div>
                    <div>
                      <div className="text-[#333333] font-medium">12.5 km</div>
                      <div className="text-gray-500">Distance</div>
                    </div>
                    <div>
                      <div className="text-[#FF0000] font-medium">AQI 145</div>
                      <div className="text-gray-500">Air Quality</div>
                    </div>
                  </div>
                </div>

                {/* Healthiest Route Card */}
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6 shadow-xl border-2 border-[#50E3C2]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-5 h-5 text-[#50E3C2]" />
                      <span className="font-semibold text-[#333333]">Healthiest Route</span>
                    </div>
                    <span className="text-2xl font-bold text-[#50E3C2]">A</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-[#333333] font-medium">32 min</div>
                      <div className="text-gray-500">Duration</div>
                    </div>
                    <div>
                      <div className="text-[#333333] font-medium">14.2 km</div>
                      <div className="text-gray-500">Distance</div>
                    </div>
                    <div>
                      <div className="text-[#FFAA00] font-medium">AQI 78</div>
                      <div className="text-gray-500">Air Quality</div>
                    </div>
                  </div>
                  <div className="mt-4 p-2 bg-[#50E3C2] bg-opacity-10 rounded-lg">
                    <div className="text-xs text-[#50E3C2] font-medium">
                      +7 min • -67 AQI points • Better for your health
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#F4F7F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div 
                    className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className="text-3xl font-bold text-[#333333] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-[#4A90E2] bg-opacity-10 rounded-full px-4 py-2 mb-4">
              <Wind className="w-4 h-4 text-[#4A90E2]" />
              <span className="text-sm font-medium text-[#4A90E2]">Advanced Features</span>
            </div>
            <h2 className="text-4xl font-bold text-[#333333] mb-4">
              Everything You Need for<br />Healthy Travel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology meets health-conscious navigation
            </p>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center hover:shadow-xl hover:border-transparent transition-all duration-300 hover:-translate-y-2">
                    <div 
                      className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-[#333333] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#F4F7F9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-[#50E3C2] bg-opacity-10 rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4 text-[#50E3C2]" />
                <span className="text-sm font-medium text-[#50E3C2]">Health Benefits</span>
              </div>
              
              <h2 className="text-4xl font-bold text-[#333333] mb-6">
                Protect Your Health<br />Every Journey
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                Our intelligent system learns your health profile and provides personalized 
                route recommendations that prioritize your well-being.
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#50E3C2] flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Link
                to="/plan"
                className="inline-flex items-center space-x-2 bg-[#50E3C2] hover:bg-[#3DD9B7] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <span>Start Your Healthy Journey</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-[#4A90E2] to-[#50E3C2] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Health Impact Dashboard</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <div className="text-2xl font-bold">40%</div>
                    <div className="text-sm opacity-90">Exposure Reduced</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <div className="text-2xl font-bold">15min</div>
                    <div className="text-sm opacity-90">Time Saved</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm opacity-90">User Satisfaction</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <div className="text-2xl font-bold">A+</div>
                    <div className="text-sm opacity-90">Health Score</div>
                  </div>
                </div>
                
                <div className="text-sm opacity-80">
                  Based on 25,000+ user journeys and health outcomes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#4A90E2] via-[#357ABD] to-[#50E3C2] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <Wind className="absolute top-10 left-10 w-8 h-8 text-white" />
            <Route className="absolute top-20 right-20 w-6 h-6 text-white" />
            <MapPin className="absolute bottom-10 left-1/4 w-5 h-5 text-white" />
            <Shield className="absolute bottom-20 right-10 w-7 h-7 text-white" />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Breathe Easier?
          </h2>
          <p className="text-xl text-white opacity-90 mb-10 max-w-2xl mx-auto">
            Join thousands of health-conscious travelers who've already made the switch 
            to smarter, safer navigation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/plan"
              className="bg-white text-[#4A90E2] hover:bg-gray-100 font-bold text-lg px-10 py-5 rounded-xl transition-all duration-300 inline-flex items-center justify-center space-x-2 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              <Wind className="w-6 h-6" />
              <span>Start Free Today</span>
            </Link>
            
            <Link
              to="/profile"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#4A90E2] font-bold text-lg px-10 py-5 rounded-xl transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <User className="w-6 h-6" />
              <span>Create Profile</span>
            </Link>
          </div>
          
          <div className="mt-8 text-white opacity-70 text-sm">
            No credit card required • Start improving your health today
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
