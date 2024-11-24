import { useRef, useEffect } from 'react';
import { Group, Vector3 } from 'three';
import { Billboard } from '@react-three/drei';

interface TrainingDummyProps {
  position: Vector3;
  health: number;
  maxHealth: number;
  onHit: () => void;
}

export default function TrainingDummy({ position, health, maxHealth, onHit }: TrainingDummyProps) {
  const dummyRef = useRef<Group>(null);
  const regenerationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle health regeneration
  useEffect(() => {
    if (health === 0) {
      // Clear any existing timeout
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }

      // Set new timeout for health regeneration
      regenerationTimeoutRef.current = setTimeout(() => {
        onHit(); // Use this to reset health to max in the parent component
      }, 5000); // 5 seconds
    }

    // Cleanup timeout on unmount or when health changes
    return () => {
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
    };
  }, [health, onHit]);

  return (
    <group 
      ref={dummyRef} 
      position={position}
    >
      {/* Dummy body */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 2, 12]} />
        <meshStandardMaterial 
          color={health === 0 ? "#4a4a4a" : "#8b4513"} // Darker when "dead"
        />
      </mesh>
      
      {/* Dummy head */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial 
          color={health === 0 ? "#4a4a4a" : "#8b4513"} // Darker when "dead"
        />
      </mesh>

      {/* HP Bar */}
      <Billboard
        position={[0, 2.7, 0]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <mesh>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[-0.5 + (health / maxHealth) * 0.5, 0, 0.001]}>
          <planeGeometry args={[(health / maxHealth), 0.08]} />
          <meshBasicMaterial color="#ff3333" />
        </mesh>
      </Billboard>
    </group>
  );
}