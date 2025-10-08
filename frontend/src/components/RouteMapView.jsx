import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, Loader, AlertTriangle, Crosshair, Search, Route as RouteIcon } from 'lucide-react';
import { formatDuration, formatDistance, getAQILevel } from '../utils/airQuality';

const RouteMapView = ({ 
  routes, 
  selectedRoute, 
  fromAddress, 
  toAddress, 
  onSelectRoute,
  currentLocation,
  currentLocationLoading,
  searchedLocation,
  mapViewMode = 'current',
  showMap = true
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const searchLocationMarkerRef = useRef(null);
  
  const [mapError, setMapError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Google Map
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

      console.log('🗺️ Initializing always-on Google Map...');

      // Determine initial center
      const initialCenter = currentLocation ? 
        { lat: currentLocation.lat, lng: currentLocation.lng } :
        { lat: 20.5937, lng: 78.9629 }; // Center of India

      // Create map instance
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: currentLocation ? 15 : 6,
        center: initialCenter,
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
      
      console.log('✅ Always-on Google Map initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize map:', error);
      setMapError(error.message);
      setLoading(false);
    }
  }, [currentLocation]);

  // Initialize map when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeMap();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [initializeMap]);

  // ✅ Show current location marker
  const showCurrentLocationMarker = useCallback(() => {
    if (!isMapReady || !mapInstanceRef.current || !currentLocation) return;

    try {
      // Clear existing current location marker
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null);
      }

      // Create current location marker
      currentLocationMarkerRef.current = new window.google.maps.Marker({
        position: { lat: currentLocation.lat, lng: currentLocation.lng },
        map: mapInstanceRef.current,
        title: `Current Location: ${currentLocation.address}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" fill="#4A90E2" stroke="white" stroke-width="3"/>
              <circle cx="14" cy="14" r="6" fill="white"/>
              <circle cx="14" cy="14" r="3" fill="#4A90E2"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(28, 28),
          anchor: new window.google.maps.Point(14, 14)
        },
        animation: window.google.maps.Animation.DROP
      });

      // Add info window for current location
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <div style="font-weight: bold; color: #333; margin-bottom: 4px;">📍 Your Current Location</div>
            <div style="font-size: 13px; color: #666;">${currentLocation.address}</div>
            ${currentLocation.accuracy ? `<div style="font-size: 12px; color: #888; margin-top: 4px;">Accuracy: ${Math.round(currentLocation.accuracy)}m</div>` : ''}
          </div>
        `
      });

      currentLocationMarkerRef.current.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, currentLocationMarkerRef.current);
      });

      console.log('✅ Current location marker added');
    } catch (error) {
      console.error('❌ Failed to add current location marker:', error);
    }
  }, [isMapReady, currentLocation]);

  // ✅ Show searched location marker
  const showSearchedLocationMarker = useCallback(() => {
    if (!isMapReady || !mapInstanceRef.current || !searchedLocation) return;

    try {
      // Clear existing search location marker
      if (searchLocationMarkerRef.current) {
        searchLocationMarkerRef.current.setMap(null);
      }

      // Create searched location marker
      searchLocationMarkerRef.current = new window.google.maps.Marker({
        position: { lat: searchedLocation.lat, lng: searchedLocation.lng },
        map: mapInstanceRef.current,
        title: `Searched Location: ${searchedLocation.address}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.523-4.477-10-10-10z" fill="#50E3C2" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="12" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        },
        animation: window.google.maps.Animation.BOUNCE
      });

      // Add info window for searched location
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <div style="font-weight: bold; color: #333; margin-bottom: 4px;">🔍 Searched Location</div>
            <div style="font-size: 13px; color: #666;">${searchedLocation.address}</div>
            <div style="margin-top: 8px;">
              <button onclick="window.useAsDestination && window.useAsDestination()" style="background: #50E3C2; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                Use as Destination
              </button>
            </div>
          </div>
        `
      });

      // Make the "Use as Destination" button work
      window.useAsDestination = () => {
        // You can add a callback here to set the destination
        console.log('Use as destination clicked for:', searchedLocation);
        infoWindow.close();
      };

      searchLocationMarkerRef.current.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, searchLocationMarkerRef.current);
      });

      // Pan to searched location
      mapInstanceRef.current.panTo({ lat: searchedLocation.lat, lng: searchedLocation.lng });
      mapInstanceRef.current.setZoom(15);

      console.log('✅ Searched location marker added');
    } catch (error) {
      console.error('❌ Failed to add searched location marker:', error);
    }
  }, [isMapReady, searchedLocation]);

  // ✅ Handle map view mode changes
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    switch (mapViewMode) {
      case 'current':
        // Clear route
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setDirections({routes: []});
        }
        // Clear search marker
        if (searchLocationMarkerRef.current) {
          searchLocationMarkerRef.current.setMap(null);
        }
        // Show current location
        showCurrentLocationMarker();
        if (currentLocation) {
          mapInstanceRef.current.panTo({ lat: currentLocation.lat, lng: currentLocation.lng });
          mapInstanceRef.current.setZoom(15);
        }
        break;

      case 'search':
        // Clear route
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setDirections({routes: []});
        }
        // Show both current and searched location
        showCurrentLocationMarker();
        showSearchedLocationMarker();
        break;

      case 'route':
        // Clear individual markers when showing routes
        if (currentLocationMarkerRef.current) {
          currentLocationMarkerRef.current.setMap(null);
        }
        if (searchLocationMarkerRef.current) {
          searchLocationMarkerRef.current.setMap(null);
        }
        // Routes will be drawn by the existing route drawing logic
        break;

      default:
        showCurrentLocationMarker();
        break;
    }
  }, [mapViewMode, isMapReady, showCurrentLocationMarker, showSearchedLocationMarker]);

  // Show current location when it's available
  useEffect(() => {
    if (mapViewMode === 'current' || mapViewMode === 'search') {
      showCurrentLocationMarker();
    }
  }, [currentLocation, showCurrentLocationMarker, mapViewMode]);

  // Show searched location when it's available
  useEffect(() => {
    if (mapViewMode === 'search') {
      showSearchedLocationMarker();
    }
  }, [searchedLocation, showSearchedLocationMarker, mapViewMode]);

  // Draw route when selected route changes (existing logic)
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

  // Draw route when selectedRoute changes and in route mode
  useEffect(() => {
    if (selectedRoute && isMapReady && mapViewMode === 'route') {
      drawRoute(selectedRoute);
    }
  }, [selectedRoute, isMapReady, mapViewMode, drawRoute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null);
        currentLocationMarkerRef.current = null;
      }
      
      if (searchLocationMarkerRef.current) {
        searchLocationMarkerRef.current.setMap(null);
        searchLocationMarkerRef.current = null;
      }
      
      mapInstanceRef.current = null;
      directionsServiceRef.current = null;
    };
  }, []);

  if (!showMap) {
    return null;
  }

  if (mapError) {
    return (
      <div className="lg:col-span-1">
        <div className="card p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#333333] mb-2">Map Unavailable</h3>
          <p className="text-gray-600 mb-4">{mapError}</p>
          {currentLocation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current Location</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>📍 {currentLocation.address}</div>
                <div>📐 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</div>
                {currentLocation.accuracy && (
                  <div>🎯 Accuracy: {Math.round(currentLocation.accuracy)}m</div>
                )}
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
            <h2 className="text-lg font-semibold text-[#333333] flex items-center space-x-2">
              <Map className="w-5 h-5" />
              <span>Live Map</span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {mapViewMode === 'current' && (
                <div className="flex items-center space-x-1">
                  <Crosshair className="w-4 h-4" />
                  <span>Current Location</span>
                </div>
              )}
              {mapViewMode === 'search' && searchedLocation && (
                <div className="flex items-center space-x-1">
                  <Search className="w-4 h-4" />
                  <span>Searched Place</span>
                </div>
              )}
              {mapViewMode === 'route' && selectedRoute && (
                <div className="flex items-center space-x-1">
                  <RouteIcon className="w-4 h-4" />
                  <span>{selectedRoute.isHealthiest ? 'Healthiest Route' : 
                         selectedRoute.isFastest ? 'Fastest Route' : 'Alternative Route'}</span>
                </div>
              )}
            </div>
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
          {(loading || currentLocationLoading) && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Loader className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
                <div className="text-sm text-gray-600">
                  {currentLocationLoading ? 'Getting your location...' : 'Loading map...'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Information Panel */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {mapViewMode === 'current' && currentLocation && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-[#333333]">📍 Your Current Location</div>
              <div className="text-sm text-gray-600">{currentLocation.address}</div>
              {currentLocation.accuracy && (
                <div className="text-xs text-gray-500">Accuracy: {Math.round(currentLocation.accuracy)}m</div>
              )}
            </div>
          )}

          {mapViewMode === 'search' && searchedLocation && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-[#333333]">🔍 Searched Location</div>
              <div className="text-sm text-gray-600">{searchedLocation.address}</div>
            </div>
          )}

          {mapViewMode === 'route' && selectedRoute && (
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
          )}

          {/* Route Selection Buttons */}
          {mapViewMode === 'route' && routes.length > 1 && (
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
      </div>
    </div>
  );
};

export default RouteMapView;
