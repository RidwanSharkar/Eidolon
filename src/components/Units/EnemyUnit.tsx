import React, { useRef, useEffect } from 'react';
import { Group, Vector3 } from 'three';
import { Billboard, Text } from '@react-three/drei';
import CustomSkeleton from './CustomSkeleton';

interface EnemyUnitProps {
  id: string;
  initialPosition: Vector3;
  health: number;
  maxHealth: number;
  onTakeDamage: (id: string, damage: number) => void;
}

export default function EnemyUnit({ id, initialPosition, health, maxHealth, onTakeDamage }: EnemyUnitProps) {
  const enemyRef = useRef<Group>(null);
  const regenerationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Regeneration logic
  useEffect(() => {
    console.log(`Enemy ${id} Health: ${health}`);
    
    // Clear any existing timeout
    if (regenerationTimeoutRef.current) {
      clearTimeout(regenerationTimeoutRef.current);
      regenerationTimeoutRef.current = null;
    }

    // Set up regeneration when health hits 0
    if (health === 0) {
      console.log(`Setting up regeneration timer for ${id}...`);
      regenerationTimeoutRef.current = setTimeout(() => {
        console.log(`Regenerating enemy ${id}...`);
        onTakeDamage(id, 0); // Reset health by passing 0 damage
      }, 5000); // 5-second delay before regeneration
    }

    // Cleanup on unmount
    return () => {
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
    };
  }, [health, onTakeDamage, id]);

  return (
    <group 
      ref={enemyRef} 
      position={initialPosition.toArray()}
    >
      {/* Skeleton Model */}
      <CustomSkeleton 
        position={[0, 0, 0]}
        isAttacking={false}
        isWalking={true}
      />

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