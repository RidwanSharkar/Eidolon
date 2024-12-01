import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface BoneAuraProps {
  parentRef: React.RefObject<Group>;
}

const createBonePiece = () => (
  <group rotation={[Math.PI / 3, 0, 0]}>
    {/* Main bone shaft - thinner and more angular */}
    <mesh>
      <cylinderGeometry args={[0.02, 0.015, 0.2, 4]} />
      <meshStandardMaterial 
        color="#e8e8e8"
        roughness={0.4}
        metalness={0.3}
      />
    </mesh>
    
    {/* Bone joints - more pronounced */}
    <mesh position={new THREE.Vector3(0, 0.1, 0)} rotation={new THREE.Euler(0, 0, Math.PI / 6)}>
      <sphereGeometry args={[0.025, 4, 4]} />
      <meshStandardMaterial 
        color="#d8d8d8"
        roughness={0.5}
        metalness={0.2}
      />
    </mesh>

    <mesh position={new THREE.Vector3(0, -0.1, 0)} rotation={new THREE.Euler(0, 0, -Math.PI / 6)}>
      <sphereGeometry args={[0.02, 4, 4]} />
      <meshStandardMaterial 
        color="#d8d8d8"
        roughness={0.5}
        metalness={0.2}
      />
    </mesh>
  </group>
);

export default function BoneAura({ parentRef }: BoneAuraProps) {
  const bonesRef = useRef<Mesh[]>([]);
  const boneCount = 12;
  const radius = 0.55;
  const groupRef = useRef<Group>(null);
  
  useFrame(() => {
    if (!parentRef.current || !groupRef.current) return;
    
    const parentPosition = parentRef.current.position;
    groupRef.current.position.set(parentPosition.x, 0, parentPosition.z);
    
    bonesRef.current.forEach((bone, i) => {
      const angle = (i / boneCount) * Math.PI * 2 + Date.now() * 0.001;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(Date.now() * 0.002 + i) * 0.08;
      
      bone.position.set(x, y + 0.1, z);
      bone.rotation.y = angle + Math.PI / 2;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: boneCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) bonesRef.current[i] = el;
          }}
        >
          {createBonePiece()}
        </mesh>
      ))}
    </group>
  );
} 