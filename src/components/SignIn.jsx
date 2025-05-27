import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTheme } from '../App';
import styles from './Auth.module.css';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A13.16 13.16 0 0 1 5.06 6.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A13.16 13.16 0 0 1 19.13 16.13" stroke="currentColor" strokeWidth="2"/>
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MapIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path d="M9 20L3 17V4L9 7L15 4L21 7V20L15 17L9 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 7V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 4V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SignIn = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/map');
    } catch (error) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/map');
    } catch (error) {
      console.error('Google sign in error:', error);
      
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        {/* Left Side - Branding */}
        <div className={styles.brandingSide}>
          <div className={styles.brandingContent}>
            <div className={styles.logo}>
              <MapIcon />
              <span>MapMarker</span>
            </div>
            <h1 className={styles.brandingTitle}>
              Welcome back to your
              <span className={styles.gradient}> personal map</span>
            </h1>
            <p className={styles.brandingSubtitle}>
              Continue your journey of discovering and saving amazing places around the world.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🗺️</span>
                <span>Interactive mapping</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📍</span>
                <span>Custom categories</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⭐</span>
                <span>Rate your places</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={styles.formSide}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Sign In</h2>
              <p className={styles.formSubtitle}>
                Enter your credentials to access your map
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`form-input ${errors.email ? styles.inputError : ''}`}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className={styles.errorMessage}>{errors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className={styles.passwordContainer}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`form-input ${errors.password ? styles.inputError : ''}`}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.errorMessage}>{errors.password}</span>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className={styles.submitError}>
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner} />
                    <span>Signing In...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className={styles.divider}>
                <span>or</span>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className={`btn btn-secondary btn-lg ${styles.googleButton}`}
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Footer */}
            <div className={styles.formFooter}>
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className={styles.link}>
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;