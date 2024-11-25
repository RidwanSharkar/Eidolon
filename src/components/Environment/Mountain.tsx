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
        <coneGeometry args={[23, 35, 6]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          metalness={0.1}
          roughness={0.9}
          emissive="#222222"
        />
      </mesh>
      <mesh position={[-4, -5, -2]} rotation={[0, 0.5, 0.1]} castShadow>
        <coneGeometry args={[24, 28, 5]} />
        <meshStandardMaterial 
          color="#252525"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      <mesh position={[0, 15, 0]} castShadow>
        <coneGeometry args={[5, 8, 6]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[-2, 10, -1]} rotation={[0.1, 0.3, 0.1]} castShadow>
        <coneGeometry args={[3, 6, 5]} />
        <meshStandardMaterial
          color="#f0f0f0"
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[3, 5, 2]} rotation={[0.2, -0.3, 0]} castShadow>
        <coneGeometry args={[6, 15, 4]} />
        <meshStandardMaterial
          color="#1f1f1f"
          metalness={0.2}
          roughness={1}
        />
      </mesh>
    </group>
  );
};

export default Mountain;