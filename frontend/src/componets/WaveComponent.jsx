import React from 'react'
import Wave from 'react-wavify'

const WaveComponent = () => {
  return (
    <div style={{ position: 'relative', height: '200px', width: '100%' }}>
      {/* Base orange wave */}
      <Wave
        fill="#f79902"
        paused={false}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1,
        }}
        options={{
          height: 20,
          amplitude: 20,
          speed: 0.15,
          points: 3,
        }}
      />

      {/* Blue wave with mask */}
      <Wave
        mask="url(#mask)"
        fill="#ffffff"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 2,
        }}
      >
        <defs>
          <linearGradient id="gradient" gradientTransform="rotate(90)">
            <stop offset="0" stopColor="white" />
            <stop offset="0.5" stopColor="black" />
          </linearGradient>
          <mask id="mask">
            <rect x="0" y="0" width="2000" height="200" fill="url(#gradient)" />
          </mask>
        </defs>
      </Wave>
    </div>
  )
}

export default WaveComponent
