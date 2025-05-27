import { useState, useRef, useEffect } from 'react';
import styles from './SearchBar.module.css';

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SearchBar = ({
  onSearch,
  onCurrentLocation,
  searchQuery,
  onSearchQueryChange
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onSearchQueryChange(value);
    setSelectedIndex(-1);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length > 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      const formattedSuggestions = data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
        address: item.address
      }));
      
      setSuggestions(formattedSuggestions);
      setShowSuggestions(formattedSuggestions.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (query = inputValue) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      await onSearch(query);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.name);
    onSearchQueryChange(suggestion.name);
    setShowSuggestions(false);
    handleSearch(suggestion.name);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCurrentLocation = () => {
    onCurrentLocation();
  };

  const handleClear = () => {
    setInputValue('');
    onSearchQueryChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        {/* Search Input */}
        <div className={styles.inputWrapper}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search places..."
            className={styles.searchInput}
            disabled={isSearching}
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button
            onClick={() => handleSearch()}
            disabled={!inputValue.trim() || isSearching}
            className={`btn btn-primary btn-sm ${styles.searchButton}`}
          >
            {isSearching ? (
              <div className={styles.spinner} />
            ) : (
              'Search'
            )}
          </button>
          
          <button
            onClick={handleCurrentLocation}
            className={`btn btn-ghost btn-sm ${styles.locationButton}`}
            title="Go to current location"
          >
            <LocationIcon />
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className={`${styles.suggestions} glass-effect`}>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`${styles.suggestionItem} ${
                index === selectedIndex ? styles.suggestionSelected : ''
              }`}
            >
              <div className={styles.suggestionContent}>
                <div className={styles.suggestionName}>
                  {suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || suggestion.name.split(',')[0]}
                </div>
                <div className={styles.suggestionDetails}>
                  {suggestion.address?.country && (
                    <span className={styles.suggestionCountry}>
                      {suggestion.address.country}
                    </span>
                  )}
                  {suggestion.type && (
                    <span className={styles.suggestionType}>
                      {suggestion.type}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;