import { useState, useEffect, useRef } from 'react';
import styles from './PinModal.module.css';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const StarIcon = ({ filled, onClick, size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
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

const PinModal = ({ onSubmit, onCancel, category = 'default' }) => {
  const [formData, setFormData] = useState({
    title: '',
    comment: '',
    rating: 0
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [onCancel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.comment.length > 500) {
      newErrors.comment = 'Comment must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        rating: formData.rating || null
      });
    } catch (error) {
      console.error('Error submitting pin:', error);
      setErrors({ submit: 'Failed to save pin. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryData = categories[category] || categories.default;

  return (
    <div className={styles.modalOverlay}>
      <div ref={modalRef} className={`${styles.modal} glass-effect`}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.categoryInfo}>
              <span 
                className={styles.categoryIcon}
                style={{ color: categoryData.color }}
              >
                {categoryData.icon}
              </span>
              <div>
                <h2 className={styles.modalTitle}>Add New Pin</h2>
                <p className={styles.categoryName}>Category: {categoryData.name}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className={`${styles.closeButton} btn btn-ghost btn-sm`}
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="pin-title" className="form-label">
              Title *
            </label>
            <input
              ref={titleInputRef}
              id="pin-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a name for this place..."
              className={`form-input ${errors.title ? styles.inputError : ''}`}
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className={styles.errorMessage}>{errors.title}</span>
            )}
            <div className={styles.characterCount}>
              {formData.title.length}/100
            </div>
          </div>

          {/* Comment Field */}
          <div className="form-group">
            <label htmlFor="pin-comment" className="form-label">
              Notes (Optional)
            </label>
            <textarea
              id="pin-comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Add any notes or memories about this place..."
              className={`${styles.textarea} ${errors.comment ? styles.inputError : ''}`}
              rows="3"
              maxLength={500}
              disabled={isSubmitting}
            />
            {errors.comment && (
              <span className={styles.errorMessage}>{errors.comment}</span>
            )}
            <div className={styles.characterCount}>
              {formData.comment.length}/500
            </div>
          </div>

          {/* Rating Field */}
          <div className="form-group">
            <label className="form-label">
              Rating (Optional)
            </label>
            <div className={styles.ratingContainer}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={star <= formData.rating}
                    onClick={() => handleRatingChange(
                      star === formData.rating ? 0 : star
                    )}
                    size={28}
                  />
                ))}
              </div>
              <div className={styles.ratingText}>
                {formData.rating > 0 ? (
                  <span>{formData.rating} star{formData.rating !== 1 ? 's' : ''}</span>
                ) : (
                  <span className={styles.noRating}>No rating</span>
                )}
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className={styles.submitError}>
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner} />
                  <span>Saving...</span>
                </>
              ) : (
                'Add Pin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinModal;