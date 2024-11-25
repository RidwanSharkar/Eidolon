import React from 'react';
import * as THREE from 'three';

const Planet: React.FC = () => {
  return (
    <group position={[100, 80, -150]} scale={[30, 30, 30]}>
      {/* Main planet sphere */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#B8E0D2"
          roughness={0.7}
          metalness={0.2}
          emissive="#B8E0D2"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#4dff90"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Outer glow */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#4dff90"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light for additional glow effect */}
      <pointLight
        color="#4dff90"
        intensity={2}
        distance={50}
      />
    </group>
  );
};

export default Planet; 