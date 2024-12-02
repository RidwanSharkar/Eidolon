import React, { useRef, useState } from 'react';
import { Group, Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface CustomSkeletonProps {
  position: [number, number, number];
  isAttacking: boolean;
  isWalking: boolean;
}

export default function CustomSkeleton({ position, isAttacking, isWalking }: CustomSkeletonProps) {
  const groupRef = useRef<Group>(null);
  const [walkCycle, setWalkCycle] = useState(0);
  const [attackCycle, setAttackCycle] = useState(0);

  // Animation settings
  const walkSpeed = 2; // Controls the speed of the walking animation
  const attackSpeed = 5; // Controls the speed of the attack animation

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Walking Animation
    if (isWalking) {
      setWalkCycle((prev) => (prev + delta * walkSpeed) % (Math.PI * 2));
      const angle = Math.sin(walkCycle) * 0.5;

      // Animate Left Arm
      const leftArm = groupRef.current.getObjectByName('LeftArm') as Mesh;
      if (leftArm) {
        leftArm.rotation.x = angle;
      }

      // Animate Right Arm
      const rightArm = groupRef.current.getObjectByName('RightArm') as Mesh;
      if (rightArm) {
        rightArm.rotation.x = -angle;
      }

      // Animate Left Leg
      const leftLeg = groupRef.current.getObjectByName('LeftLeg') as Mesh;
      if (leftLeg) {
        leftLeg.rotation.x = -angle;
      }

      // Animate Right Leg
      const rightLeg = groupRef.current.getObjectByName('RightLeg') as Mesh;
      if (rightLeg) {
        rightLeg.rotation.x = angle;
      }
    }

    // Attack Animation
    if (isAttacking) {
      setAttackCycle((prev) => prev + delta * attackSpeed);
      const progress = Math.min(attackCycle, Math.PI / 2);
      const armAngle = Math.sin(progress) * Math.PI / 4;

      // Animate Right Arm for Attack
      const rightArm = groupRef.current.getObjectByName('RightArm') as Mesh;
      if (rightArm) {
        rightArm.rotation.x = -armAngle;
      }

      if (attackCycle > Math.PI / 2) {
        // Reset after attack
        setAttackCycle(0);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh name="Body" position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2, 32]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Head */}
      <mesh name="Head" position={[0, 2, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Left Arm */}
      <mesh name="LeftArm" position={[-0.4, 1.5, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1, 32]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      {/* Right Arm */}
      <mesh name="RightArm" position={[0.4, 1.5, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1, 32]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      {/* Left Leg */}
      <mesh name="LeftLeg" position={[-0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1, 32]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      {/* Right Leg */}
      <mesh name="RightLeg" position={[0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1, 32]} />
        <meshStandardMaterial color="#777777" />
      </mesh>
    </group>
  );
} 