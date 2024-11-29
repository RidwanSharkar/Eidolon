import { useRef } from 'react';
import { Group, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { WeaponType } from '../../types/weapons';

interface SmiteProps {
  weaponType: WeaponType;
  position: Vector3;
  onComplete: () => void;
}

export default function Smite({ position, onComplete }: SmiteProps) {
  const lightningRef = useRef<Group>(null);
  const progressRef = useRef(0);
  const animationDuration = 1.0; // Fixed animation duration (in seconds)
  const delayTimer = useRef(0);
  const startDelay = 0.25; // Same initial delay

  useFrame((_, delta) => {
    if (!lightningRef.current) return;

    // Handle delay before starting the lightning effect
    if (delayTimer.current < startDelay) {
      delayTimer.current += delta;
      return;
    }

    progressRef.current += delta;
    const progress = Math.min(progressRef.current / animationDuration, 1);

    // Animate the lightning bolt
    if (progress < 1) {
      // Start from high up and strike down
      const startY = 20;
      const currentY = startY * (1 - progress);
      lightningRef.current.position.y = currentY;

      // Adjust scale effect
      const scale = progress < 0.9 ? 1 : 1 - (progress - 0.9) / 0.1;
      lightningRef.current.scale.set(scale, scale, scale);
    } else {
      onComplete();
    }
  });

  return (
    <group
      ref={lightningRef}
      position={[position.x, 25, position.z]}
      visible={delayTimer.current >= startDelay}
    >
      {/* Core lightning bolt */}
      <mesh>
        <cylinderGeometry args={[0.35, 0.35, 20, 16]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff4400"
          emissiveIntensity={15}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <cylinderGeometry args={[0.7, 0.7, 20, 16]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff4400"
          emissiveIntensity={10}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <cylinderGeometry args={[1.0, 1.0, 20, 16]} />
        <meshStandardMaterial
          color="#ff8800"
          emissive="#ff6600"
          emissiveIntensity={8}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Spiral effect */}
      {[...Array(3)].map((_, i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 1.5, 0]}>
          <torusGeometry args={[1.2, 0.08, 8, 32]} />
          <meshStandardMaterial
            color="#ff6600"
            emissive="#ff4400"
            emissiveIntensity={8}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI) / 4) * 1.0,
            (i - 4) * 2,
            Math.sin((i * Math.PI) / 4) * 1.0,
          ]}
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial
            color="#ff6600"
            emissive="#ff4400"
            emissiveIntensity={12}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* Enhanced impact point glow */}
      <pointLight position={[0, -10, 0]} color="#ff4400" intensity={25} distance={12} />

      {/* Additional ambient glow */}
      <pointLight position={[0, 0, 0]} color="#ff6600" intensity={15} distance={6} />
    </group>
  );
}