import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Color } from 'three';
import * as THREE from 'three';

interface GhostTrailProps {
  parentRef: React.RefObject<THREE.Group>;
}

export default function GhostTrail({ parentRef }: GhostTrailProps) {
  const trailsRef = useRef<Mesh[]>([]);
  const positions = useRef<Vector3[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const trailCount = 12;
  
  useEffect(() => {
    if (parentRef.current) {
      // Initialize with parent's position instead of (0,0,0)
      const initialPos = parentRef.current.position.clone();
      positions.current = Array(trailCount).fill(0).map(() => initialPos.clone());
      setIsInitialized(true);
    }
  }, []);

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
        const scale = 1 - (i / trailCount) * 0.3;
        trail.scale.setScalar(scale);
        
        if (trail.material && trail.material instanceof THREE.MeshBasicMaterial) {
          trail.material.opacity = (1 - i / trailCount) * 0.3;
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
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial
            color={new Color('#39ff14')}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
} 