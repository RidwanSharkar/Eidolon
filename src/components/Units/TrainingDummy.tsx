import React, { useRef, useEffect } from 'react';
import { Group, Vector3 } from 'three';
import { Billboard, Text } from '@react-three/drei';

interface TrainingDummyProps {
  id: 'dummy1' | 'dummy2';
  position: Vector3;
  health: number;
  maxHealth: number;
  onHit: () => void;
}

export default function TrainingDummy({ id, position, health, maxHealth, onHit }: TrainingDummyProps) {
  const dummyRef = useRef<Group>(null);
  const regenerationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Regeneration logic
  useEffect(() => {
    console.log(`TrainingDummy ${id} Health: ${health}`);
    
    // Clear any existing timeout
    if (regenerationTimeoutRef.current) {
      clearTimeout(regenerationTimeoutRef.current);
      regenerationTimeoutRef.current = null;
    }

    // Set up regeneration when health hits 0
    if (health === 0) {
      console.log(`Setting up regeneration timer for ${id}...`);
      regenerationTimeoutRef.current = setTimeout(() => {
        console.log(`Regenerating dummy ${id}...`);
        onHit(); // Reset health in Scene.tsx
      }, 5000); // 5-second delay before regeneration
    }

    // Cleanup on unmount
    return () => {
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
    };
  }, [health, onHit, id]);

  return (
    <group 
      ref={dummyRef} 
      position={position.toArray()}
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
        position={[0, 3.0, 0]}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        {/* Background bar */}
        <mesh>
          <planeGeometry args={[1.5, 0.2]} />
          <meshBasicMaterial color="#333333" opacity={0.8} transparent />
        </mesh>
        {/* Health bar */}
        <mesh position={[-0.75 + (health / maxHealth) * 0.75, 0, 0.001]}>
          <planeGeometry args={[(health / maxHealth) * 1.5, 0.18]} />
          <meshBasicMaterial color="#ff3333" opacity={0.9} transparent />
        </mesh>
        {/* Health text */}
        <Text
          position={[0, 0, 0.002]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {`${health}/${maxHealth}`}
        </Text>
      </Billboard>
    </group>
  );
}