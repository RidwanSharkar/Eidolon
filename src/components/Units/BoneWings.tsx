import { useRef } from 'react';
import { Group, Vector3, Euler } from 'three';

interface BonePosition {
  pos: Vector3;
  rot: Euler;
  scale: number;
}

interface BoneWingsProps {
  collectedBones: number;
  isLeftWing: boolean;
  parentRef: React.RefObject<Group>;
}

export default function BoneWings({ collectedBones, isLeftWing }: BoneWingsProps) {
  const wingsRef = useRef<Group>(null);
    const wingBonePositions: BonePosition[] = [
    // Main central arm bone
    { 
      pos: new Vector3(isLeftWing ? -0.3 : 0.3, 0.4, 0), 
      rot: new Euler(0, 0, isLeftWing ? -Math.PI / 6 : Math.PI / 6), 
      scale: 1.4 
    },
    { 
      pos: new Vector3(isLeftWing ? -0.6 : 0.6, 0.5, 0), 
      rot: new Euler(0, 0, isLeftWing ? -Math.PI / 4 : Math.PI / 4), 
      scale: 1.3 
    },
    
    // Upper wing section
    { 
      pos: new Vector3(isLeftWing ? -0.8 : 0.8, 0.7, 0), 
      rot: new Euler(0, 0, isLeftWing ? -Math.PI / 2.5 : Math.PI / 2.5), 
      scale: 1.0 
    },
    { 
      pos: new Vector3(isLeftWing ? -1.1 : 1.1, 0.8, 0.1), 
      rot: new Euler(0.1, 0, isLeftWing ? -Math.PI / 2.2 : Math.PI / 2.2), 
      scale: 0.9 
    },
    { 
      pos: new Vector3(isLeftWing ? -1.4 : 1.4, 0.9, 0.2), 
      rot: new Euler(0.2, 0, isLeftWing ? -Math.PI / 2 : Math.PI / 2), 
      scale: 0.8 
    },
  ];

  const createBonePiece = () => (
    <group>
      {/* Main bone shaft - thinner and more angular */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.015, 0.4, 4]} /> {/* 4 segments for more angular look */}
        <meshStandardMaterial 
          color="#e8e8e8"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      
      {/* Bone joints - more pronounced */}
      <mesh position={new Vector3(0, 0.2, 0)} rotation={new Euler(0, 0, Math.PI / 6)}>
        <sphereGeometry args={[0.035, 4, 4]} /> {/* Less segments for more angular look */}
        <meshStandardMaterial 
          color="#d8d8d8"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      <mesh position={new Vector3(0, -0.2, 0)} rotation={new Euler(0, 0, -Math.PI / 6)}>
        <sphereGeometry args={[0.03, 4, 4]} />
        <meshStandardMaterial 
          color="#d8d8d8"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
    </group>
  );

  return (
    <group 
      ref={wingsRef}
      rotation={new Euler(0, Math.PI, 0)}
      position={new Vector3(0, -0.3, 0)}
    >
      {wingBonePositions.slice(0, Math.min(15, collectedBones)).map((bone, i) => (
        <group
          key={`bone-${i}`}
          position={bone.pos}
          rotation={bone.rot}
          scale={bone.scale}
        >
          {createBonePiece()}
        </group>
      ))}
    </group>
  );
} 