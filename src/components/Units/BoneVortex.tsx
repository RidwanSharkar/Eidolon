import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, } from 'three';
import * as THREE from 'three';

interface BoneVortexProps {
  parentRef: React.RefObject<Group>;
}

const createVortexPiece = () => (
  <group>
    {/* Main vortex fragment */}
    <mesh>
      <boxGeometry args={[0.15, 0.03, 0.03]} />
      <meshStandardMaterial 
        color="#67f2b9"
        transparent
        opacity={0.6}
        emissive="#67f2b9"
        emissiveIntensity={0.5}
      />
    </mesh>
    
    {/* Glowing core */}
    <mesh>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshStandardMaterial 
        color="#39ff14"
        emissive="#39ff14"
        emissiveIntensity={2}
        transparent
        opacity={0.5}
      />
    </mesh>
  </group>
);

export default function BoneVortex({ parentRef }: BoneVortexProps) {
  const vortexPiecesRef = useRef<(Group | null)[]>([]);
  const pieceCount = 25;
  const baseRadius = 0.5;
  const groupRef = useRef<Group>(null);
  
  useFrame(({ clock }) => {
    if (!parentRef.current || !groupRef.current) return;
    
    const parentPosition = parentRef.current.position;
    groupRef.current.position.set(parentPosition.x, 0, parentPosition.z);
    
    vortexPiecesRef.current.forEach((piece, i) => {
      if (!piece) return;
      
      const time = clock.getElapsedTime();
      const heightOffset = ((i / pieceCount) * 0.8);
      const radiusMultiplier = 1 - (heightOffset * 0.8);
      
      const angle = (i / pieceCount) * Math.PI * 4 + time * 2;
      const radius = baseRadius * radiusMultiplier;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = heightOffset;
      
      piece.position.set(x, y, z);
      piece.rotation.y = angle + Math.PI / 2;
      piece.rotation.x = Math.PI / 6;
      piece.rotation.z = Math.sin(time * 3 + i) * 0.1;
      
      // Update material opacity
      const meshChild = piece.children[0] as Mesh;
      if (meshChild && meshChild.material) {
        const material = meshChild.material as THREE.MeshStandardMaterial;
        material.opacity = Math.max(0.1, 1 - (heightOffset * 2));
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: pieceCount }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) vortexPiecesRef.current[i] = el;
          }}
        >
          {createVortexPiece()}
        </group>
      ))}
      
      <pointLight 
        color="#67f2b9"
        intensity={1}
        distance={1.2}
        position={[0, 0.25, 0]}
      />
    </group>
  );
} 