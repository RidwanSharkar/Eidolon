// src/components/Environment/Mushroom.tsx
import React, { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MushroomProps {
  position: THREE.Vector3;
  scale: number;
}

const Mushroom: React.FC<MushroomProps> = ({ position, scale }) => {
  const mushroomRef = useRef<Mesh>(null!);

  // Slight animation (bobbing)
  useFrame((state) => {
    if (mushroomRef.current) {
      mushroomRef.current.position.y = position.y + Math.sin(state.clock.getElapsedTime()) * 0.05;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Stem */}
      <mesh ref={mushroomRef}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
        <meshStandardMaterial color="#d66a95" />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.35, 0]}>
        <coneGeometry args={[0.2, 0.3, 16]} />
        <meshStandardMaterial color="#d66a95" />
      </mesh>
    </group>
  );
};

export default Mushroom;
export type { MushroomProps };