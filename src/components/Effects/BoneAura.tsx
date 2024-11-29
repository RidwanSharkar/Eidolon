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
        color="#67f2b9"
        emissive="#39ff14"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
    
    {/* Bone joints - more pronounced */}
    <mesh position={new THREE.Vector3(0, 0.1, 0)} rotation={new THREE.Euler(0, 0, Math.PI / 6)}>
      <sphereGeometry args={[0.025, 4, 4]} />
      <meshStandardMaterial 
        color="#67f2b9"
        emissive="#39ff14"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>

    <mesh position={new THREE.Vector3(0, -0.1, 0)} rotation={new THREE.Euler(0, 0, -Math.PI / 6)}>
      <sphereGeometry args={[0.02, 4, 4]} />
      <meshStandardMaterial 
        color="#67f2b9"
        emissive="#39ff14"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  </group>
);

export default function BoneAura({ parentRef }: BoneAuraProps) {
  const bonesRef = useRef<Mesh[]>([]);
  const boneCount = 12;
  const radius = 0.8;
  
  useFrame(() => {
    if (!parentRef.current) return;
    
    const parentPosition = parentRef.current.position;
    
    bonesRef.current.forEach((bone, i) => {
      const angle = (i / boneCount) * Math.PI * 2 + Date.now() * 0.001;
      const x = Math.cos(angle) * radius + parentPosition.x;
      const z = Math.sin(angle) * radius + parentPosition.z;
      const y = Math.sin(Date.now() * 0.002 + i) * 0.08;
      
      bone.position.set(x, y + 0.1, z);
      bone.rotation.y = angle + Math.PI / 2;
    });
  });

  return (
    <group>
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

      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[
          parentRef.current?.position.x || 0,
          0,
          parentRef.current?.position.z || 0
        ]}
      >
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color="#39ff14"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
} 