import { useRef } from 'react';
import { Group } from 'three';

const BoneTail: React.FC = () => {
  const tailRef = useRef<Group>(null);

  const createVertebra = (scale: number = 1, index: number) => (
    <group 
      position={[0, -index * 0.2, 0]} 
      scale={scale}
      rotation={[0.1 * index, 0, 0]} // Progressive curve
    >
      {/* Main vertebra body */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.05, 0.12, 6]} />
        <meshStandardMaterial 
          color="#e8e8e8"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Vertebra spikes */}
      <group rotation={[0, 0, Math.PI / 2]}>
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
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
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
      ref={tailRef}
      position={[0, 0.09, -0.2]} // Positioned behind the unit
      rotation={[0.3, Math.PI, 0]} // Slight downward angle
    >
      {/* Create vertebrae with decreasing scale */}
      {[...Array(8)].map((_, index) => (
        createVertebra(1 - (index * 0.1), index)
      ))}
    </group>
  );
};

export default BoneTail; 