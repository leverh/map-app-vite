import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { saveUserData, getUserData } from '../services/databaseService';
import { getCurrentUserId } from '../services/authService';
import { useTheme } from '../App';
import CategorySelector from './CategorySelector';
import SearchBar from './SearchBar';
import PinModal from './PinModal';
import StatsPanel from './StatsPanel';
import LoadingSpinner from './LoadingSpinner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapComponent.module.css';

// Icon configuration
const createCustomIcon = (category, isDark) => {
  const colors = {
    default: isDark ? '#64748b' : '#475569',
    food: '#ef4444',
    cinema: '#8b5cf6',
    education: '#3b82f6',
    cafe: '#f59e0b',
    hotel: '#06b6d4',
    park: '#10b981',
    museum: '#ec4899',
    religion: '#6366f1',
    shopping: '#f97316',
    sport: '#84cc16',
    transport: '#6b7280',
    health: '#14b8a6',
  };

  const iconHtml = `
    <div class="custom-marker" style="
      background-color: ${colors[category] || colors.default};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <img src="/icons/${category}.svg" style="width: 18px; height: 18px; filter: brightness(0) invert(1);" />
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const MapClickHandler = ({ onMapClick, isAddingPin }) => {
  useMapEvents({
    click: (e) => {
      if (isAddingPin) {
        onMapClick(e);
      }
    },
  });
  return null;
};

const MapStateManager = ({ onMapChange }) => {
  const map = useMapEvents({
    moveend: () => {
      onMapChange({
        center: map.getCenter(),
        zoom: map.getZoom(),
      });
    },
    zoomend: () => {
      onMapChange({
        center: map.getCenter(),
        zoom: map.getZoom(),
      });
    },
  });
  return null;
};

const MapComponent = () => {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('default');
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [mapState, setMapState] = useState({ 
    center: [40.7128, -74.0060], // NYC default
    zoom: 10 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingPin, setPendingPin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const mapRef = useRef();
  const userId = getCurrentUserId();

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const snapshot = await getUserData(userId);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.mapState) {
            setMapState(data.mapState);
          }
          if (data.markers) {
            setMarkers(data.markers);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  useEffect(() => {
    let filtered = markers;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(marker => marker.category === categoryFilter);
    }

    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(marker => 
        marker.title?.toLowerCase().includes(query) ||
        marker.comment?.toLowerCase().includes(query) ||
        marker.category?.toLowerCase().includes(query)
      );
    }

    setFilteredMarkers(filtered);
  }, [markers, categoryFilter, searchQuery]);

  const saveData = useCallback(async (newMarkers = markers, newMapState = mapState) => {
    if (!userId) return;
    
    try {
      await saveUserData(userId, {
        markers: newMarkers,
        mapState: newMapState
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [userId, markers, mapState]);

  const handleMapClick = useCallback((e) => {
    if (!isAddingPin) return;
    
    setPendingPin({
      position: [e.latlng.lat, e.latlng.lng],
      category: selectedCategory
    });
    setShowPinModal(true);
    setIsAddingPin(false);
  }, [isAddingPin, selectedCategory]);

  // Add new pin
  const handleAddPin = useCallback(async (pinData) => {
    const newPin = {
      id: Date.now().toString(),
      position: pendingPin.position,
      category: pendingPin.category,
      title: pinData.title,
      comment: pinData.comment,
      createdAt: new Date().toISOString(),
      rating: pinData.rating || null
    };

    const newMarkers = [...markers, newPin];
    setMarkers(newMarkers);
    await saveData(newMarkers);
    
    setShowPinModal(false);
    setPendingPin(null);
  }, [pendingPin, markers, saveData]);

  const handleRemovePin = useCallback(async (pinId) => {
    const newMarkers = markers.filter(marker => marker.id !== pinId);
    setMarkers(newMarkers);
    await saveData(newMarkers);
    setSelectedMarker(null);
  }, [markers, saveData]);

  const handleUpdatePin = useCallback(async (pinId, updates) => {
    const newMarkers = markers.map(marker => 
      marker.id === pinId ? { ...marker, ...updates } : marker
    );
    setMarkers(newMarkers);
    await saveData(newMarkers);
  }, [markers, saveData]);

  const handleMapChange = useCallback(async (newMapState) => {
    setMapState(newMapState);
    await saveData(markers, newMapState);
  }, [markers, saveData]);

  const handleLocationSearch = useCallback(async (location) => {
    if (!mapRef.current) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon } = data[0];
        mapRef.current.flyTo([parseFloat(lat), parseFloat(lon)], 13, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, []);

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current.flyTo([latitude, longitude], 13, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      }
    );
  }, []);

  const toggleAddPinMode = useCallback(() => {
    setIsAddingPin(!isAddingPin);
  }, [isAddingPin]);

  if (isLoading) {
    return <LoadingSpinner text="Loading your map..." />;
  }

  return (
    <div className={styles.mapPage}>
      {/* Header Controls */}
<div className={`${styles.mapHeader} glass-effect`}>
  <div className={styles.headerTop}>
    <div className={styles.headerLeft}>
      <h1 className={styles.pageTitle}>My Map</h1>
      <div className={styles.mapStats}>
        <span className={styles.statItem}>
          {markers.length} {markers.length === 1 ? 'place' : 'places'}
        </span>
        <span className={styles.statItem}>
          {new Set(markers.map(m => m.category)).size} categories
        </span>
      </div>
    </div>
    
    <button
      onClick={() => setShowStats(!showStats)}
      className={`btn btn-ghost ${styles.statsButton}`}
      aria-pressed={showStats}
      title="View Statistics"
    >
      <StatsIcon />
    </button>
  </div>
  <div className={styles.headerControls}>
    <SearchBar 
      onSearch={handleLocationSearch}
      onCurrentLocation={handleGetCurrentLocation}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
    />
    
    <CategorySelector
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
    />
    
    <button
      onClick={toggleAddPinMode}
      className={`btn ${isAddingPin ? 'btn-primary' : 'btn-secondary'} ${styles.addPinButton}`}
      aria-pressed={isAddingPin}
    >
      {isAddingPin ? (
        <>
          <span>Cancel</span>
        </>
      ) : (
        <>
          <PlusIcon />
          <span>Add Pin</span>
        </>
      )}
    </button>
  </div>
</div>

      {/* Map Container */}
      <div className={styles.mapWrapper}>
        <MapContainer
          ref={mapRef}
          center={mapState.center}
          zoom={mapState.zoom}
          className={styles.map}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Tile Layer */}
          <TileLayer
            url={isDark 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />

          <MapClickHandler onMapClick={handleMapClick} isAddingPin={isAddingPin} />
          <MapStateManager onMapChange={handleMapChange} />

          <MarkerClusterGroup
            chunkedLoading
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            maxClusterRadius={50}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
              
              return L.divIcon({
                html: `<div class="marker-cluster marker-cluster-${size}">
                  <div><span>${count}</span></div>
                </div>`,
                className: 'marker-cluster-custom',
                iconSize: L.point(40, 40, true),
              });
            }}
          >
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={createCustomIcon(marker.category, isDark)}
                eventHandlers={{
                  click: () => setSelectedMarker(marker),
                }}
              >
                <Popup className={styles.customPopup} closeButton={false}>
                  <div className={styles.popupContent}>
                    <div className={styles.popupHeader}>
                      <h3 className={styles.popupTitle}>{marker.title}</h3>
                      <span className={styles.popupCategory}>
                        {marker.category}
                      </span>
                    </div>
                    
                    {marker.comment && (
                      <p className={styles.popupComment}>{marker.comment}</p>
                    )}
                    
                    {marker.rating && (
                      <div className={styles.popupRating}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <StarIcon
                            key={i}
                            className={i < marker.rating ? styles.starFilled : styles.starEmpty}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className={styles.popupActions}>
                      <button
                        onClick={() => handleRemovePin(marker.id)}
                        className={`btn btn-ghost btn-sm ${styles.removeButton}`}
                      >
                        <TrashIcon />
                        Remove
                      </button>
                    </div>
                    
                    <div className={styles.popupMeta}>
                      Added {new Date(marker.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

          <div className={styles.mapControls}>
            <button
              className={`${styles.controlButton} glass-effect`}
              onClick={handleGetCurrentLocation}
              title="Go to current location"
            >
              <LocationIcon />
            </button>
          </div>
        </MapContainer>

        {isAddingPin && (
  <div className={styles.addPinOverlay}>
    <div className={styles.addPinInstructions}>
      <div className={styles.instructionIcon}>
        <MapPinIcon />
      </div>
      <h3>Click anywhere on the map to add a pin</h3>
      <p>Selected category: <strong>{selectedCategory}</strong></p>
      <button 
        onClick={() => setIsAddingPin(false)}
        className="btn btn-secondary btn-sm"
        style={{ marginTop: '1rem' }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
      </div>

      {showStats && (
        <StatsPanel
          markers={markers}
          onClose={() => setShowStats(false)}
        />
      )}

      {showPinModal && (
        <PinModal
          onSubmit={handleAddPin}
          onCancel={() => {
            setShowPinModal(false);
            setPendingPin(null);
          }}
          category={pendingPin?.category}
        />
      )}
    </div>
  );
};

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const StatsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 12L12 7L16 11L21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M21 10C21 17L12 23L3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default MapComponent;