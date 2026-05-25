const LoadingSpinner = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
      <div 
        style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid var(--primary-light)', 
          borderTopColor: 'var(--primary)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} 
      />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
