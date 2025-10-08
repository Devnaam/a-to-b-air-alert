import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, Loader, AlertTriangle } from 'lucide-react';
import { formatDuration, formatDistance, getAQILevel } from '../utils/airQuality';

const RouteMapView = ({ 
  routes, 
  selectedRoute, 
  fromAddress, 
  toAddress, 
  onSelectRoute
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  
  const [mapError, setMapError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Google Map (simplified, no click handlers)
  const initializeMap = useCallback(async () => {
    try {
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps not loaded');
      }

      if (!mapRef.current) {
        console.warn('Map container not ready yet');
        return;
      }

      if (mapInstanceRef.current) {
        console.log('Map already initialized');
        return;
      }

      console.log('🗺️ Initializing Google Map...');

      // Create map instance
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Initialize directions service and renderer
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        draggable: false,
        polylineOptions: {
          strokeColor: '#4A90E2',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      directionsRendererRef.current.setMap(mapInstance);
      mapInstanceRef.current = mapInstance;
      
      setIsMapReady(true);
      setLoading(false);
      setMapError(null);
      
      console.log('✅ Google Map initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize map:', error);
      setMapError(error.message);
      setLoading(false);
    }
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeMap();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [initializeMap]);

  // Draw route when selected route changes
  const drawRoute = useCallback((routeData) => {
    if (!isMapReady || !mapInstanceRef.current || !directionsServiceRef.current || !directionsRendererRef.current) {
      console.warn('Map not ready for drawing route');
      return;
    }

    if (!routeData.route || !routeData.route.legs) {
      console.warn('Invalid route data');
      return;
    }

    try {
      const route = routeData.route;
      const leg = route.legs[0];
      
      const origin = leg.start_location;
      const destination = leg.end_location;

      console.log('🗺️ Drawing route:', { origin, destination });

      directionsServiceRef.current.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
          avoidTolls: false,
          avoidHighways: false
        },
        (response, status) => {
          if (status === 'OK') {
            const polylineOptions = {
              strokeColor: routeData.isHealthiest ? '#50E3C2' : 
                          routeData.isFastest ? '#4A90E2' : '#666666',
              strokeWeight: 5,
              strokeOpacity: 0.8
            };
            
            directionsRendererRef.current.setOptions({ polylineOptions });
            directionsRendererRef.current.setDirections(response);
            
            console.log('✅ Route drawn successfully');
          } else {
            console.error('❌ Directions request failed:', status);
            showFallbackMarkers(origin, destination);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error drawing route:', error);
    }
  }, [isMapReady]);

  // Show fallback markers if directions fail
  const showFallbackMarkers = useCallback((origin, destination) => {
    if (!mapInstanceRef.current) return;

    try {
      // Add start marker
      new window.google.maps.Marker({
        position: origin,
        map: mapInstanceRef.current,
        title: 'Start: ' + fromAddress,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4A90E2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24)
        }
      });

      // Add end marker
      new window.google.maps.Marker({
        position: destination,
        map: mapInstanceRef.current,
        title: 'End: ' + toAddress,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#50E3C2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24)
        }
      });

      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      mapInstanceRef.current.fitBounds(bounds);
      
      console.log('✅ Fallback markers displayed');
    } catch (error) {
      console.error('❌ Error showing fallback markers:', error);
    }
  }, [fromAddress, toAddress]);

  // Draw route when selectedRoute changes
  useEffect(() => {
    if (selectedRoute && isMapReady) {
      drawRoute(selectedRoute);
    }
  }, [selectedRoute, isMapReady, drawRoute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      
      mapInstanceRef.current = null;
      directionsServiceRef.current = null;
    };
  }, []);

  if (mapError) {
    return (
      <div className="lg:col-span-1">
        <div className="card p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#333333] mb-2">Map Unavailable</h3>
          <p className="text-gray-600 mb-4">{mapError}</p>
          {selectedRoute && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Route Information</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>From: {fromAddress}</div>
                <div>To: {toAddress}</div>
                <div>Distance: {formatDistance(selectedRoute.distance)}</div>
                <div>Duration: {formatDuration(selectedRoute.duration)}</div>
                <div>AQI: {selectedRoute.breathability.avgAQI} ({selectedRoute.breathability.grade})</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-1">
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#333333]">Route Map</h2>
            {selectedRoute && (
              <div className="text-sm text-gray-600">
                Showing: {selectedRoute.isHealthiest ? 'Healthiest Route' : 
                         selectedRoute.isFastest ? 'Fastest Route' : 'Alternative Route'}
              </div>
            )}
          </div>
        </div>
        
        {/* Google Map Container */}
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-[600px] bg-gray-100"
            style={{ minHeight: '600px' }}
          />
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Loader className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
                <div className="text-sm text-gray-600">Loading map...</div>
              </div>
            </div>
          )}
        </div>

        {/* Route Information Panel */}
        {selectedRoute && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Route Summary</div>
                <div className="font-medium">{selectedRoute.summary}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Travel Time</div>
                <div className="font-medium">{formatDuration(selectedRoute.duration)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Distance</div>
                <div className="font-medium">{formatDistance(selectedRoute.distance)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Air Quality</div>
                <div className="font-medium">
                  AQI {selectedRoute.breathability.avgAQI} ({selectedRoute.breathability.grade})
                </div>
              </div>
            </div>
            
            {/* Route Selection Buttons */}
            {routes.length > 1 && (
              <div className="mt-4 flex space-x-2">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => onSelectRoute(route)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedRoute.id === route.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {route.isHealthiest ? 'Healthiest' : 
                     route.isFastest ? 'Fastest' : `Route ${route.id + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteMapView;
