import { useRef, useEffect } from 'react';
import { Group, Vector3 } from 'three';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface EtherealBowProps {
  position: Vector3;
  direction: Vector3;
  chargeProgress: number;
  isCharging: boolean;
  onRelease: (power: number) => void;
}

export default function EtherealBow({ position, direction, chargeProgress, isCharging, onRelease }: EtherealBowProps) {
  const bowRef = useRef<Group>(null);
  const maxDrawDistance = 2;
  const prevIsCharging = useRef(isCharging);
  
  useEffect(() => {
    if (bowRef.current) {
      const angle = Math.atan2(direction.x, direction.z);
      bowRef.current.rotation.y = angle;
    }
  }, [direction]);

  // Check for charge release
  useFrame(() => {
    // If we were charging but now we're not, trigger release
    if (prevIsCharging.current && !isCharging) {
      onRelease(chargeProgress);
    }
    prevIsCharging.current = isCharging;
  });

  // Create the bow curve
  const createBowCurve = () => {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.3, 0, 0),
      new THREE.Vector3(-0.4, 0.5, 0),
      new THREE.Vector3(0.4, 0.5, 0),
      new THREE.Vector3(0.3, 0, 0)
    );
    return curve;
  };

  // Create the string curve based on draw
  const createStringCurve = (drawAmount: number) => {
    const pullback = drawAmount * maxDrawDistance;
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.3, 0, 0),
      new THREE.Vector3(0, -0.1, -pullback),
      new THREE.Vector3(0, 0.1, -pullback),
      new THREE.Vector3(0.3, 0, 0)
    );
    return curve;
  };

  return (
    <group ref={bowRef} position={position.toArray()}>
      {/* Bow frame */}
      <mesh>
        <tubeGeometry args={[createBowCurve(), 64, 0.02, 8, false]} />
        <meshStandardMaterial 
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Bow string */}
      <mesh>
        <tubeGeometry args={[createStringCurve(chargeProgress), 32, 0.005, 8, false]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={4}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Arrow */}
      {isCharging && (
        <group position={[0, 0, -chargeProgress * maxDrawDistance]}>
          <mesh>
            <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
            <meshStandardMaterial 
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={3}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Arrow head */}
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.03, 0.1, 8]} />
            <meshStandardMaterial 
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={3}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      )}

      {/* Charge indicator line */}
      {isCharging && (
        <mesh>
          <tubeGeometry args={[
            new THREE.LineCurve3(
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0, 0, 10)
            ),
            64,
            0.01,
            8,
            false
          ]} />
          <meshStandardMaterial 
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
            transparent
            opacity={0.3 * chargeProgress}
          />
        </mesh>
      )}
    </group>
  );
} 