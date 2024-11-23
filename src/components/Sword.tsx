interface SwordProps {
  isSwinging: boolean;
  onSwingComplete: () => void;
  parentRef: React.RefObject<Group>;
}

import { useRef } from 'react';
import { Group, Shape } from 'three';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';

export default function Sword({ isSwinging, onSwingComplete }: SwordProps) {
  const swordRef = useRef<Group>(null);
  const swingProgress = useRef(0);
  const basePosition = [-1.33, 1.25, 0.75] as const;
  
  useFrame((_, delta) => {
    if (isSwinging && swordRef.current) {
      swingProgress.current += delta * 7; // Slightly faster swing
      
      const swingPhase = Math.min(swingProgress.current / Math.PI, 1);
      
      // Modified arc movement for a more sword-like slash
      const pivotX = basePosition[0] + Math.sin(swingPhase * Math.PI) * 2.5;
      const pivotY = basePosition[1] + Math.sin(swingPhase * Math.PI) * -1.0;
      const pivotZ = basePosition[2] + Math.cos(swingPhase * Math.PI) * 2.0;
      
      swordRef.current.position.set(pivotX, pivotY, pivotZ);
      
      // Modified rotation for a diagonal slash
      const rotationX = Math.sin(swingPhase * Math.PI * 0.8) * (Math.PI / 3);
      const rotationY = Math.sin(swingPhase * Math.PI) * Math.PI;
      const rotationZ = Math.sin(swingPhase * Math.PI * 0.9) * (Math.PI / 3);
      
      swordRef.current.rotation.set(rotationX, rotationY, rotationZ);
      
      if (swingProgress.current >= Math.PI) {
        swingProgress.current = 0;
        swordRef.current.rotation.set(0, 0, 0);
        swordRef.current.position.set(basePosition[0], basePosition[1], basePosition[2]);
        onSwingComplete();
      }
    } else if (!isSwinging && swordRef.current) {
      swordRef.current.rotation.x *= 0.85;
      swordRef.current.rotation.y *= 0.85;
      swordRef.current.rotation.z *= 0.85;
      
      swordRef.current.position.x += (basePosition[0] - swordRef.current.position.x) * 0.20;
      swordRef.current.position.y += (basePosition[1] - swordRef.current.position.y) * 0.20;
      swordRef.current.position.z += (basePosition[2] - swordRef.current.position.z) * 0.20;
    }
  });

  // Create custom sword blade shape
  const createBladeShape = () => {
    const shape = new Shape();
    
    // Start at center
    shape.moveTo(0, 0);
    
    // Simplified guard that connects to circle more smoothly
    shape.lineTo(-0.3, 0.2);  // Reduced width and adjusted angle
    shape.lineTo(-0.2, -0.2); // Smoother transition to circle
    shape.lineTo(0, 0);
    
    // Mirror for right side
    shape.lineTo(0.3, 0.2);
    shape.lineTo(0.2, -0.2);
    shape.lineTo(0, 0);
    
    // Blade with smooth tip (keeping existing smooth tip code)
    shape.lineTo(0, 0.15);
    shape.lineTo(0.2, 0.2);
    shape.quadraticCurveTo(2.0, 0.2, 3.0, 0);
    shape.quadraticCurveTo(2.0, -0.2, 0.2, -0.2);
    shape.lineTo(0, -0.15);
    shape.lineTo(0, 0);
    
    return shape;
  };

  // Add a new function for the inner glowing core shape
  const createInnerBladeShape = () => {
    const shape = new Shape();
    
    // Start at center
    shape.moveTo(0, 0);
    
    // Simplified inner shape
    shape.lineTo(-0.15, 0.1);  // Half the width of outer shape
    shape.lineTo(-0.1, -0.1);
    shape.lineTo(0, 0);
    
    // Mirror for right side
    shape.lineTo(0.15, 0.1);
    shape.lineTo(0.1, -0.1);
    shape.lineTo(0, 0);
    
    // Inner blade with smooth tip
    shape.lineTo(0, 0.1);
    shape.lineTo(0.1, 0.15);
    shape.quadraticCurveTo(1.8, 0.15, 2.8, 0);  // Slightly shorter than outer blade
    shape.quadraticCurveTo(1.8, -0.15, 0.1, -0.15);
    shape.lineTo(0, -0.1);
    shape.lineTo(0, 0);
    
    return shape;
  };

  const bladeExtrudeSettings = {
    steps: 2,
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.02,
    bevelSegments: 3
  };

  return (
    <group 
      ref={swordRef} 
      position={[basePosition[0], basePosition[1], basePosition[2]]}
      rotation={[0, 0, Math.PI]}
      scale={[1.3, 1.3, 1.3]}
    >
      {/* Handle */}
      <group position={[0, -0.5, 0]} rotation={[0, 0, -Math.PI]}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.04, 1.0, 12]} />
          <meshStandardMaterial color="#2a3b4c" roughness={0.7} />
        </mesh>
        
        {/* Handle wrappings */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, 0.4 - i * 0.15, 0]}>
            <torusGeometry args={[0.045, 0.008, 8, 16]} />
            <meshStandardMaterial color="#1a2b3c" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
      
      {/* Circular guard centerpiece */}
      <group position={[0, 0.15, 0]} rotation={[Math.PI, 1.5, Math.PI]}>
        <mesh>
          <torusGeometry args={[0.2, 0.04, 16, 32]} />
          <meshStandardMaterial color="#4a5b6c" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Glowing center gem */}
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color="#a0c4ff"
            emissive="#80b4ff"
            emissiveIntensity={5}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
      
      {/* Blade with trail effect */}
      {isSwinging ? (
        <Trail
          width={2.5}
          length={6}
          color={'#ff0000'}
          attenuation={(t) => {
            const fadeStart = 0.3;
            if (t < fadeStart) return 1;
            return Math.pow((1 - t) / (1 - fadeStart), 1.5);
          }}
          decay={0.8}
        >
          <group position={[0, 0.8, 0]} rotation={[0, -Math.PI / 2, Math.PI / 2]}>
            {/* Base blade */}
            <mesh>
              <extrudeGeometry args={[createBladeShape(), bladeExtrudeSettings]} />
              <meshStandardMaterial 
                color="#d8e8ff"
                metalness={0.4}
                roughness={0.1}
              />
            </mesh>
            
            {/* Glowing core */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), {
                ...bladeExtrudeSettings,
                depth: 0.06
              }]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#a0d4ff"
                emissiveIntensity={4}
                metalness={0.2}
                roughness={0.1}
                opacity={0.8}
                transparent
              />
            </mesh>
            
            {/* Outer glow */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), {
                ...bladeExtrudeSettings,
                depth: 0.07
              }]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#c0e0ff"
                emissiveIntensity={3}
                metalness={0.2}
                roughness={0.1}
                opacity={0.4}
                transparent
              />
            </mesh>
          </group>
        </Trail>
      ) : (
        <group position={[0, 0.8, 0]} rotation={[0, -Math.PI / 2, Math.PI / 2]}>
          <mesh>
            <extrudeGeometry args={[createBladeShape(), bladeExtrudeSettings]} />
            <meshStandardMaterial 
              color="#a8c5ff"
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
          
          <mesh>
            <extrudeGeometry args={[createInnerBladeShape(), {
              ...bladeExtrudeSettings,
              depth: 0.06
            }]} />
            <meshStandardMaterial 
              color="#d4e3ff"
              emissive="#80b4ff"
              emissiveIntensity={2}
              metalness={0.4}
              roughness={0.1}
              opacity={0.7}
              transparent
            />
          </mesh>
          
          <mesh>
            <extrudeGeometry args={[createInnerBladeShape(), {
              ...bladeExtrudeSettings,
              depth: 0.07
            }]} />
            <meshStandardMaterial 
              color="#e8f1ff"
              emissive="#a0c4ff"
              emissiveIntensity={1.5}
              metalness={0.3}
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