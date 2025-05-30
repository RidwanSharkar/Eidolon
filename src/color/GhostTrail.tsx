import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Color } from 'three';
import * as THREE from 'three';
import { WeaponType } from '../Weapons/weapons';

interface GhostTrailProps {
  parentRef: React.RefObject<THREE.Group>;
  weaponType: WeaponType;
}

export default function GhostTrail({ parentRef, weaponType }: GhostTrailProps) {
  const trailsRef = useRef<Mesh[]>([]);
  const positions = useRef<Vector3[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const trailCount = 30;
  
  useEffect(() => {
    if (parentRef.current) {
      // Initialize with parent's position 
      const initialPos = parentRef.current.position.clone();
      positions.current = Array(trailCount).fill(0).map(() => initialPos.clone());
      setIsInitialized(true);
    }
  }, [ parentRef ])

  const getTrailColor = () => {
    switch (weaponType) {
      case WeaponType.SCYTHE:
        return '#00FF37'; // 39ff14
      case WeaponType.SWORD:
        return '#FFB300'; // <--FFB300   FFD500 GOLDER F9A602 YELLOWER <--- 8783D1 FF9441
      case WeaponType.SABRES:
        return '#00BFFF'; //78DFFF
      case WeaponType.SPEAR:
        return '#FF544E'; // FF544E
      case WeaponType.BOW:
        return '#3A905E'; //D09A1D try 
    }
  };
  useFrame(() => {
    if (!parentRef.current || !isInitialized) return;

    // Update position history
    const newPos = parentRef.current.position.clone();
    positions.current.unshift(newPos);
    positions.current = positions.current.slice(0, trailCount);

    // Update trail meshes
    trailsRef.current.forEach((trail, i) => {
      if (trail && positions.current[i]) {
        trail.position.copy(positions.current[i]);
        
        // Scale and opacity based on trail position
        const scale = 1 - (i / trailCount) * 0.6;
        trail.scale.setScalar(scale);
        
        if (trail.material && trail.material instanceof THREE.MeshBasicMaterial) {
          trail.material.opacity = (1 - i / trailCount) * 0.2;
        }
      }
    });
  });

  // Only render trails after initialization
  if (!isInitialized) return null;

  return (
    <>
      {Array.from({ length: trailCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) trailsRef.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.43, 32, 32]} />
          <meshBasicMaterial
            color={new Color(getTrailColor())}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
} 