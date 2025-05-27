import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../App';
import styles from './WelcomePage.module.css';

// Animated Icons
const MapPinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10C21 17L12 23L3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShareIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WelcomePage = () => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: MapPinIcon,
      title: "Pin Your Memories",
      description: "Drop pins on locations that matter to you. Save restaurants, attractions, or special places with custom categories."
    },
    {
      icon: SearchIcon,
      title: "Discover Places",
      description: "Search for any location worldwide and explore new places to add to your personal collection."
    },
    {
      icon: ShareIcon,
      title: "Organize & Categorize",
      description: "Sort your saved locations by type - food, entertainment, travel, and more with custom icons."
    },
    {
      icon: StarIcon,
      title: "Never Forget",
      description: "Add notes and memories to each location. Your personal map grows with your experiences."
    }
  ];

  return (
    <div className={styles.welcomePage}>
      {/* Hero Section */}
      <section className={`${styles.hero} ${isVisible ? styles.fadeInUp : ''}`}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Your Personal
                <span className={styles.gradient}> Map Journal</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Save, organize, and revisit the places that matter most to you. 
                Create your own interactive map of memories and discoveries.
              </p>
              <div className={styles.heroActions}>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Start Mapping
                </Link>
                <Link to="/signin" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.mapPreview}>
                <div className={styles.mockMap}>
                  <div className={`${styles.mapPin} ${styles.pin1}`}>
                    <MapPinIcon className={styles.pinIcon} />
                  </div>
                  <div className={`${styles.mapPin} ${styles.pin2}`}>
                    <MapPinIcon className={styles.pinIcon} />
                  </div>
                  <div className={`${styles.mapPin} ${styles.pin3}`}>
                    <MapPinIcon className={styles.pinIcon} />
                  </div>
                  <div className={styles.mapGrid}>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className={styles.gridDot} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresHeader}>
            <h2 className={styles.sectionTitle}>Everything you need to map your world</h2>
            <p className={styles.sectionSubtitle}>
              Simple, powerful tools to help you save and organize your favorite places
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`${styles.featureCard} card ${isVisible ? styles.fadeInUp : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.featureIcon}>
                  <feature.icon className={styles.icon} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <div className={`${styles.ctaContent} glass-effect`}>
            <h2 className={styles.ctaTitle}>Ready to start your map journey?</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of users who are already mapping their world
            </p>
            <div className={styles.ctaActions}>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Create Account
              </Link>
              <p className={styles.ctaNote}>
                Free forever • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.floatingShape1}></div>
        <div className={styles.floatingShape2}></div>
        <div className={styles.floatingShape3}></div>
      </div>
    </div>
  );
};

export default WelcomePage;