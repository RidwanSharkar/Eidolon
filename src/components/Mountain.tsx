import React, { useRef, useEffect } from 'react';
import { Mesh, Vector3 } from 'three';


interface MountainProps {
  position: Vector3;
  scale?: number;
  isInteractive?: boolean;
  health?: number;
}

const Mountain: React.FC<MountainProps> = ({ position, scale = 1, isInteractive = false, health = 100 }) => {
  const mountainRef = useRef<Mesh>(null);

  useEffect(() => {
    if (isInteractive && health <= 0 && mountainRef.current) {
      mountainRef.current.parent?.remove(mountainRef.current);
    }
  }, [health, isInteractive]);

  if (isInteractive && health <= 0) return null;

  return (
    <group name="mountain" position={position} scale={scale}>
      <mesh ref={mountainRef} castShadow receiveShadow>
        <coneGeometry args={[7.5, 35, 48]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          metalness={0.2}
          roughness={0.8}
          emissive="#000000"
        />
      </mesh>
    </group>
  );
};

export default Mountain;