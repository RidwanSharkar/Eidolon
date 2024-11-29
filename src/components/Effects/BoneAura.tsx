import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface BoneAuraProps {
  parentRef: React.RefObject<Group>;
}

export default function BoneAura({ parentRef }: BoneAuraProps) {
  const bonesRef = useRef<Mesh[]>([]);
  const boneCount = 12;
  const radius = 0.8;
  
  useFrame(() => {
    if (!parentRef.current) return;
    
    bonesRef.current.forEach((bone, i) => {
      const angle = (i / boneCount) * Math.PI * 2 + Date.now() * 0.001;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(Date.now() * 0.002 + i) * 0.08;
      
      bone.position.set(x, y, z);
    });
  });

  return (
    <group position={[0, 1, 0]}>
      {Array.from({ length: boneCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) bonesRef.current[i] = el;
          }}
        >
          <cylinderGeometry args={[0.03, 0.06, 0.25, 4]} />
          <meshStandardMaterial
            color="#67f2b9"
            emissive="#39ff14"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
          
          <pointLight
            color="#39ff14"
            intensity={0.8}
            distance={1}
            decay={2}
          />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
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