// src/components/Environment/Mushroom.tsx
import React, { useRef, useMemo } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MushroomProps {
  position: THREE.Vector3;
  scale: number;
}

const Mushroom: React.FC<MushroomProps> = ({ position, scale }) => {
  const mushroomRef = useRef<Mesh>(null!);
  const mushroomColor = useMemo(() => new THREE.Color("#A8DBFF"), []);
  const spotColor = useMemo(() => new THREE.Color("#9b4f96"), []); // Purple spot color

  useFrame((state) => {
    if (mushroomRef.current) {
      mushroomRef.current.position.y = position.y + Math.sin(state.clock.getElapsedTime()) * 0.05;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Stem */}
      <mesh ref={mushroomRef}>
        <cylinderGeometry args={[0.1, 0.12, 0.8, 16]} />
        <meshStandardMaterial 
          color={mushroomColor.clone().multiplyScalar(0.9)}
          roughness={0.4}
          metalness={0.1}
          emissive={mushroomColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Cap */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color={mushroomColor}
          roughness={0.4}
          metalness={0.1}
          emissive={mushroomColor}
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Spots */}
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.sin(i * Math.PI / 3) * 0.15,
            0.3,
            Math.cos(i * Math.PI / 3) * 0.15
          ]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial 
            color={spotColor}
            emissive={spotColor}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Mushroom;
export type { MushroomProps };