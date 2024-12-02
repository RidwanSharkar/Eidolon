import React, { useRef, useEffect, useState } from 'react';
import { Group, Vector3 } from 'three';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import CustomSkeleton from './CustomSkeleton';

interface EnemyUnitProps {
  id: string;
  initialPosition: Vector3;
  health: number;
  maxHealth: number;
  onTakeDamage: (id: string, damage: number) => void;
  onRegenerate: (id: string) => void;
  playerPosition: Vector3;
  onAttackPlayer: (damage: number) => void;
}

export default function EnemyUnit({
  id,
  initialPosition,
  health,
  maxHealth,
  onRegenerate,
  playerPosition,
  onAttackPlayer,
}: EnemyUnitProps) {
  const enemyRef = useRef<Group>(null);
  const regenerationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAttackTime = useRef<number>(0);
  const [isAttacking, setIsAttacking] = useState(false);

  const ATTACK_RANGE = 2;
  const ATTACK_COOLDOWN = 2000;
  const MOVEMENT_SPEED = 0.02;
  const ATTACK_DAMAGE = 5;

  // Regeneration logic with cleanup
  useEffect(() => {
    console.log(`EnemyUnit ${id} Health: ${health}`);

    // Clear any existing timeout when health changes
    if (regenerationTimeoutRef.current) {
      clearTimeout(regenerationTimeoutRef.current);
      regenerationTimeoutRef.current = null;
    }

    // Only set up regeneration when health is exactly 0
    if (health === 0) {
      console.log(`Setting up regeneration for skeleton ${id}`);
      regenerationTimeoutRef.current = setTimeout(() => {
        console.log(`Regenerating skeleton ${id}`);
        onRegenerate(id);
      }, 5000);
    }

    // Cleanup on unmount or health change
    return () => {
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
    };
  }, [health, onRegenerate, id]);

  // Set initial position once
  useEffect(() => {
    if (enemyRef.current) {
      enemyRef.current.position.copy(initialPosition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once

  useFrame(() => {
    if (!enemyRef.current || health <= 0 || !playerPosition) return;

    const direction = new Vector3()
      .subVectors(playerPosition, enemyRef.current.position)
      .normalize();

    const distanceToPlayer = enemyRef.current.position.distanceTo(playerPosition);

    // Move towards player if not in attack range and not dead
    if (distanceToPlayer > ATTACK_RANGE && health > 0) {
      setIsAttacking(false);
      enemyRef.current.position.add(direction.multiplyScalar(MOVEMENT_SPEED));
      enemyRef.current.lookAt(playerPosition);
    } else if (health > 0) {
      // Attack logic - only if alive
      const currentTime = Date.now();
      if (currentTime - lastAttackTime.current >= ATTACK_COOLDOWN) {
        setIsAttacking(true);
        onAttackPlayer(ATTACK_DAMAGE);
        lastAttackTime.current = currentTime;

        // Reset attack animation after a short delay
        setTimeout(() => setIsAttacking(false), 500);
      }
    }
  });

  return (
    <group ref={enemyRef} visible={health > 0}>
      <CustomSkeleton
        position={[0, 0, 0]}
        isAttacking={isAttacking}
        isWalking={!isAttacking && health > 0}
      />

      <Billboard position={[0, 3.0, 0]} lockX={false} lockY={false} lockZ={false}>
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