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
      <cylinderGeometry args={[0.03, 0.015, 0.3, 8]} />
      <meshStandardMaterial 
        color="#67f2b9"
        transparent
        opacity={0.5}
        emissive="#67f2b9"
        emissiveIntensity={0.5}
      />
    </mesh>
  </group>
);

export default function BoneVortex({ position, onComplete }: BoneVortexProps) {
  const segmentsRef = useRef<Mesh[]>([]);
  const layerCount = 12;
  const segmentsPerLayer = 8;
  const maxRadius = 1.2;
  const height = 3;
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
      const radius = maxRadius * layerProgress * radiusMultiplier;
      
      const rotationSpeed = 0.006 * (1 + layerProgress * 3);
      const baseAngle = (i % segmentsPerLayer) / segmentsPerLayer * Math.PI * 2;
      const angle = baseAngle + elapsed * rotationSpeed;
      
      const spiralTightness = 2;
      const x = Math.cos(angle + layerProgress * spiralTightness) * radius;
      const z = Math.sin(angle + layerProgress * spiralTightness) * radius;
      const y = (1 - layerProgress) * height * (1 + Math.sin(elapsed * 0.002) * 0.1);
      
      segment.position.set(x, y, z);
      
      segment.rotation.y = angle + Math.PI / 2;
      segment.rotation.z = Math.PI / 2 + layerProgress * 0.8;
      segment.rotation.x = Math.sin(elapsed * 0.004 + i) * 0.2;
      
      const material = segment.material as THREE.MeshStandardMaterial;
      material.opacity = Math.max(0, 0.7 - layerProgress * 0.4 - (progress > 0.7 ? (progress - 0.7) * 3 : 0));
      material.emissiveIntensity = 0.5 + Math.sin(elapsed * 0.004 + i) * 0.3;
      
      const scale = 1 + Math.sin(elapsed * 0.003 + i * 0.5) * 0.2;
      segment.scale.set(scale, scale, scale);
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