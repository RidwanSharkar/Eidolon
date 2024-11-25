interface SabreProps {
    isSwinging: boolean;
    onSwingComplete: () => void;
    onLeftSwingStart: () => void;
    onRightSwingStart: () => void;
}
  
  import { useRef } from 'react';
  import { Group, Shape } from 'three';
  import { useFrame } from '@react-three/fiber';
  
  export default function Sabre({ isSwinging, onSwingComplete, onLeftSwingStart, onRightSwingStart }: SabreProps) {
    // Refs and states for the left sabre
    const leftSabreRef = useRef<Group>(null);
    const leftSwingProgress = useRef(0);
  
    // Refs and states for the right sabre
    const rightSabreRef = useRef<Group>(null);
    const rightSwingProgress = useRef(0);
  
    const leftBasePosition = [-1.2, 0.75, -0] as const;
    const rightBasePosition = [1.2, 0.75, -0] as const;
  
    // Ref for tracking right swing delay
    const rightSwingDelay = useRef(0);
  
    useFrame((_, delta) => {
      if (isSwinging) {
        // Handle left sabre swing
        if (leftSabreRef.current) {
          // Call onLeftSwingStart when the swing begins
          if (leftSwingProgress.current === 0) {
            onLeftSwingStart();
          }
          leftSwingProgress.current += delta * 7; // Slightly faster swing
  
          const swingPhase = Math.min(leftSwingProgress.current / Math.PI, 1);
  
          // Arc movement for a more sabre-like slash
          const pivotX = leftBasePosition[0] + Math.sin(swingPhase * Math.PI) * 2.5;
          const pivotY = leftBasePosition[1] + Math.sin(swingPhase * Math.PI) * -1.0;
          const pivotZ = leftBasePosition[2] + Math.cos(swingPhase * Math.PI) * 2.0;
  
          leftSabreRef.current.position.set(pivotX, pivotY, pivotZ);
  
          // Rotation for a diagonal slash
          const rotationX = Math.sin(swingPhase * Math.PI * 0.8) * (Math.PI / 3);
          const rotationY = Math.sin(swingPhase * Math.PI) * Math.PI;
          const rotationZ = Math.sin(swingPhase * Math.PI * 0.9) * (Math.PI / 3);
  
          leftSabreRef.current.rotation.set(rotationX, rotationY, rotationZ);
  
          if (leftSwingProgress.current >= Math.PI) {
            leftSwingProgress.current = 0;
            leftSabreRef.current.rotation.set(0, 0, 0);
            leftSabreRef.current.position.set(leftBasePosition[0], leftBasePosition[1], leftBasePosition[2]);
            onSwingComplete();
          }
        }
  
        // Handle right sabre swing with delay
        if (rightSabreRef.current) {
          if (rightSwingDelay.current < 0.1) {
            rightSwingDelay.current += delta;
          } else {
            // Call onRightSwingStart when the delayed swing begins
            if (rightSwingProgress.current === 0) {
              onRightSwingStart();
            }
            rightSwingProgress.current += delta * 7; // Slightly faster swing
  
            const swingPhase = Math.min(rightSwingProgress.current / Math.PI, 1);
  
            // Arc movement for a more sabre-like slash (opposite direction)
            const pivotX = rightBasePosition[0] - Math.sin(swingPhase * Math.PI) * 2.5;
            const pivotY = rightBasePosition[1] + Math.sin(swingPhase * Math.PI) * -1.0;
            const pivotZ = rightBasePosition[2] - Math.cos(swingPhase * Math.PI) * 2.0;
  
            rightSabreRef.current.position.set(pivotX, pivotY, pivotZ);
  
            // Rotation for a diagonal slash (opposite rotation)
            const rotationX = Math.sin(swingPhase * Math.PI * 0.8) * (-Math.PI / 3);
            const rotationY = Math.sin(swingPhase * Math.PI) * (-Math.PI);
            const rotationZ = Math.sin(swingPhase * Math.PI * 0.9) * (-Math.PI / 3);
  
            rightSabreRef.current.rotation.set(rotationX, rotationY, rotationZ);
  
            if (rightSwingProgress.current >= Math.PI) {
              rightSwingProgress.current = 0;
              rightSabreRef.current.rotation.set(0, 0, 0);
              rightSabreRef.current.position.set(rightBasePosition[0], rightBasePosition[1], rightBasePosition[2]);
              onSwingComplete();
            }
          }
        }
      } else {
        // Reset delays and swing progress when not swinging
        rightSwingDelay.current = 0;
  
        // Smooth return to the initial position for left sabre
        if (leftSabreRef.current) {
          leftSabreRef.current.rotation.x *= 0.85;
          leftSabreRef.current.rotation.y *= 0.85;
          leftSabreRef.current.rotation.z *= 0.85;
  
          leftSabreRef.current.position.x += (leftBasePosition[0] - leftSabreRef.current.position.x) * 0.20;
          leftSabreRef.current.position.y += (leftBasePosition[1] - leftSabreRef.current.position.y) * 0.20;
          leftSabreRef.current.position.z += (leftBasePosition[2] - leftSabreRef.current.position.z) * 0.20;
        }
  
        // Smooth return to the initial position for right sabre
        if (rightSabreRef.current) {
          rightSabreRef.current.rotation.x *= 0.85;
          rightSabreRef.current.rotation.y *= 0.85;
          rightSabreRef.current.rotation.z *= 0.85;
  
          rightSabreRef.current.position.x += (rightBasePosition[0] - rightSabreRef.current.position.x) * 0.20;
          rightSabreRef.current.position.y += (rightBasePosition[1] - rightSabreRef.current.position.y) * 0.20;
          rightSabreRef.current.position.z += (rightBasePosition[2] - rightSabreRef.current.position.z) * 0.20;
        }
      }
    });
  
    // Create custom sabre blade shape
    const createBladeShape = () => {
      const shape = new Shape();
  
      // Start at center
      shape.moveTo(0, 0);
  
      // Narrow guard shape - scaled up by ~20%
      shape.lineTo(-0.15, 0.09);    // Increased from -0.125, 0.075
      shape.lineTo(-0.09, -0.09);   // Increased from -0.075, -0.075
      shape.lineTo(0, 0);
  
      // Mirror for right side
      shape.lineTo(0.15, 0.09);     // Increased from 0.125, 0.075
      shape.lineTo(0.09, -0.09);    // Increased from 0.075, -0.075
      shape.lineTo(0, 0);
  
      // Narrow blade shape - scaled up by ~20%
      shape.lineTo(0, 0.072);       // Increased from 0.06
      shape.lineTo(0.15, 0.15);     // Increased from 0.125, 0.125
      shape.quadraticCurveTo(0.6, 0.12, 0.9, 0.15);    // Increased from 0.5, 0.1, 0.75, 0.125
      shape.quadraticCurveTo(1.2, 0.09, 1.32, 0);      // Increased from 1.0, 0.075, 1.1, 0
      shape.quadraticCurveTo(1.2, -0.09, 0.9, -0.15);  // Increased from 1.0, -0.075, 0.75, -0.125
      shape.quadraticCurveTo(0.6, -0.12, 0.15, -0.15); // Increased from 0.5, -0.1, 0.125, -0.125
      shape.lineTo(0, -0.072);      // Increased from -0.06
      shape.lineTo(0, 0);
  
      return shape;
    };
  
    // Make inner blade shape match outer blade shape more closely
    const createInnerBladeShape = () => {
      const shape = new Shape();
  
      // Start at center
      shape.moveTo(0, 0);
  
      // Match outer guard shape but slightly smaller
      shape.lineTo(-0.12, 0.108);   // Increased from -0.1, 0.09
      shape.lineTo(-0.072, -0.108); // Increased from -0.06, -0.09
      shape.lineTo(0, 0);
  
      // Mirror for right side
      shape.lineTo(0.12, 0.108);    // Increased from 0.1, 0.09
      shape.lineTo(0.072, -0.108);  // Increased from 0.06, -0.09
      shape.lineTo(0, 0);
  
      // Match outer blade shape but slightly smaller
      shape.lineTo(0, 0.06);
      shape.lineTo(0.12, 0.12);     // Increased from 0.1, 0.1
      shape.quadraticCurveTo(0.6, 0.09, 0.9, 0.12);   // Increased from 0.5, 0.075, 0.75, 0.1
      shape.quadraticCurveTo(1.2, 0.072, 1.32, 0);    // Increased from 1.0, 0.06, 1.1, 0
      shape.quadraticCurveTo(1.2, -0.072, 0.9, -0.12); // Increased from 1.0, -0.06, 0.75, -0.1
      shape.quadraticCurveTo(0.6, -0.09, 0.12, -0.12); // Increased from 0.5, -0.075, 0.1, -0.1
      shape.lineTo(0, -0.06);
      shape.lineTo(0, 0);
  
      return shape;
    };
  
    const bladeExtrudeSettings = {
      steps: 2,
      depth: 0.024,           // Increased from 0.02
      bevelEnabled: true,
      bevelThickness: 0.006,  // Increased from 0.005
      bevelSize: 0.012,       // Increased from 0.01
      bevelSegments: 2,
    };
  
    const innerBladeExtrudeSettings = {
      ...bladeExtrudeSettings,
      depth: 0.036,           // Increased from 0.03
      bevelThickness: 0.006,  // Increased from 0.005
      bevelSize: 0.006,       // Increased from 0.005
      bevelOffset: 0,
    };
  
    return (
      <group 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]}
        scale={[1.0, 1.0, 1.0]}  // Increased from [0.8, 0.8, 0.8]
      >
        {/* Left Sabre */}
        <group 
          ref={leftSabreRef} 
          position={[leftBasePosition[0], leftBasePosition[1], leftBasePosition[2]]}
          rotation={[0, 0, Math.PI]}
          scale={[1, 1, 1]}
        >
          {/* Handle */}
          <group position={[0, -0.2, 0]} rotation={[0, 0, -Math.PI]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.02, 0.45, 12]} />
              <meshStandardMaterial color="#2a3b4c" roughness={0.7} />
            </mesh>
            
            {/* Handle wrappings */}
            {[...Array(4)].map((_, i) => (
              <mesh key={i} position={[0, 0.175 - i * 0.065, 0]}>
                <torusGeometry args={[0.0225, 0.004, 8, 16]} />
                <meshStandardMaterial color="#1a2b3c" metalness={0.6} roughness={0.4} />
              </mesh>
            ))}
          </group>
          
          {/* Blade */}
          <group position={[0, 0.3, 0.0]} rotation={[0, -Math.PI / 2, Math.PI / 2]}>
            {/* Base blade */}
            <mesh>
              <extrudeGeometry args={[createBladeShape(), bladeExtrudeSettings]} />
              <meshStandardMaterial 
                color="#ff1a1a"
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
            
            {/* Glowing core */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), innerBladeExtrudeSettings]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#ff0000"
                emissiveIntensity={5}
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
                color="#ff3333"
                emissive="#ff0000"
                emissiveIntensity={4}
                metalness={0.2}
                roughness={0.1}
                opacity={0.4}
                transparent
              />
            </mesh>
          </group>
        </group>
  
        {/* Right Sabre */}
        <group 
          ref={rightSabreRef} 
          position={[rightBasePosition[0], rightBasePosition[1], rightBasePosition[2]]}
          rotation={[0, 0, Math.PI]}
          scale={[1, 1, 1]}
        >
          {/* Handle */}
          <group position={[0, -0.2, 0]} rotation={[0, 0, -Math.PI]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.02, 0.45, 12]} />
              <meshStandardMaterial color="#2a3b4c" roughness={0.7} />
            </mesh>
            
            {/* Handle wrappings */}
            {[...Array(4)].map((_, i) => (
              <mesh key={i} position={[0, 0.175 - i * 0.065, 0]}>
                <torusGeometry args={[0.0225, 0.004, 8, 16]} />
                <meshStandardMaterial color="#1a2b3c" metalness={0.6} roughness={0.4} />
              </mesh>
            ))}
          </group>
          
          {/* Blade */}
          <group position={[0, 0.3, 0.0]} rotation={[0, -Math.PI / 2, Math.PI / 2]}>
            {/* Base blade */}
            <mesh>
              <extrudeGeometry args={[createBladeShape(), bladeExtrudeSettings]} />
              <meshStandardMaterial 
                color="#ff1a1a"
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
            
            {/* Glowing core */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), innerBladeExtrudeSettings]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#ff0000"
                emissiveIntensity={5}
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
                color="#ff3333"
                emissive="#ff0000"
                emissiveIntensity={4}
                metalness={0.2}
                roughness={0.1}
                opacity={0.4}
                transparent
              />
            </mesh>
          </group>
        </group>
      </group>
    );
  }