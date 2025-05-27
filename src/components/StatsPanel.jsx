import { useState, useMemo } from 'react';
import styles from './StatsPanel.module.css';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TrendUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17,6 23,6 23,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M21 10C21 17L12 23L3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const categories = {
  default: { name: 'Default', icon: '📍', color: '#64748b' },
  food: { name: 'Food', icon: '🍽️', color: '#ef4444' },
  cinema: { name: 'Cinema', icon: '🎬', color: '#8b5cf6' },
  education: { name: 'Education', icon: '🎓', color: '#3b82f6' },
  cafe: { name: 'Café', icon: '☕', color: '#f59e0b' },
  hotel: { name: 'Hotel', icon: '🏨', color: '#06b6d4' },
  park: { name: 'Park', icon: '🌳', color: '#10b981' },
  museum: { name: 'Museum', icon: '🏛️', color: '#ec4899' },
  religion: { name: 'Religion', icon: '⛪', color: '#6366f1' },
  shopping: { name: 'Shopping', icon: '🛍️', color: '#f97316' },
  sport: { name: 'Sport', icon: '⚽', color: '#84cc16' },
  transport: { name: 'Transport', icon: '🚇', color: '#6b7280' },
  health: { name: 'Health', icon: '🏥', color: '#14b8a6' },
};

const StatsPanel = ({ markers, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = useMemo(() => {
    const categoryStats = {};
    const monthlyStats = {};
    const ratingStats = { total: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
    
    Object.keys(categories).forEach(cat => {
      categoryStats[cat] = { count: 0, percentage: 0 };
    });

    markers.forEach(marker => {
      const category = marker.category || 'default';
      if (categoryStats[category]) {
        categoryStats[category].count++;
      }

      if (marker.createdAt) {
        const date = new Date(marker.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
      }

      if (marker.rating && marker.rating > 0) {
        ratingStats.total += marker.rating;
        ratingStats.count++;
        ratingStats.distribution[marker.rating - 1]++;
      }
    });

    Object.keys(categoryStats).forEach(cat => {
      categoryStats[cat].percentage = markers.length > 0 
        ? (categoryStats[cat].count / markers.length) * 100 
        : 0;
    });

    const sortedCategories = Object.entries(categoryStats)
      .filter(([_, data]) => data.count > 0)
      .sort(([,a], [,b]) => b.count - a.count);

    const averageRating = ratingStats.count > 0 
      ? ratingStats.total / ratingStats.count 
      : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPins = markers.filter(marker => 
      marker.createdAt && new Date(marker.createdAt) > thirtyDaysAgo
    ).length;

    return {
      total: markers.length,
      categories: sortedCategories,
      categoryStats,
      monthlyStats,
      averageRating,
      ratingStats,
      recentPins
    };
  }, [markers]);

  const StatCard = ({ icon, title, value, subtitle, trend, color = 'var(--color-primary)' }) => (
    <div className={`${styles.statCard} card`}>
      <div className={styles.statIcon} style={{ color }}>
        {icon}
      </div>
      <div className={styles.statContent}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statTitle}>{title}</div>
        {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
        {trend && (
          <div className={`${styles.statTrend} ${trend > 0 ? styles.trendUp : styles.trendDown}`}>
            <TrendUpIcon />
            <span>{Math.abs(trend)}% this month</span>
          </div>
        )}
      </div>
    </div>
  );

  const ProgressBar = ({ percentage, color, height = '8px' }) => (
    <div className={styles.progressBar} style={{ height }}>
      <div 
        className={styles.progressFill}
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: color,
          transition: 'width 1s ease-out'
        }}
      />
    </div>
  );

  return (
    <div className={styles.statsOverlay}>
      <div className={`${styles.statsPanel} glass-effect`}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.panelTitle}>Your Map Statistics</h2>
            <p className={styles.panelSubtitle}>Insights about your saved places</p>
          </div>
          <button
            onClick={onClose}
            className={`${styles.closeButton} btn btn-ghost btn-sm`}
            aria-label="Close statistics panel"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`${styles.tab} ${activeTab === 'categories' ? styles.tabActive : ''}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`${styles.tab} ${activeTab === 'ratings' ? styles.tabActive : ''}`}
          >
            Ratings
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewTab}>
              {/* Quick Stats */}
              <div className={styles.quickStats}>
                <StatCard
                  icon={<MapPinIcon />}
                  title="Total Places"
                  value={stats.total}
                  color="var(--color-primary)"
                />
                <StatCard
                  icon={<CalendarIcon />}
                  title="This Month"
                  value={stats.recentPins}
                  subtitle="Last 30 days"
                  color="var(--color-success)"
                />
                <StatCard
                  icon={<StarIcon />}
                  title="Avg Rating"
                  value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                  subtitle={stats.ratingStats.count > 0 ? `${stats.ratingStats.count} rated` : 'No ratings'}
                  color="var(--color-warning)"
                />
              </div>

              {/* Top Categories */}
              {stats.categories.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Top Categories</h3>
                  <div className={styles.topCategories}>
                    {stats.categories.slice(0, 3).map(([categoryId, data]) => {
                      const category = categories[categoryId];
                      return (
                        <div key={categoryId} className={styles.topCategory}>
                          <div className={styles.categoryHeader}>
                            <span className={styles.categoryEmoji}>{category.icon}</span>
                            <div className={styles.categoryInfo}>
                              <span className={styles.categoryName}>{category.name}</span>
                              <span className={styles.categoryCount}>{data.count} places</span>
                            </div>
                            <span className={styles.categoryPercentage}>
                              {data.percentage.toFixed(0)}%
                            </span>
                          </div>
                          <ProgressBar 
                            percentage={data.percentage} 
                            color={category.color}
                            height="6px"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className={styles.categoriesTab}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>All Categories</h3>
                <div className={styles.categoryList}>
                  {stats.categories.map(([categoryId, data]) => {
                    const category = categories[categoryId];
                    return (
                      <div key={categoryId} className={styles.categoryItem}>
                        <div className={styles.categoryItemHeader}>
                          <div className={styles.categoryItemLeft}>
                            <span className={styles.categoryEmoji}>{category.icon}</span>
                            <span className={styles.categoryName}>{category.name}</span>
                          </div>
                          <div className={styles.categoryItemRight}>
                            <span className={styles.categoryCount}>{data.count}</span>
                            <span className={styles.categoryPercentage}>
                              {data.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <ProgressBar 
                          percentage={data.percentage} 
                          color={category.color}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ratings' && (
            <div className={styles.ratingsTab}>
              {stats.ratingStats.count > 0 ? (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Rating Distribution</h3>
                  <div className={styles.ratingDistribution}>
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = stats.ratingStats.distribution[rating - 1];
                      const percentage = stats.ratingStats.count > 0 
                        ? (count / stats.ratingStats.count) * 100 
                        : 0;
                      
                      return (
                        <div key={rating} className={styles.ratingRow}>
                          <div className={styles.ratingLabel}>
                            <span>{rating}</span>
                            <StarIcon />
                          </div>
                          <div className={styles.ratingBarContainer}>
                            <ProgressBar 
                              percentage={percentage} 
                              color="#fbbf24"
                              height="12px"
                            />
                          </div>
                          <span className={styles.ratingCount}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className={styles.ratingsSummary}>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Average Rating</span>
                      <span className={styles.summaryValue}>
                        {stats.averageRating.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Total Rated</span>
                      <span className={styles.summaryValue}>
                        {stats.ratingStats.count} of {stats.total}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <StarIcon />
                  <h3>No Ratings Yet</h3>
                  <p>Start rating your saved places to see analytics here!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;