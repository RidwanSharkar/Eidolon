import { useRef } from 'react';
import { Group } from 'three';

const BonePlate: React.FC = () => {
  const plateRef = useRef<Group>(null);

  const createRibPiece = (yOffset: number, scale: number = 1) => (
    <group position={[0, yOffset, 0]} scale={scale}>
      {/* Left rib */}
      <group rotation={[0, 0, -Math.PI / 3]}>
        <mesh 
          position={[0.1, 0, 0]}
          rotation={[0, Math.PI / 2, 0]} // Moved rotation to mesh
        >
          <torusGeometry 
            args={[0.2, 0.015, 8, 12, Math.PI / 2]} 
          />
          <meshStandardMaterial 
            color="#e8e8e8"
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>

        {/* Rib end joint */}
        <mesh position={[0.3, -0.15, 0]}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshStandardMaterial 
            color="#d8d8d8"
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
      </group>

      {/* Right rib */}
      <group rotation={[0, 0, Math.PI / 3]}>
        <mesh 
          position={[-0.1, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]} // Moved rotation to mesh
        >
          <torusGeometry 
            args={[0.2, 0.015, 8, 12, Math.PI / 2]} 
          />
          <meshStandardMaterial 
            color="#e8e8e8"
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>

        {/* Rib end joint */}
        <mesh position={[-0.3, -0.15, 0]}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshStandardMaterial 
            color="#d8d8d8"
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
      </group>

      {/* Rib connection to spine */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 4]} />
        <meshStandardMaterial 
          color="#e8e8e8"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
    </group>
  );

  const createSpinePiece = () => (
    <group>
      {/* Vertical spine column */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 4]} />
        <meshStandardMaterial 
          color="#e8e8e8"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Spine segments/vertebrae */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((yPos, i) => (
        <group key={i} position={[0, yPos, 0]}>
          {/* Vertebra core */}
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 6]} />
            <meshStandardMaterial 
              color="#d8d8d8"
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
          
          {/* Vertebra protrusions */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.04, 0.03, 0.04]} />
            <meshStandardMaterial 
              color="#d8d8d8"
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );

  return (
    <group 
      ref={plateRef}
      position={[0, 0.3, 0.4]}
      rotation={[0.2, 0, 0]}
    >
      <group>
        {/* Create spine first */}
        {createSpinePiece()}
        
        {/* Create rib pairs that connect to spine */}
        <group position={[0, 0, 0]}>
          {createRibPiece(0.3, 0.8)}   
          {createRibPiece(0.15, 0.9)}  
          {createRibPiece(0, 1)}    
          {createRibPiece(-0.15, 0.9)}
          {createRibPiece(-0.3, 0.8)}  
        </group>
      </group>
    </group>
  );
};

export default BonePlate;