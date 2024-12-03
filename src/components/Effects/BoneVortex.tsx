import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, Vector3 } from 'three';
import * as THREE from 'three';

interface BoneVortexProps {
  position: Vector3;
  onComplete?: () => void;
}

const createVortexSegment = () => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.02, 0.01, 0.25, 8]} />
      <meshStandardMaterial 
        color="#67f2b9"
        transparent
        opacity={0.5}
        emissive="#67f2b9"
        emissiveIntensity={0.3}
      />
    </mesh>
  </group>
);

export default function BoneVortex({ position, onComplete }: BoneVortexProps) {
  const segmentsRef = useRef<Mesh[]>([]);
  const layerCount = 8;
  const segmentsPerLayer = 6;
  const maxRadius = 0.8;
  const height = 2;
  const groupRef = useRef<Group>(null);
  const startTime = useRef(Date.now());
  const animationDuration = 1500;
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / animationDuration, 1);
    
    groupRef.current.position.copy(position);
    
    segmentsRef.current.forEach((segment, i) => {
      const layer = Math.floor(i / segmentsPerLayer);
      const layerProgress = layer / (layerCount - 1);
      
      const radiusMultiplier = progress < 0.5 
        ? progress * 2 
        : 2 - (progress * 2);
      const radius = maxRadius * (1 - layerProgress * 0.7) * radiusMultiplier;
      
      const rotationSpeed = 0.004 * (1 + progress * 2);
      const baseAngle = (i % segmentsPerLayer) / segmentsPerLayer * Math.PI * 2;
      const angle = baseAngle + elapsed * rotationSpeed;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = layerProgress * height + (progress * 2);
      
      segment.position.set(x, y, z);
      segment.rotation.y = angle + Math.PI / 2;
      segment.rotation.z = Math.PI / 2 - layerProgress * 0.5;
      segment.rotation.x = Math.sin(elapsed * 0.003 + i) * 0.1;
      
      const material = segment.material as THREE.MeshStandardMaterial;
      material.opacity = Math.max(0, 0.5 - layerProgress * 0.3 - (progress > 0.7 ? (progress - 0.7) * 3 : 0));
    });

    if (progress === 1 && onComplete) {
      onComplete();
    }
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