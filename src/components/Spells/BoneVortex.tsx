import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface WindVortexProps {
  parentRef: React.RefObject<Group>;
}

const createVortexSegment = () => (
  <group>
    {/* Main vortex segment */}
    <mesh>
      <cylinderGeometry args={[0.02, 0.01, 0.25, 8]} />
      <meshStandardMaterial 
        color="#ffffff"
        transparent
        opacity={0.5}
        emissive="#00aaff"
        emissiveIntensity={0.3}
      />
    </mesh>
  </group>
);

export default function WindVortex({ parentRef }: WindVortexProps) {
  const segmentsRef = useRef<Mesh[]>([]);
  const layerCount = 8;
  const segmentsPerLayer = 6;
  const maxRadius = 0.8;
  const height = 1;
  const groupRef = useRef<Group>(null);
  
  useFrame(() => {
    if (!parentRef.current || !groupRef.current) return;
    
    const parentPosition = parentRef.current.position;
    groupRef.current.position.set(parentPosition.x, 0, parentPosition.z);
    
    segmentsRef.current.forEach((segment, i) => {
      const layer = Math.floor(i / segmentsPerLayer);
      const layerProgress = layer / (layerCount - 1);
      
      // Calculate radius that decreases as we go up
      const radius = maxRadius * (1 - layerProgress * 0.7);
      
      // Rotation speed increases with height
      const rotationSpeed = 0.002 * (1 + layerProgress);
      const baseAngle = (i % segmentsPerLayer) / segmentsPerLayer * Math.PI * 2;
      const angle = baseAngle + Date.now() * rotationSpeed;
      
      // Position
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = layerProgress * height;
      
      segment.position.set(x, y, z);
      
      // Rotation to follow the vortex
      segment.rotation.y = angle + Math.PI / 2;
      segment.rotation.z = Math.PI / 2 - layerProgress * 0.5;
      
      // Add some wobble
      segment.rotation.x = Math.sin(Date.now() * 0.003 + i) * 0.1;
      
      // Adjust opacity based on height
      const material = segment.material as THREE.MeshStandardMaterial;
      material.opacity = 0.5 - layerProgress * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: layerCount * segmentsPerLayer }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) segmentsRef.current[i] = el;
          }}
        >
          {createVortexSegment()}
        </mesh>
      ))}
    </group>
  );
} 