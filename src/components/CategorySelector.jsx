import { useState, useRef, useEffect } from 'react';
import styles from './CategorySelector.module.css';

const categories = [
  { id: 'default', name: 'Default', icon: '📍', color: '#64748b' },
  { id: 'food', name: 'Food', icon: '🍽️', color: '#ef4444' },
  { id: 'cinema', name: 'Cinema', icon: '🎬', color: '#8b5cf6' },
  { id: 'education', name: 'Education', icon: '🎓', color: '#3b82f6' },
  { id: 'cafe', name: 'Café', icon: '☕', color: '#f59e0b' },
  { id: 'hotel', name: 'Hotel', icon: '🏨', color: '#06b6d4' },
  { id: 'park', name: 'Park', icon: '🌳', color: '#10b981' },
  { id: 'museum', name: 'Museum', icon: '🏛️', color: '#ec4899' },
  { id: 'religion', name: 'Religion', icon: '⛪', color: '#6366f1' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#f97316' },
  { id: 'sport', name: 'Sport', icon: '⚽', color: '#84cc16' },
  { id: 'transport', name: 'Transport', icon: '🚇', color: '#6b7280' },
  { id: 'health', name: 'Health', icon: '🏥', color: '#14b8a6' },
];

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CategorySelector = ({
  selectedCategory,
  onCategoryChange,
  categoryFilter,
  onCategoryFilterChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('select');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const filterCategoryData = categories.find(cat => cat.id === categoryFilter);

  const handleCategorySelect = (categoryId) => {
    if (activeTab === 'select') {
      onCategoryChange(categoryId);
    } else {
      onCategoryFilterChange(categoryId);
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.categorySelector} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className={`${styles.triggerButton} btn btn-secondary`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={styles.triggerContent}>
          <span className={styles.triggerIcon}>
            {activeTab === 'select' ? selectedCategoryData?.icon : <FilterIcon />}
          </span>
          <span className={styles.triggerText}>
            {activeTab === 'select' 
              ? selectedCategoryData?.name 
              : categoryFilter === 'all' ? 'All Categories' : filterCategoryData?.name
            }
          </span>
        </div>
        <ChevronDownIcon />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`${styles.dropdown} glass-effect`}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              onClick={() => setActiveTab('select')}
              className={`${styles.tab} ${activeTab === 'select' ? styles.tabActive : ''}`}
            >
              Select Category
            </button>
            <button
              onClick={() => setActiveTab('filter')}
              className={`${styles.tab} ${activeTab === 'filter' ? styles.tabActive : ''}`}
            >
              Filter View
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'select' ? (
              <div className={styles.categoryGrid}>
                <div className={styles.sectionTitle}>Choose category for new pins:</div>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`${styles.categoryItem} ${
                      selectedCategory === category.id ? styles.categoryItemActive : ''
                    }`}
                    style={{ '--category-color': category.color }}
                  >
                    <span className={styles.categoryIcon}>{category.icon}</span>
                    <span className={styles.categoryName}>{category.name}</span>
                    {selectedCategory === category.id && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.filterOptions}>
                <div className={styles.sectionTitle}>Show pins by category:</div>
                
                {/* All Categories Option */}
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`${styles.filterItem} ${
                    categoryFilter === 'all' ? styles.filterItemActive : ''
                  }`}
                >
                  <span className={styles.filterIcon}>
                    <FilterIcon />
                  </span>
                  <span className={styles.filterName}>All Categories</span>
                  {categoryFilter === 'all' && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </button>

                {/* Individual Categories */}
                <div className={styles.filterGrid}>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`${styles.filterItem} ${
                        categoryFilter === category.id ? styles.filterItemActive : ''
                      }`}
                      style={{ '--category-color': category.color }}
                    >
                      <span className={styles.filterIcon}>{category.icon}</span>
                      <span className={styles.filterName}>{category.name}</span>
                      {categoryFilter === category.id && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;