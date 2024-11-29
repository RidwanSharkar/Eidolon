import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import CustomSkeleton from './CustomSkeleton';
import { Text } from '@react-three/drei';
import Billboard from '../UI/Billboard';
import { EnemyUnitProps } from '../../types/EnemyUnitProps';
import * as THREE from 'three';

const EnemyUnit: React.FC<EnemyUnitProps> = ({ id, initialPosition, health, maxHealth, onTakeDamage }) => {
  const groupRef = useRef<Group>(null);
  const [currentHealth, setCurrentHealth] = useState<number>(health);
  const [isDead, setIsDead] = useState<boolean>(false);

  // Sync currentHealth with health prop
  useEffect(() => {
    setCurrentHealth(health);
  }, [health]);

  // Handle taking damage
  const takeDamage = useCallback(
    (damage: number) => {
      if (!isDead) {
        onTakeDamage(id, damage);
        setCurrentHealth((prev) => Math.max(prev - damage, 0));
      }
    },
    [id, onTakeDamage, isDead]
  );

  // Update health and handle death
  useEffect(() => {
    if (currentHealth <= 0 && !isDead) {
      setIsDead(true);
      // Additional logic like playing a death animation can be added here
    }
  }, [currentHealth, isDead]);

  // Example: Simulate taking damage via an external trigger (e.g., a weapon hit)
  useEffect(() => {
    // Replace this with actual interaction logic (e.g., collision detection)
    // For demonstration, we'll simulate taking damage when a certain condition is met
    const handleDamageTrigger = (event: CustomEvent) => {
      if (event.detail.targetId === id) {
        takeDamage(event.detail.damage);
      }
    };

    // Listen for a custom event to trigger damage
    window.addEventListener('enemyAttack', handleDamageTrigger as EventListener);

    return () => {
      window.removeEventListener('enemyAttack', handleDamageTrigger as EventListener);
    };
  }, [takeDamage, id]);

  // Animation for just the skeleton
  useFrame(() => {
    if (groupRef.current) {
      // Only rotate the skeleton mesh, not the health bar
      const skeletonMesh = groupRef.current.children[0];
      if (skeletonMesh) {
        skeletonMesh.rotation.y += 0.01;
      }
    }
  });

  if (isDead) {
    return null;
  }

  return (
    // Separate container for position
    <group position={initialPosition.toArray()}>
      {/* Rotating skeleton group */}
      <group ref={groupRef}>
        <CustomSkeleton 
          position={[0, 0, 0]}
          isAttacking={false} 
          isWalking={true} 
        />
      </group>
      
      {/* HP Bar - outside the rotating group */}
      <Billboard
        position={[0, 3.0, 0]}
        lockX={true}
        lockY={true}
        lockZ={true}
      >
        {/* Background bar */}
        <mesh>
          <planeGeometry args={[1.5, 0.2]} />
          <meshBasicMaterial color="#333333" opacity={0.8} transparent side={THREE.DoubleSide} />
        </mesh>
        {/* Health bar */}
        <mesh position={[-0.75 + (currentHealth / maxHealth) * 0.75, 0, 0.001]}>
          <planeGeometry args={[(currentHealth / maxHealth) * 1.5, 0.18]} />
          <meshBasicMaterial color="#ff3333" opacity={0.9} transparent side={THREE.DoubleSide} />
        </mesh>
        {/* Health text */}
        <Text
          position={[0, 0, 0.002]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          renderOrder={1}
        >
          {`${currentHealth}/${maxHealth}`}
        </Text>
      </Billboard>
    </group>
  );
}

export default EnemyUnit; 