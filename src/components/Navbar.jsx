import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTheme } from '../App';
import styles from './Navbar.module.css';

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 20L3 17V4L9 7L15 4L21 7V20L15 17L9 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 7V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 4V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Navbar = ({ user }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`${styles.navbar} glass-effect`}>
      <div className={`${styles.navContainer} container`}>
        {/* Logo */}
        <Link to="/" className={styles.brand}>
          <MapIcon />
          <span>MapMarker</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className={styles.desktopNav}>
            {user && (
              <div className={styles.navLinks}>
                <Link 
                  to="/map" 
                  className={`${styles.navLink} ${isActivePage('/map') ? styles.active : ''}`}
                >
                  <MapIcon />
                  <span>Map</span>
                </Link>
                <Link 
                  to="/profile" 
                  className={`${styles.navLink} ${isActivePage('/profile') ? styles.active : ''}`}
                >
                  <UserIcon />
                  <span>Profile</span>
                </Link>
              </div>
            )}

            <div className={styles.navActions}>
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className={`${styles.themeToggle} btn btn-ghost btn-sm`}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>

              {/* Auth Actions */}
              {user ? (
                <div className={styles.userActions}>
                  <span className={styles.userEmail}>{user.email}</span>
                  <button 
                    onClick={handleSignOut}
                    className="btn btn-ghost btn-sm"
                  >
                    <LogoutIcon />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className={styles.authLinks}>
                  <Link to="/signin" className="btn btn-ghost btn-sm">
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            onClick={toggleMobileMenu}
            className={`${styles.mobileMenuButton} btn btn-ghost btn-sm`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className={`${styles.mobileMenu} glass-effect`}>
          <div className={styles.mobileMenuContent}>
            {user && (
              <div className={styles.mobileNavLinks}>
                <Link 
                  to="/map" 
                  className={`${styles.mobileNavLink} ${isActivePage('/map') ? styles.active : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MapIcon />
                  <span>Map</span>
                </Link>
                <Link 
                  to="/profile" 
                  className={`${styles.mobileNavLink} ${isActivePage('/profile') ? styles.active : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserIcon />
                  <span>Profile</span>
                </Link>
              </div>
            )}

            <div className={styles.mobileActions}>
              <button 
                onClick={toggleTheme}
                className={`${styles.mobileThemeToggle} btn btn-ghost`}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              {user ? (
                <div className={styles.mobileUserSection}>
                  <div className={styles.mobileUserEmail}>{user.email}</div>
                  <button 
                    onClick={handleSignOut}
                    className="btn btn-ghost"
                  >
                    <LogoutIcon />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className={styles.mobileAuthLinks}>
                  <Link 
                    to="/signin" 
                    className="btn btn-ghost"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="btn btn-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;