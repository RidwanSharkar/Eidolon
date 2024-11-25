import React from 'react';

const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.3} />

      <directionalLight
        position={[5, 10, 7.5]}
        intensity={0.5}
        color="#fc9f82" // Sunset color
      />

      <hemisphereLight
        color="#de6795"
        groundColor="#2a2a2a"
        intensity={0.6}
        position={[0, 50, 0]}
      />
    </>
  );
};

export default Lights; 