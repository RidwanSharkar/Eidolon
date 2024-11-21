import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface SwordProps {
  isSwinging: boolean;
  onSwingComplete: () => void;
}

export default function Sword({ isSwinging, onSwingComplete }: SwordProps) {
  const swordRef = useRef<Mesh>(null);
  const swingProgress = useRef(0);
  
  useFrame((_, delta) => {
    if (isSwinging && swordRef.current) {
      swingProgress.current += delta * 5; // Control swing speed
      
      // Swing animation
      swordRef.current.rotation.x = Math.sin(swingProgress.current) * Math.PI / 2;
      
      // Complete swing
      if (swingProgress.current >= Math.PI) {
        swingProgress.current = 0;
        onSwingComplete();
      }
    }
  });

  return (
    <mesh ref={swordRef} position={[0.7, 0, 0]} rotation={[0, 0, 0]}>
      {/* Sword handle */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      {/* Sword blade */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="silver" />
      </mesh>
    </mesh>
  );
}
