import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface ScytheProps {
  isSwinging: boolean;
  onSwingComplete: () => void;
}

export default function Scythe({ isSwinging, onSwingComplete }: ScytheProps) {
  const scytheRef = useRef<Mesh>(null);
  const swingProgress = useRef(0);
  
  useFrame((_, delta) => {
    if (isSwinging && scytheRef.current) {
      swingProgress.current += delta * 5;
      
      // Horizontal swing animation
      scytheRef.current.rotation.y = Math.sin(swingProgress.current) * Math.PI / 1.5;
      
      if (swingProgress.current >= Math.PI) {
        swingProgress.current = 0;
        onSwingComplete();
      }
    }
  });

  return (
    <mesh ref={scytheRef} position={[0.7, 0.5, 0]} rotation={[0, 0, 0]}>
      {/* Handle */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color="#4a2105" />
      </mesh>
      
      {/* Blade */}
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.6, 0.01, 1.2, 16, 1, true]} />
        <meshStandardMaterial color="#silver" metalness={0.8} roughness={0.2} />
      </mesh>
    </mesh>
  );
}