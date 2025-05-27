import { useState, useEffect } from 'react';
import { updateProfile, updatePassword, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';
import { getUserData } from '../services/databaseService';
import LoadingSpinner from './LoadingSpinner';
import styles from './Profile.module.css';

const UserIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
    <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M21 10C21 17L12 23L3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const Profile = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const snapshot = await getUserData(user.uid);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);
        }
        
        setFormData({
          displayName: user.displayName || '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors and success message
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    
    try {
      if (formData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName.trim()
        });
      }
      
      if (formData.newPassword) {
        await updatePassword(user, formData.newPassword);
        setFormData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: ''
        }));
      }
      
      setUser(auth.currentUser);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      switch (error.code) {
        case 'auth/requires-recent-login':
          errorMessage = 'Please sign out and sign back in before changing your password.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getJoinDate = () => {
    if (!user?.metadata?.creationTime) return 'Unknown';
    return new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMapStats = () => {
    if (!userData?.markers) return { total: 0, categories: 0 };
    
    const markers = userData.markers;
    const categories = new Set(markers.map(m => m.category || 'default'));
    
    return {
      total: markers.length,
      categories: categories.size
    };
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  const stats = getMapStats();

  return (
    <div className={styles.profilePage}>
      <div className="container">
        <div className={styles.profileContainer}>
          {/* Profile Header */}
          <div className={`${styles.profileHeader} card`}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className={styles.avatarImage} />
                ) : (
                  <UserIcon />
                )}
              </div>
              <div className={styles.userInfo}>
                <h1 className={styles.userName}>
                  {user?.displayName || 'Anonymous User'}
                </h1>
                <p className={styles.userEmail}>{user?.email}</p>
                <p className={styles.joinDate}>
                  Member since {getJoinDate()}
                </p>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary"
                >
                  <EditIcon />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setErrors({});
                    setFormData({
                      displayName: user?.displayName || '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Map Statistics */}
          <div className={`${styles.statsSection} card`}>
            <h2 className={styles.sectionTitle}>Your Map Statistics</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>
                  <MapPinIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{stats.total}</div>
                  <div className={styles.statLabel}>Saved Places</div>
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>
                  <CalendarIcon />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{stats.categories}</div>
                  <div className={styles.statLabel}>Categories Used</div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <div className={`${styles.editSection} card`}>
              <h2 className={styles.sectionTitle}>Edit Profile</h2>
              
              {successMessage && (
                <div className={styles.successMessage}>
                  {successMessage}
                </div>
              )}
              
              <form onSubmit={handleUpdateProfile} className={styles.editForm}>
                <div className="form-group">
                  <label htmlFor="displayName" className="form-label">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Enter your display name"
                    className={`form-input ${errors.displayName ? styles.inputError : ''}`}
                    disabled={isUpdating}
                  />
                  {errors.displayName && (
                    <span className={styles.errorMessage}>{errors.displayName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    New Password (Optional)
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className={`form-input ${errors.newPassword ? styles.inputError : ''}`}
                    disabled={isUpdating}
                  />
                  {errors.newPassword && (
                    <span className={styles.errorMessage}>{errors.newPassword}</span>
                  )}
                </div>

                {formData.newPassword && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      className={`form-input ${errors.confirmPassword ? styles.inputError : ''}`}
                      disabled={isUpdating}
                    />
                    {errors.confirmPassword && (
                      <span className={styles.errorMessage}>{errors.confirmPassword}</span>
                    )}
                  </div>
                )}

                {errors.submit && (
                  <div className={styles.submitError}>
                    {errors.submit}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <div className={styles.spinner} />
                        <span>Updating...</span>
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Actions Section */}
          <div className={`${styles.actionsSection} card`}>
            <h2 className={styles.sectionTitle}>Account Actions</h2>
            <div className={styles.actionsList}>
              <button
                onClick={() => navigate('/map')}
                className="btn btn-secondary"
              >
                Go to Map
              </button>
              <button
                onClick={handleSignOut}
                className={`btn btn-ghost ${styles.signOutButton}`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;