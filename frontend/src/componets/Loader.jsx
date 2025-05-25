import { Html, useProgress } from '@react-three/drei';
import React from 'react';

const Loader = () => {
  const { progress } = useProgress();

  return (
    <Html center>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Loading spinner */}
        <div className="canvas-load" style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        {/* Progress text */}
        <p
          style={{
            fontSize: 14,
            color: '#f1f1f1',
            fontWeight: 800,
            marginTop: 40
          }}
        >
          {progress.toFixed(2)}%
        </p>
      </div>
    </Html>
  );
};

// Add CSS for the spinner animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

export default Loader;
