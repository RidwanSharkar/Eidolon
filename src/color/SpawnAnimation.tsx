import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, Vector3 } from 'three';
import * as THREE from 'three';

interface BoneVortexProps {
  position: Vector3;
  onComplete?: () => void;
  isSpawning?: boolean;
  scale?: number;
}

const createVortexSegment = () => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.03, 0.025, 0.3, 8]} />
      <meshStandardMaterial 
        color="#E13F3F" // FF6AAA 91FF5E FF3B6C FF4271
        transparent
        opacity={0.55}
        emissive="#F33FAE"
        emissiveIntensity={0.75}
      />
    </mesh>
  </group>
);

export default function BoneVortex2({ position, onComplete, isSpawning = false, scale = 1 }: BoneVortexProps) {
    const segmentsRef = useRef<Mesh[]>([]);
    const layerCount = 12;
    const segmentsPerLayer = 10;
    const maxRadius = 1.15 * scale;
    const height = 2.75 * scale;
    const groupRef = useRef<Group>(null);
    const startTime = useRef(Date.now());
    const animationDuration = 1500;
    
    useFrame(() => {
      if (!groupRef.current) return;
      
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      const effectiveProgress = isSpawning ? 1 - progress : progress;
      
      groupRef.current.position.copy(position);
      
      segmentsRef.current.forEach((segment, i) => {
        const layer = Math.floor(i / segmentsPerLayer);
        const layerProgress = layer / (layerCount - 1);
        
        const radiusMultiplier = effectiveProgress < 0.5 
          ? effectiveProgress * 2 
          : 2 - (effectiveProgress * 2);
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
        material.opacity = Math.max(0, 0.7 - layerProgress * 0.4 - (effectiveProgress > 0.7 ? (effectiveProgress - 0.7) * 3 : 0));
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