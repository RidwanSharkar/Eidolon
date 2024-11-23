interface SwordProps {
  isSwinging: boolean;
  onSwingComplete: () => void;
  parentRef: React.RefObject<Group>;
}

import { useRef } from 'react';
import { Group, Shape } from 'three';
import { useFrame } from '@react-three/fiber';

export default function Sword({ isSwinging, onSwingComplete }: SwordProps) {
  const swordRef = useRef<Group>(null);
  const swingProgress = useRef(0);
  const basePosition = [-1.33, 0.75, 0.75] as const;
  
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
    
    // Narrow guard shape
    shape.lineTo(-0.25, 0.15);  
    shape.lineTo(-0.15, -0.15); 
    shape.lineTo(0, 0);
    
    // Mirror for right side
    shape.lineTo(0.25, 0.15);
    shape.lineTo(0.15, -0.15);
    shape.lineTo(0, 0);
    
    // Narrow blade shape
    shape.lineTo(0, 0.12);    
    shape.lineTo(0.25, 0.25);   
    shape.quadraticCurveTo(1.0, 0.2, 1.5, 0.25);  // Reduced height
    shape.quadraticCurveTo(2.0, 0.15, 2.2, 0);    // Reduced height
    shape.quadraticCurveTo(2.0, -0.15, 1.5, -0.25);
    shape.quadraticCurveTo(1.0, -0.2, 0.25, -0.25);
    shape.lineTo(0, -0.12);
    shape.lineTo(0, 0);
    
    return shape;
  };

  // Make inner blade shape match outer blade shape more closely
  const createInnerBladeShape = () => {
    const shape = new Shape();
    
    // Start at center
    shape.moveTo(0, 0);
    
    // Match outer guard shape but slightly smaller
    shape.lineTo(-0.2, 0.12);
    shape.lineTo(-0.12, -0.12);
    shape.lineTo(0, 0);
    
    // Mirror for right side
    shape.lineTo(0.2, 0.12);
    shape.lineTo(0.12, -0.12);
    shape.lineTo(0, 0);
    
    // Match outer blade shape but slightly smaller
    shape.lineTo(0, 0.1);
    shape.lineTo(0.2, 0.2);
    shape.quadraticCurveTo(1.0, 0.15, 1.5, 0.2);
    shape.quadraticCurveTo(2.0, 0.12, 2.2, 0);
    shape.quadraticCurveTo(2.0, -0.12, 1.5, -0.2);
    shape.quadraticCurveTo(1.0, -0.15, 0.2, -0.2);
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

  const innerBladeExtrudeSettings = {
    ...bladeExtrudeSettings,
    depth: 0.05,           // Slightly thinner
    bevelThickness: 0.01,  // Smaller bevel
    bevelSize: 0.01,       // Smaller bevel size
    bevelOffset: 0         // Ensure it's centered
  };

  return (
    <group 
      ref={swordRef} 
      position={[basePosition[0], basePosition[1], basePosition[2]]}
      rotation={[0, 0, Math.PI]}
      scale={[1.1, 1.1, 1.1]}
    >
      {/* Handle */}
      <group position={[0, -0.4, 0]} rotation={[0, 0, -Math.PI]}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.04, 0.9, 12]} />
          <meshStandardMaterial color="#2a3b4c" roughness={0.7} />
        </mesh>
        
        {/* Handle wrappings */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0, 0.35 - i * 0.13, 0]}>
            <torusGeometry args={[0.045, 0.008, 8, 16]} />
            <meshStandardMaterial color="#1a2b3c" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
      
      {/* Circular guard centerpiece */}
      <group position={[0, 0.15, 0]} rotation={[Math.PI, 1.5, Math.PI]}>
        {/* Larger torus */}
        <mesh>
          <torusGeometry args={[0.25, 0.07, 16, 32]} />  {/* Increased radius from 0.2 to 0.25, thickness from 0.04 to 0.07 */}
          <meshStandardMaterial 
            color="#4a5b6c" 
            metalness={0.9}          // Increased metalness
            roughness={0.1}          // Reduced roughness for more shine
          />
        </mesh>
        
        {/* Much larger and more intense glowing center gem */}
        <mesh>
          <sphereGeometry args={[0.09, 16, 16]} />  {/* Increased from 0.06 to 0.09 */}
          <meshStandardMaterial
            color="#ffff00"           // Bright yellow
            emissive="#ffff00"
            emissiveIntensity={12}    // Significantly increased from 5 to 12
            transparent
            opacity={0.95}
          />
        </mesh>
        
        {/* Additional outer glow layers for more intense effect */}
        <mesh>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial
            color="#ffff80"
            emissive="#ffff80"
            emissiveIntensity={8}
            transparent
            opacity={0.4}
          />
        </mesh>
        
        <mesh>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial
            color="#ffffaa"
            emissive="#ffffaa"
            emissiveIntensity={6}
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
      
      {/* Blade  */}
      <group position={[0, 0.6, 0.0]} rotation={[0, -Math.PI / 2, Math.PI / 2]}>
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
          <extrudeGeometry args={[createInnerBladeShape(), innerBladeExtrudeSettings]} />
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
            ...innerBladeExtrudeSettings,
            depth: 0.06
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
    </group>
  );
} 