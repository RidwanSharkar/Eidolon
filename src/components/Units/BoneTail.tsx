import { useRef } from 'react';
import { Group } from 'three';

const BoneTail: React.FC = () => {
  const tailRef = useRef<Group>(null);

  const createVertebra = (scale: number = 1, index: number) => {
    // Calculate a smooth downward curve
    const curve = Math.sin((index / 12) * Math.PI) * 0.8; // Creates downward arc
    
    return (
    <group 
      position={[
        0, 
        -curve, // Downward Y position following arc
        -index * 0.2 // Backward Z movement
      ]} 
      scale={scale}
      rotation={[
        Math.min(index * 0.1, Math.PI * 0.5), // Increased rotation to follow curve
        0,
        0
      ]}
    >
      {/* Main vertebra */}
      <mesh rotation={[Math.PI / 2, 0, 0]}> {/* Rotated 90 degrees to align with curve */}
        <cylinderGeometry args={[0.06, 0.05, 0.12, 6]} />
        <meshStandardMaterial 
          color="#e8e8e8"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Vertebra spikes */}
      <group rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        {/* Top spike */}
        <mesh position={[0, 0.08, 0]}>
          <coneGeometry args={[0.03, 0.08, 4]} />
          <meshStandardMaterial 
            color="#d8d8d8"
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
        
        {/* Side spikes */}
        <mesh position={[0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.02, 0.06, 4]} />
          <meshStandardMaterial 
            color="#d8d8d8"
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.02, 0.06, 4]} />
          <meshStandardMaterial 
            color="#d8d8d8"
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
      </group>

      {/* Connecting joint */}
      <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial 
          color="#d8d8d8"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
    </group>
  )};

  return (
    <group 
      ref={tailRef}
      position={[0, 0.09, -0.2]}
      rotation={[0.1, 0, 0]}
    >
      {[...Array(12)].map((_, index) => (
        createVertebra(1 - (index * 0.05), index)
      ))}
    </group>
  );
};

export default BoneTail; 