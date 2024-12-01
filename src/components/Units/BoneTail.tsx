import { useRef } from 'react';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

const BoneTail: React.FC = () => {
  const tailRef = useRef<Group>(null);

  // Increased horizontal sway amplitude
  useFrame(({ clock }) => {
    if (!tailRef.current) return;
    
    const time = clock.getElapsedTime();
    tailRef.current.rotation.y = Math.sin(time * 0.5) * 0.3; // Increased from 0.1 to 0.3
    tailRef.current.rotation.x = 0.1 + Math.sin(time * 0.7) * 0.05;
  });

  const createVertebra = (scale: number = 1, index: number) => {
    const progress = index / 15;
    const curve = Math.pow(progress, 2.5) * -0.8;
    
    const nextProgress = (index + 1) / 15;
    const nextCurve = Math.pow(nextProgress, 2.5) * -0.8;
    const deltaY = nextCurve - curve;
    const deltaZ = 0.1 * (1 - (index / 20));
    
    const initialAngle = Math.PI / 3;
    const segmentAngle = Math.atan2(deltaY, deltaZ) + (index === 0 ? initialAngle : 0);
    
    return (
      <group 
        position={[
          0, 
          -curve,
          -index * 0.1 * (1 - (index / 40))
        ]} 
        scale={scale}
        rotation={[
          -segmentAngle,
          0,
          0
        ]}
      >
        {/* Main vertebra */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.035, 0.08, 6]} />
          <meshStandardMaterial 
            color="#e8e8e8"
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>

        {/* Vertebra spikes */}
        <group rotation={[Math.PI / 2, 0, Math.PI / 2]}>
          {/* Top spike */}
          <mesh position={[0, 0.05, 0]}>
            <coneGeometry args={[0.02, 0.06, 4]} />
            <meshStandardMaterial 
              color="#d8d8d8"
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
          
          {/* Side spikes */}
          <mesh position={[0.05, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.015, 0.04, 4]} />
            <meshStandardMaterial 
              color="#d8d8d8"
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
          <mesh position={[-0.085, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.015, 0.04, 4]} />
            <meshStandardMaterial 
              color="#d8d8d8"
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
        </group>

        {/* Connecting joint */}
        <mesh position={[0, -0.01, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.03, 6, 6]} />
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
      position={[0, -0.65, -0.35]}
      rotation={[-0.1, 0, 0]}
    >
      {[...Array(15)].map((_, index) => (
        createVertebra(1 - (index * 0.04), index)
      ))}
    </group>
  );
};

export default BoneTail; 