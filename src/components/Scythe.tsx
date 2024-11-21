interface ScytheProps {
  isSwinging: boolean;
  onSwingComplete: () => void;
}

import { useRef,  } from 'react';
import { Group, Shape,  } from 'three';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';

interface ScytheProps {
  isSwinging: boolean;
  onSwingComplete: () => void;
}

export default function Scythe({ isSwinging, onSwingComplete }: ScytheProps) {
  const scytheRef = useRef<Group>(null);
  const swingProgress = useRef(0);
  
  useFrame((_, delta) => {
    if (isSwinging && scytheRef.current) {
      swingProgress.current += delta * 4;
      
      // Adjust swing phase calculation
      const swingPhase = Math.min(swingProgress.current / Math.PI, 1);
      
      // Adjust rotations to maintain the initial blade angle
      const rotationX = Math.sin(swingPhase * Math.PI) * (Math.PI / 4); // Adjusted downward tilt
      const rotationY = Math.sin(swingPhase * Math.PI) * (Math.PI / 3); // Adjusted side swing
      const rotationZ = Math.sin(swingPhase * Math.PI) * (Math.PI / 6); // Adjusted forward arc
      
      // Apply the rotations
      scytheRef.current.rotation.set(
        rotationX,
        rotationY,
        rotationZ
      );
      
      // Reset and complete swing
      if (swingProgress.current >= Math.PI) {
        swingProgress.current = 0;
        scytheRef.current.rotation.set(0, 0, 0);
        onSwingComplete();
      }
    } else if (!isSwinging && scytheRef.current) {
      // Smooth return to initial position when not swinging
      scytheRef.current.rotation.x *= 0.9;
      scytheRef.current.rotation.y *= 0.9;
      scytheRef.current.rotation.z *= 0.9;
    }
  });

  // Create custom blade shape
  const createBladeShape = () => {
    const shape = new Shape();
    

    shape.moveTo(0, 0);
    
    // Create thick back edge first
    shape.lineTo(0.2, 0.05); // Slightly thicker at the base
    shape.bezierCurveTo(
      0.6, 0.2,    // control point 1
      1.0, 0.5,    // control point 2
      1.2, 0.8     // end point (tip)
    );
    
    // Create sharp edge
    shape.lineTo(1.1, 0.85);
    shape.bezierCurveTo(
      0.7, 0.4,
      0.3, 0.15,
      0, 0
    );
    shape.lineTo(0, 0);
  
    return shape;
  };

  const bladeExtradeSettings = {
    steps: 1,
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3
  };

  return (
    <group 
      ref={scytheRef} 
      position={[-0.5, 0, 0]}
      rotation={[0, 0, Math.PI]}
      scale={[1, 1, 1]}
    >
      {/* Handle with decorative wrappings */}
      <group position={[0, -1, 0]} rotation={[0, 0, -Math.PI]}>
        {/* Main handle */}
        <mesh>
          <cylinderGeometry args={[0.04, 0.05, 2.2, 12]} />
          <meshStandardMaterial color="#2c1810" roughness={0.7} />
        </mesh>
        
        {/* Decorative wrappings - adjusted position */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, 0.8 - i * 0.3, 0]}>
            <torusGeometry args={[0.06, 0.01, 8, 16]} />
            <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
      </group>
      
      {/* Blade connector with corrected angle */}
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 1, 0, Math.PI]}>
        <cylinderGeometry args={[0.08, 0.06, 0.3, 8]} />
        <meshStandardMaterial color="#2c1810" roughness={0.6} />
      </mesh>
      
      {/* Custom blade with adjusted position and rotation */}
      {isSwinging ? (
        <Trail
          width={1.5}
          length={4}
          color={'#39ff14'}
          attenuation={(t) => t * t}
        >
          <group position={[0, 0.8, 1.3]} rotation={[-1.2, -Math.PI / 2, Math.PI / 2]}>
            <mesh>
              <extrudeGeometry args={[createBladeShape(), bladeExtradeSettings]} />
              <meshStandardMaterial 
                color="#303030"
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
            
            {/* Blade edge highlight */}
            <mesh>
              <extrudeGeometry args={[createBladeShape(), { ...bladeExtradeSettings, depth: 0.021 }]} />
              <meshStandardMaterial 
                color="#404040"
                metalness={1}
                roughness={0.1}
                opacity={0.3}
                transparent
              />
            </mesh>
          </group>
        </Trail>
      ) : (
        <group position={[0, 0.8, 1.3]} rotation={[-1.2, -Math.PI / 2, Math.PI / 2]}>   
          <mesh>
            <extrudeGeometry args={[createBladeShape(), bladeExtradeSettings]} />
            <meshStandardMaterial 
              color="#303030"
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
          
          {/* Blade edge highlight */}
          <mesh>
            <extrudeGeometry args={[createBladeShape(), { ...bladeExtradeSettings, depth: 0.021 }]} />
            <meshStandardMaterial 
              color="#404040"
              metalness={1}
              roughness={0.1}
              opacity={0.3}
              transparent
            />
          </mesh>
        </group>
      )}
    </group>
  );
}