const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16'
  };

  const spinnerStyle = {
    width: size === 'sm' ? '24px' : size === 'lg' ? '64px' : '40px',
    height: size === 'sm' ? '24px' : size === 'lg' ? '64px' : '40px'
  };

  return (
    <div className="loading-spinner">
      <div className="flex flex-col items-center gap-4">
        <div 
          className="spinner"
          style={spinnerStyle}
          aria-label="Loading"
        />
        {text && (
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)'
          }}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;