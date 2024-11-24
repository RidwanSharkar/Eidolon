import { useRef } from 'react';
import { Group, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';

interface SmiteProps {
  position: Vector3;
  onComplete: () => void;
}

export default function Smite({ position, onComplete }: SmiteProps) {
  const lightningRef = useRef<Group>(null);
  const progressRef = useRef(0);
  const duration = 1.0; // Increased from 0.7 to 1.0 seconds
  const delayTimer = useRef(0);
  const startDelay = 0.25; // Keep the same delay

  useFrame((_, delta) => {
    if (!lightningRef.current) return;

    // Handle delay before starting the lightning effect
    if (delayTimer.current < startDelay) {
      delayTimer.current += delta;
      return;
    }

    progressRef.current += delta;
    const progress = Math.min(progressRef.current / duration, 1);

    // Animate the lightning bolt
    if (progress < 1) {
      // Start from high up and strike down
      const startY = 20;
      const currentY = startY * (1 - progress);
      lightningRef.current.position.y = currentY;
      
      // Adjusted scale effect to last longer
      const scale = progress < 0.9 ? 1 : 1 - (progress - 0.9) / 0.1;
      lightningRef.current.scale.set(scale, scale, scale);
    } else {
      onComplete();
    }
  });

  return (
    <group ref={lightningRef} position={[position.x, 25, position.z]} visible={delayTimer.current >= startDelay}>
      {/* Core lightning bolt - increased width */}
      <mesh>
        <cylinderGeometry args={[0.35, 0.35, 20, 16]} /> {/* Increased from 0.2 to 0.35 */}
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffdb4d"
          emissiveIntensity={10}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Inner glow - increased width */}
      <mesh>
        <cylinderGeometry args={[0.7, 0.7, 20, 16]} /> {/* Increased from 0.4 to 0.7 */}
        <meshStandardMaterial
          color="#ffdb4d"
          emissive="#ffdb4d"
          emissiveIntensity={6}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Outer glow - increased width */}
      <mesh>
        <cylinderGeometry args={[1.0, 1.0, 20, 16]} /> {/* Increased from 0.6 to 1.0 */}
        <meshStandardMaterial
          color="#fff5cc"
          emissive="#fff5cc"
          emissiveIntensity={4}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Spiral effect - increased radius */}
      {[...Array(3)].map((_, i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 1.5, 0]}>
          <torusGeometry args={[1.2, 0.08, 8, 32]} /> {/* Increased from 0.8 to 1.2, thickness from 0.05 to 0.08 */}
          <meshStandardMaterial
            color="#ffff00"
            emissive="#ffff00"
            emissiveIntensity={5}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}

      {/* Floating particles - increased spread */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 4) * 1.0, // Increased radius from 0.7 to 1.0
          (i - 4) * 2,
          Math.sin(i * Math.PI / 4) * 1.0  // Increased radius from 0.7 to 1.0
        ]}>
          <sphereGeometry args={[0.15, 8, 8]} /> {/* Increased from 0.1 to 0.15 */}
          <meshStandardMaterial
            color="#ffff00"
            emissive="#ffff00"
            emissiveIntensity={8}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* Enhanced impact point glow - increased range */}
      <pointLight
        position={[0, -10, 0]}
        color="#ffdb4d"
        intensity={20}
        distance={12} // Increased from 8 to 12
      />
      
      {/* Additional ambient glow - increased range */}
      <pointLight
        position={[0, 0, 0]}
        color="#fff5cc"
        intensity={10}
        distance={6} // Increased from 4 to 6
      />
    </group>
  );
}