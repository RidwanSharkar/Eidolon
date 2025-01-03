interface SwordProps {
  isSwinging: boolean;
  isSmiting: boolean;
  isOathstriking: boolean;
  onSwingComplete: () => void;
  onSmiteComplete: () => void;
  onOathstrikeComplete?: () => void;
}

import { useRef } from 'react';
import { Group, Shape } from 'three';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Sword({ isSwinging, isSmiting, isOathstriking, onSwingComplete, onSmiteComplete, onOathstrikeComplete }: SwordProps) {
  const swordRef = useRef<Group>(null);
  const swingProgress = useRef(0);
  const smiteProgress = useRef(0);
  const basePosition = [-1.18, 0.225, 0.3] as const; // POSITIONING
  
  useFrame((_, delta) => {
    if (!swordRef.current) return;

    if (isOathstriking) {
      swingProgress.current += delta * 10;
      const swingPhase = Math.min(swingProgress.current / Math.PI/1.7, 1);
      
      const pivotX = basePosition[0] + Math.sin(swingPhase * Math.PI) * 2.5;
      const pivotY = basePosition[1] + Math.sin(swingPhase * Math.PI) * -1.0;
      const pivotZ = basePosition[2] + Math.cos(swingPhase * Math.PI) * 1.5;
      
      swordRef.current.position.set(pivotX, pivotY, pivotZ);
      
      const rotationX = Math.sin(swingPhase * Math.PI * 0.8) * (Math.PI / 3);
      const rotationY = Math.sin(swingPhase * Math.PI) * Math.PI;
      const rotationZ = Math.sin(swingPhase * Math.PI * 0.9) * (Math.PI / 3);
      
      swordRef.current.rotation.set(rotationX, rotationY, rotationZ);
      
      if (swingProgress.current >= Math.PI) {
        swingProgress.current = 0;
        swordRef.current.rotation.set(0, 0, 0);
        swordRef.current.position.set(...basePosition);
        onOathstrikeComplete?.();
      }
      return;
    }

    if (isSmiting) {
      smiteProgress.current += delta * (smiteProgress.current < Math.PI/2 ? 3 : 6);
      const smitePhase = Math.min(smiteProgress.current / Math.PI, 1);
      
      let rotationX, rotationY, positionX, positionY, positionZ;
      
      if (smitePhase < 0.5) {
        // Wind-up phase: pull back and up, with more movement towards center
        const windupPhase = smitePhase * 1;
        rotationX = -Math.PI/3 - (windupPhase * Math.PI/3);
        rotationY = windupPhase * Math.PI/4;
        
        // Move even more towards center during windup
        positionX = basePosition[0] + (windupPhase * 1.5);
        positionY = basePosition[1] + windupPhase * 1.5;
        positionZ = basePosition[2] - windupPhase * 1.5;
      } else {
        // Strike phase: swing down towards center point
        const strikePhase = (smitePhase - 0.5) * 2;
        rotationX = -2*Math.PI/3 + (strikePhase * 3*Math.PI/2);
        rotationY = (Math.PI/4) * (1 - strikePhase);
        
        // Strike further towards center
        positionX = basePosition[0] + (1.5 * (1 - strikePhase));
        positionY = basePosition[1] + (1.5 - strikePhase * 2.0);
        positionZ = basePosition[2] - (1.5 - strikePhase * 3.0);
      }
      
      swordRef.current.position.set(
        positionX,
        positionY,
        positionZ
      );
      
      swordRef.current.rotation.set(rotationX, rotationY, 0);
      
      if (smiteProgress.current >= Math.PI) {
        smiteProgress.current = 0;
        swordRef.current.rotation.set(0, 0, 0);
        swordRef.current.position.set(...basePosition);
        onSmiteComplete();
      }
      return;
    }

    if (isSwinging) {
      swingProgress.current += delta * 10;
      const swingPhase = Math.min(swingProgress.current / Math.PI/1.6, 1);
      
      const pivotX = basePosition[0] + Math.sin(swingPhase * Math.PI) * 2.5;
      const pivotY = basePosition[1] + Math.sin(swingPhase * Math.PI) * -1.0;
      const pivotZ = basePosition[2] + Math.cos(swingPhase * Math.PI) * 1.5;
      
      swordRef.current.position.set(pivotX, pivotY, pivotZ);
      
      const rotationX = Math.sin(swingPhase * Math.PI * 0.8) * (Math.PI / 3);
      const rotationY = Math.sin(swingPhase * Math.PI) * Math.PI;
      const rotationZ = Math.sin(swingPhase * Math.PI * 0.9) * (Math.PI / 3);
      
      swordRef.current.rotation.set(rotationX, rotationY, rotationZ);
      
      if (swingProgress.current >= Math.PI) {
        swingProgress.current = 0;
        swordRef.current.rotation.set(0, 0, 0);
        swordRef.current.position.set(...basePosition);
        onSwingComplete();
      }
    } else if (!isSwinging && !isSmiting) {
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
    
    // Left side guard (fixed symmetry)
    shape.lineTo(-0.25, 0.25);  
    shape.lineTo(-0.15, -0.15); 
    shape.lineTo(0, 0);
    
    // Right side guard (matches left exactly)
    shape.lineTo(0.25, 0.25);
    shape.lineTo(0.15, -0.15);
    shape.lineTo(0, 0);
    
    // Blade shape with improved symmetry - reduced width values
    shape.lineTo(0, 0.08);    // Reduced from 0.12
    shape.lineTo(0.2, 0.2);   // Reduced from 0.25
    shape.quadraticCurveTo(0.8, 0.15, 1.5, 0.18); // Reduced y values
    shape.quadraticCurveTo(2.0, 0.1, 2.2, 0);     // Reduced y value
    
    shape.quadraticCurveTo(2.0, -0.1, 1.5, -0.18); // Mirror of upper curve
    shape.quadraticCurveTo(0.8, -0.15, 0.2, -0.2);
    shape.lineTo(0, -0.08);   // Reduced from -0.12
    shape.lineTo(0, 0);
    
    return shape;
  };

  // inner blade shape 
  const createInnerBladeShape = () => {
    const shape = new Shape();
    shape.moveTo(0, 0);
    
    // Blade shape with  symmetry
    shape.lineTo(0, 0.06);   
    shape.lineTo(0.15, 0.15); 
    shape.quadraticCurveTo(1.2, 0.12, 1.5, 0.15); 
    shape.quadraticCurveTo(2.0, 0.08, 2.15, 0);    
    shape.quadraticCurveTo(2.0, -0.08, 1.5, -0.15); 
    shape.quadraticCurveTo(1.2, -0.12, 0.15, -0.15);
    shape.lineTo(0, -0.05);  
    shape.lineTo(0, 0);
    
    return shape;
  };

  const bladeExtrudeSettings = {
    steps: 2,
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.02,
    bevelOffset: 0.04,
    bevelSegments: 2
  };

  const innerBladeExtrudeSettings = {
    ...bladeExtrudeSettings,
    depth: 0.06,
    bevelThickness: 0.03,
    bevelSize: 0.025,
    bevelOffset: 0,
    bevelSegments: 6
  };

  
  return (
    <group rotation={[-0.3, 0, 0]}>
      <group 
        ref={swordRef} 
        position={[basePosition[0], basePosition[1], basePosition[2]]}
        rotation={[0, 0, Math.PI]}
        scale={[1.0, 1.0, 1.0]}
      >
        {/* Handle */}
        <group position={[-0.025, -0.45, 0]} rotation={[0, 0, -Math.PI]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.04, 0.9, 12]} />
            <meshStandardMaterial color="#2a3b4c" roughness={0.7} />
          </mesh>
          
          {/* Handle wrappings */}
          {[...Array(8)].map((_, i) => (
            <mesh key={i} position={[0, 0.35 - i * 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.045, 0.016, 8, 16]} />
              <meshStandardMaterial color="#1a2b3c" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
        
        {/* CIRCLE CONNECTION POINT */}
        <group position={[-0.025, 0.28, 0]} rotation={[Math.PI, 1.5, Math.PI]}>
          {/* Large torus */}
          <mesh>
            <torusGeometry args={[0.26, 0.07, 16, 32]} />
            <meshStandardMaterial 
              color="#4a5b6c" 
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          
          {/* Decorative spikes around torus */}
          {[...Array(8)].map((_, i) => (
            <mesh 
              key={`spike-${i}`} 
              position={[
                0.25 * Math.cos(i * Math.PI / 4),
                0.25 * Math.sin(i * Math.PI / 4),
                0
              ]}
              rotation={[0, 0, i * Math.PI / 4 - Math.PI / 2]}
            >
              <coneGeometry args={[0.070, 0.55, 3]} />
              <meshStandardMaterial 
                color="#4a5b6c"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ))}
          
          {/* REAL Core orb -   yellow */}
          <mesh>
            <sphereGeometry args={[0.155, 16, 16]} />
            <meshStandardMaterial
              color={new THREE.Color(0xFFFF00)}         // Pure yellow
              emissive={new THREE.Color(0xff6600)}      // Yellow emission
              emissiveIntensity={1.}                    // Increased intensity
              transparent
              opacity={1}
            />
          </mesh>
          
          {/* Multiple glow layers for depth */}
          <mesh>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={new THREE.Color(0xFFFF00)}
              emissive={new THREE.Color(0xFFFF00)}
              emissiveIntensity={40}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          <mesh>
            <sphereGeometry args={[0.145, 16, 16]} />
            <meshStandardMaterial
              color={new THREE.Color(0xFFFF00)}
              emissive={new THREE.Color(0xFFFF00)}
              emissiveIntensity={35}
              transparent
              opacity={0.6}
            />
          </mesh>
          
          <mesh>
            <sphereGeometry args={[.175, 16, 16]} />
            <meshStandardMaterial
              color={new THREE.Color(0xFFFF00)}
              emissive={new THREE.Color(0xFFFF00)}
              emissiveIntensity={30}
              transparent
              opacity={0.4}
            />
          </mesh>

          {/* Enhanced point light */}
          <pointLight 
            color={new THREE.Color(0xFFFF00)}
            intensity={2}
            distance={0.5}
            decay={2}
          />
        </group>
        
        {/* Blade with enhanced purple */}
        <group position={[0, 0.63, 0.0]} rotation={[0, -Math.PI / 2, Math.PI / 2]}>
          {/* Base blade */}
          <mesh>
            <extrudeGeometry args={[createBladeShape(), bladeExtrudeSettings]} />
            <meshStandardMaterial 
              color={new THREE.Color(0x9932CC)}  // Brighter purple
              emissive={new THREE.Color(0x8783D1)}
              emissiveIntensity={0.8}
              metalness={0.3}
              roughness={0.1}
            />
          </mesh>
          
          {/* BLADE Glowing core */}
          <mesh>
            <extrudeGeometry args={[createInnerBladeShape(), innerBladeExtrudeSettings]} />
            <meshStandardMaterial 
              color={new THREE.Color(0x8783D1)}  // Deep purple
              emissive={new THREE.Color(0x8783D1)}
              emissiveIntensity={2}
              metalness={0.2}
              roughness={0.1}
              opacity={0.8}
              transparent
            />
          </mesh>

        </group>
      </group>
    </group>
  );
} 