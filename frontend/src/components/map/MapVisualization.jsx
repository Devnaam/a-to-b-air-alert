import React, { useEffect, useRef, useState } from 'react';
import { Loader, MapPin, Wind, Eye, EyeOff } from 'lucide-react';
import { getAQILevel } from '../../utils/airQuality';

const MapVisualization = ({ route, airQualityData, center, zoom = 12 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showAQILayer, setShowAQILayer] = useState(true);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Check if Google Maps API is loaded
        if (!window.google || !window.google.maps) {
          setMapError('Google Maps API not loaded');
          return;
        }

        // Initialize map
        const map = new window.google.maps.Map(mapRef.current, {
          center: center || { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
          zoom: zoom,
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#F4F7F9' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#4A90E2' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Add route if available
        if (route && route.legs && route.legs[0]) {
          drawColorCodedRoute(map, route, airQualityData);
        }

      } catch (error) {
        console.error('Map initialization error:', error);
        setMapError('Failed to initialize map');
      }
    };

    initializeMap();
  }, [center, zoom]);

  // Update route when data changes
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current && route && airQualityData) {
      drawColorCodedRoute(mapInstanceRef.current, route, airQualityData);
    }
  }, [route, airQualityData, mapLoaded, showAQILayer]);

  const drawColorCodedRoute = (map, routeData, aqiData) => {
    // Clear existing overlays
    // In a real implementation, you'd store references to overlays to clear them

    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeOpacity: 0.8,
        strokeWeight: 6,
      }
    });

    // Create color-coded polyline segments
    if (aqiData && aqiData.length > 0 && showAQILayer) {
      drawAQIColorCodedSegments(map, routeData, aqiData);
    } else {
      // Default route rendering
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections({
        request: {},
        routes: [routeData]
      });
    }

    // Add start and end markers
    addRouteMarkers(map, routeData);
    
    // Add AQI info windows along route
    if (showAQILayer && aqiData && aqiData.length > 0) {
      addAQIMarkers(map, aqiData);
    }
  };

  const drawAQIColorCodedSegments = (map, routeData, aqiData) => {
    const path = routeData.overview_path || [];
    if (!path.length || !aqiData.length) return;

    // Create segments based on AQI data points
    for (let i = 0; i < aqiData.length - 1; i++) {
      const currentAQI = aqiData[i];
      const nextAQI = aqiData[i + 1];
      const aqiLevel = getAQILevel(currentAQI.aqi);

      // Calculate segment path (simplified - in real app, use proper route segment)
      const segmentPath = [
        currentAQI.location,
        nextAQI.location
      ];

      const polyline = new window.google.maps.Polyline({
        path: segmentPath,
        strokeColor: aqiLevel.color,
        strokeOpacity: 0.8,
        strokeWeight: 8,
        map: map
      });

      // Add click listener for segment details
      polyline.addListener('click', (event) => {
        showAQIInfoWindow(map, event.latLng, currentAQI);
      });
    }
  };

  const addRouteMarkers = (map, routeData) => {
    const leg = routeData.legs[0];
    
    // Start marker
    new window.google.maps.Marker({
      position: leg.start_location,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#4A90E2',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8
      },
      title: 'Start'
    });

    // End marker
    new window.google.maps.Marker({
      position: leg.end_location,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#50E3C2',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 8
      },
      title: 'Destination'
    });
  };

  const addAQIMarkers = (map, aqiData) => {
    aqiData.forEach((point, index) => {
      const aqiLevel = getAQILevel(point.aqi);
      
      const marker = new window.google.maps.Marker({
        position: point.location,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: aqiLevel.color,
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 1,
          scale: 6
        },
        title: `AQI ${point.aqi}`
      });

      marker.addListener('click', () => {
        showAQIInfoWindow(map, point.location, point);
      });
    });
  };

  const showAQIInfoWindow = (map, position, aqiPoint) => {
    const aqiLevel = getAQILevel(aqiPoint.aqi);
    
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-3">
          <h3 class="font-semibold text-gray-900 mb-2">Air Quality</h3>
          <div class="flex items-center space-x-2 mb-2">
            <div class="w-4 h-4 rounded-full" style="background-color: ${aqiLevel.color}"></div>
            <span class="font-medium">AQI ${aqiPoint.aqi}</span>
          </div>
          <div class="text-sm text-gray-600">${aqiLevel.label}</div>
        </div>
      `,
      position: position
    });

    infoWindow.open(map);
  };

  if (mapError) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Wind className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Map unavailable</p>
          <p className="text-sm text-gray-500">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <Loader className="w-8 h-8 text-[#4A90E2] animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md">
        <button
          onClick={() => setShowAQILayer(!showAQILayer)}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            showAQILayer 
              ? 'text-[#4A90E2] bg-[#4A90E2] bg-opacity-10' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {showAQILayer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>AQI Layer</span>
        </button>
      </div>

      {/* AQI Legend */}
      {showAQILayer && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">AQI Scale</h4>
          <div className="space-y-1">
            {[
              { label: 'Good', color: '#00E400', range: '0-50' },
              { label: 'Moderate', color: '#FFFF00', range: '51-100' },
              { label: 'Unhealthy', color: '#FF7E00', range: '101-150' },
              { label: 'Very Unhealthy', color: '#FF0000', range: '151+' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-700">{item.label} ({item.range})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;
