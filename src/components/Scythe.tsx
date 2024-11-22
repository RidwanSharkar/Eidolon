interface ScytheProps {
  isSwinging: boolean;
  onSwingComplete: () => void;
  parentRef: React.RefObject<Group>;
}

import { useRef,  } from 'react';
import { Group, Shape,  } from 'three';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';

interface ScytheProps {
  isSwinging: boolean;
  onSwingComplete: () => void;
  parentRef: React.RefObject<Group>;
}

export default function Scythe({ isSwinging, onSwingComplete, }: ScytheProps) {
  const scytheRef = useRef<Group>(null);
  const swingProgress = useRef(0);
  const basePosition = [-1.33, 1.25, 0.75] as const;
  
  useFrame((_, delta) => {
    if (isSwinging && scytheRef.current) {
      swingProgress.current += delta * 6;
      
      // Adjust swing phase calculation
      const swingPhase = Math.min(swingProgress.current / Math.PI, 1);
      
      // Calculate pivot point movement in an arc
      const pivotX = basePosition[0] + Math.sin(swingPhase * Math.PI) * 3.0;
      const pivotY = basePosition[1] + Math.sin(swingPhase * Math.PI) * -1.5;
      const pivotZ = basePosition[2] + Math.cos(swingPhase * Math.PI) * 1.5;
      
      // Apply the pivot point movement
      scytheRef.current.position.set(pivotX, pivotY, pivotZ);
      
      // end more horizontally
      const rotationX = Math.sin(swingPhase * Math.PI * 0.7) * (Math.PI / 4); //  end-swing upward rotation
      const rotationY = Math.sin(swingPhase * Math.PI) * (Math.PI / 1.5);
      // Adjust Z rotation to maintain more horizontal end position
      const rotationZ = Math.sin(swingPhase * Math.PI * 0.8) * (Math.PI / 4);
      
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
        scytheRef.current.position.set(basePosition[0], basePosition[1], basePosition[2]);
        onSwingComplete();
      }
    } else if (!isSwinging && scytheRef.current) {
      // Smooth return to initial position
      scytheRef.current.rotation.x *= 0.85;
      scytheRef.current.rotation.y *= 0.85;
      scytheRef.current.rotation.z *= 0.85;
      
      // Smooth return to base position
      scytheRef.current.position.x += (basePosition[0] - scytheRef.current.position.x) * 0.20;
      scytheRef.current.position.y += (basePosition[1] - scytheRef.current.position.y) * 0.20;
      scytheRef.current.position.z += (basePosition[2] - scytheRef.current.position.z) * 0.20;
    }
  });

  // Create custom blade shape
  const createBladeShape = () => {
    const shape = new Shape();
    

    shape.moveTo(0, 0);
    
    // Create thick back edge first
    shape.lineTo(0.2, 0.05); // Slightly thicker at the base   COOL BLADE SHAPES
    shape.bezierCurveTo(
      0.7, 0.2,    // control point 1
      1.35, 0.6,    // control point 2
      1.55, 0.5     // end point (tip)
    );
    
    // Create sharp edge
    shape.lineTo(1.125, 1.125);
    shape.bezierCurveTo(
      0.7, 0.4,
      0.3, 0.15,
      0.4, 0.75
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
      position={[basePosition[0], basePosition[1], basePosition[2]]}
      rotation={[0, 0, Math.PI]}
      scale={[1.1, 1.1, 1.1]}
    >
      {/* Handle HEIGHT  */}
      <group position={[0, -.7, 0]} rotation={[0, 0, -Math.PI]}>
        <mesh>
          <cylinderGeometry args={[0.035, 0.05, 1.5, 12]} /> {/* Reduced from 3.2 to 2.4 */}
          <meshStandardMaterial color="#2c1810" roughness={0.7} />
        </mesh>
        
        {/* Decorative wrappings - adjusted for shorter handle */}
        {[...Array(8)].map((_, i) => ( // Reduced from 12 to 8 wrappings
          <mesh key={i} position={[0, 0.8 - i * 0.3, 0]}> {/* Adjusted starting position */}
            <torusGeometry args={[0.06, 0.01, 8, 16]} />
            <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
      </group>
      
      {/* Blade connector - adjusted position */}
      <group position={[0, 0.30, 0]} rotation={[Math.PI / 1, 0, Math.PI]}>
        {/* Base connector */}
        <mesh>
          <cylinderGeometry args={[0.12, 0.09, 0.3, 8]} />
          <meshStandardMaterial color="#2c1810" roughness={0.6} />
        </mesh>

        {/* Rotating glow rings */}
        <group rotation-x={useFrame((state) => state.clock.getElapsedTime() * 2)}>
          <mesh>
            <torusGeometry args={[0.15, 0.01, 16, 32]} />
            <meshStandardMaterial
              color="#39ff14"
              emissive="#39ff14"
              emissiveIntensity={2}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>

        {/* Second ring rotating opposite direction */}
        <group rotation-x={useFrame((state) => -state.clock.getElapsedTime() * 2)}>
          <mesh position-y={0.1}>
            <torusGeometry args={[0.13, 0.01, 16, 32]} />
            <meshStandardMaterial
              color="#39ff14"
              emissive="#39ff14"
              emissiveIntensity={1.5}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>

        {/* Static outer glow */}
        <mesh>
          <cylinderGeometry args={[0.14, 0.11, 0.32, 8]} />
          <meshStandardMaterial
            color="#39ff14"
            emissive="#39ff14"
            emissiveIntensity={1}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
      
      {/* Enhanced blade with glowing effect - adjusted position */}
      {isSwinging ? (
        <Trail
          width={3.5}
          length={8}
          color={'#39ff14'}
          attenuation={(t) => {
            const fadeStart = 0.3;
            if (t < fadeStart) return 1;
            return Math.pow((1 - t) / (1 - fadeStart), 1.5);
          }}
          decay={0.8}
        >
          <group position={[0, 1.0, 1.3]} rotation={[-1.2, -Math.PI / 2, Math.PI / 2]}> {/* Y position increased from 0.8 to 1.0 */}
            {/* Base blade */}
            <mesh>
              <extrudeGeometry args={[createBladeShape(), bladeExtradeSettings]} />
              <meshStandardMaterial 
                color="#202020"     // Darker base for contrast
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
            
            {/* Primary glow layer */}
            <mesh>
              <extrudeGeometry args={[createBladeShape(), { ...bladeExtradeSettings, depth: 0.021 }]} />
              <meshStandardMaterial 
                color="#39ff14"     // Bright green
                emissive="#39ff14"  // Same color emission
                emissiveIntensity={2.5}
                metalness={0.9}
                roughness={0.2}
                opacity={0.7}
                transparent
              />
            </mesh>
            
            {/* Outer glow layer */}
            <mesh>
              <extrudeGeometry args={[createBladeShape(), { ...bladeExtradeSettings, depth: 0.022 }]} />
              <meshStandardMaterial 
                color="#39ff14"
                emissive="#39ff14"
                emissiveIntensity={1.5}
                metalness={0.8}
                roughness={0.1}
                opacity={0.3}
                transparent
              />
            </mesh>
          </group>
        </Trail>
      ) : (
        <group position={[0, 0.5, 1.3]} rotation={[-0.9, -Math.PI / 2, Math.PI / 2]}>             {/* BLADEEE ANGLEEEE */}
          {/* Base blade */}
          <mesh>
            <extrudeGeometry args={[createBladeShape(), bladeExtradeSettings]} />
            <meshStandardMaterial 
              color="#202020"
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
          
          {/* Primary glow layer */}
          <mesh>
            <extrudeGeometry args={[createBladeShape(), { ...bladeExtradeSettings, depth: 0.021 }]} />
            <meshStandardMaterial 
              color="#39ff14"
              emissive="#39ff14"
              emissiveIntensity={2.5}
              metalness={0.9}
              roughness={0.2}
              opacity={0.7}
              transparent
            />
          </mesh>
          
          {/* Outer glow layer */}
          <mesh>
            <extrudeGeometry args={[createBladeShape(), { ...bladeExtradeSettings, depth: 0.022 }]} />
            <meshStandardMaterial 
              color="#39ff14"
              emissive="#39ff14"
              emissiveIntensity={1.5}
              metalness={0.8}
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