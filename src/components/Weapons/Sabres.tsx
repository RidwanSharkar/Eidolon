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
  
    const leftBasePosition = [-0.8, 0.75, 0.75] as const;
    const rightBasePosition = [0.8, 0.75, 0.75] as const;
  
    // Ref for tracking right swing delay
    const rightSwingDelay = useRef(0);
  
    // Add a new ref to track swing completion
    const isSwingComplete = useRef(false);
  
    // Add a ref for left swing delay
    const leftSwingDelay = useRef(0);
  
    useFrame((_, delta) => {
      if (isSwinging) {
        if (!isSwingComplete.current) {
          // Handle left sabre swing with delay
          if (leftSabreRef.current) {
            if (leftSwingDelay.current < 0.15) {  // 0.15 seconds delay
              leftSwingDelay.current += delta;
            } else {
              if (leftSwingProgress.current === 0) {
                onLeftSwingStart();
              }
              leftSwingProgress.current += delta * 7;
  
              const swingPhase = Math.min(leftSwingProgress.current / Math.PI, 1);
  
              // Adjusted left sabre movement to swing towards front center
              const pivotX = leftBasePosition[0] + Math.sin(swingPhase * Math.PI) * 1.2;  // Increased X movement
              const pivotY = leftBasePosition[1] + 
                (Math.sin(swingPhase * Math.PI * 2) * -0.3);  // Reduced Y movement
              const pivotZ = leftBasePosition[2] + 
                (Math.sin(swingPhase * Math.PI) * 2.0);  // Increased forward movement
  
              leftSabreRef.current.position.set(pivotX, pivotY, pivotZ);
  
              // Adjusted rotation for more natural front-center swing
              const rotationX = Math.sin(swingPhase * Math.PI) * (Math.PI * 0.5);
              const rotationY = Math.sin(swingPhase * Math.PI) * (Math.PI * 0.3);
              const rotationZ = Math.sin(swingPhase * Math.PI) * (Math.PI * 0.2);
  
              leftSabreRef.current.rotation.set(rotationX, rotationY, rotationZ);
  
              if (leftSwingProgress.current >= Math.PI) {
                leftSwingProgress.current = 0;
                leftSwingDelay.current = 0;
                leftSabreRef.current.rotation.set(0, 0, 0);
                leftSabreRef.current.position.set(...leftBasePosition);
              }
            }
          }
  
          // Handle right sabre swing (starts immediately)
          if (rightSabreRef.current) {
            if (rightSwingProgress.current === 0) {
              onRightSwingStart();
            }
            rightSwingProgress.current += delta * 7;
  
            const swingPhase = Math.min(rightSwingProgress.current / Math.PI, 1);
  
            // Adjusted right sabre movement to mirror left sabre
            const pivotX = rightBasePosition[0] - Math.sin(swingPhase * Math.PI) * 1.2;  // Mirror of left X movement
            const pivotY = rightBasePosition[1] + 
              (Math.sin(swingPhase * Math.PI * 2) * -0.3);  // Same Y movement
            const pivotZ = rightBasePosition[2] + 
              (Math.sin(swingPhase * Math.PI) * 2.0);  // Same forward movement
  
            rightSabreRef.current.position.set(pivotX, pivotY, pivotZ);
  
            // Adjusted rotation to mirror left sabre
            const rotationX = Math.sin(swingPhase * Math.PI) * (Math.PI * 0.5);
            const rotationY = -Math.sin(swingPhase * Math.PI) * (Math.PI * 0.3);  // Negated for mirror
            const rotationZ = -Math.sin(swingPhase * Math.PI) * (Math.PI * 0.2);  // Negated for mirror
  
            rightSabreRef.current.rotation.set(rotationX, rotationY, rotationZ);
  
            if (rightSwingProgress.current >= Math.PI) {
              rightSwingProgress.current = 0;
              rightSwingDelay.current = 0;
              rightSabreRef.current.rotation.set(0, 0, 0);
              rightSabreRef.current.position.set(...rightBasePosition);
              isSwingComplete.current = true;
              onSwingComplete();
            }
          }
        }
      } else {
        // Reset all values when not swinging
        rightSwingProgress.current = 0;
        rightSwingDelay.current = 0;
        leftSwingProgress.current = 0;
        leftSwingDelay.current = 0;  // Reset left delay
        isSwingComplete.current = false;
  
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
  
    // Create custom sabre blade shape (curved ornate style)
    const createBladeShape = () => {
      const shape = new Shape();
  
      // Start at center
      shape.moveTo(0, 0);
  
      // Ornate guard shape
      shape.lineTo(-0.15, 0.1);
      shape.lineTo(-0.2, 0);  // Deeper notch
      shape.lineTo(-0.2, -0.05);
      shape.lineTo(0, 0);
  
      // Mirror for right side of guard
      shape.lineTo(0.15, 0.1);
      shape.lineTo(0.2, 0);   // Deeper notch
      shape.lineTo(0.3, 0.0);
      shape.lineTo(0, 0);
  
      // Elegant curved blade shape
      shape.lineTo(0, 0.05);
      // Graceful curve up
      shape.quadraticCurveTo(0.3, 0.15, 0.5, 0.2);
      shape.quadraticCurveTo(0.7, 0.25, 0.9, 0.15);
      // Sharp elegant tip
      shape.quadraticCurveTo(1.0, 0.1, 1.1, 0);
      // Sweeping bottom curve with notch
      shape.quadraticCurveTo(1.0, -0.05, 0.8, -0.1);
      // Distinctive notch
      shape.lineTo(0.7, -0.15);
      shape.lineTo(0.65, -0.1);
      // Continue curve to handle
      shape.quadraticCurveTo(0.4, -0.08, 0.2, -0.05);
      shape.quadraticCurveTo(0.1, -0.02, 0, 0);
  
      return shape;
    };
  
    // Make inner blade shape match outer blade shape more closely
    const createInnerBladeShape = () => {
      const shape = new Shape();
  
      // Start at center
      shape.moveTo(0, 0);
  
      // Ornate guard shape (slightly smaller)
      shape.lineTo(-0.13, 0.08);
      shape.lineTo(-0.18, 0);
      shape.lineTo(-0.08, -0.04);
      shape.lineTo(0, 0);
  
      // Mirror for right side
      shape.lineTo(0.13, 0.08);
      shape.lineTo(0.18, 0);
      shape.lineTo(0.08, -0.04);
      shape.lineTo(0, 0);
  
      // Elegant curved blade shape (slightly smaller)
      shape.lineTo(0, 0.04);
      // Graceful curve up
      shape.quadraticCurveTo(0.28, 0.13, 0.48, 0.18);
      shape.quadraticCurveTo(0.68, 0.23, 0.88, 0.13);
      // Sharp elegant tip
      shape.quadraticCurveTo(0.98, 0.08, 1.08, 0);
      // Sweeping bottom curve with notch
      shape.quadraticCurveTo(0.98, -0.04, 0.78, -0.08);
      // Distinctive notch
      shape.lineTo(0.68, -0.13);
      shape.lineTo(0.63, -0.08);
      // Continue curve to handle
      shape.quadraticCurveTo(0.38, -0.06, 0.18, -0.04);
      shape.quadraticCurveTo(0.08, -0.02, 0, 0);
  
      return shape;
    };
  
    // Update blade extrude settings for an even thinner blade
    const bladeExtrudeSettings = {
      steps: 2,
      depth: 0.02, // Even thinner blade
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.008,
      bevelSegments: 3,
    };
  
    const innerBladeExtrudeSettings = {
      ...bladeExtrudeSettings,
      depth: 0.025,
      bevelThickness: 0.003,
      bevelSize: 0.004,
      bevelOffset: 0,
    };
  
    return (
      <group 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]}
        scale={[0.8, 0.8, 0.8]}
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
          <group position={[0, 0.3, 0.0]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
            {/* Base blade - making it more intense */}
            <mesh>
              <extrudeGeometry args={[createBladeShape(), bladeExtrudeSettings]} />
              <meshStandardMaterial 
                color="#00ffff"  // Pure cyan base
                emissive="#00ffff"  // Added emissive to base layer
                emissiveIntensity={2}
                metalness={0.9}
                roughness={0.2}
                opacity={0.9}
                transparent
              />
            </mesh>
            
            {/* Inner glow - super bright blue core */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), innerBladeExtrudeSettings]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#00ffff"  // Pure cyan
                emissiveIntensity={12}  // Dramatically increased
                metalness={0.9}
                roughness={0.1}
                opacity={0.95}
                transparent
              />
            </mesh>
            
            {/* Middle ethereal layer */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), {
                ...innerBladeExtrudeSettings,
                depth: 0.04
              }]} />
              <meshStandardMaterial 
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={8}  // Increased
                metalness={0.8}
                roughness={0.1}
                opacity={0.7}
                transparent
              />
            </mesh>
            
            {/* Outer ethereal glow */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), {
                ...innerBladeExtrudeSettings,
                depth: 0.06  // Increased depth for more glow
              }]} />
              <meshStandardMaterial 
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={6}
                metalness={0.7}
                roughness={0.1}
                opacity={0.4}
                transparent
              />
            </mesh>
            
            {/* Additional outer glow for extra intensity */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), {
                ...innerBladeExtrudeSettings,
                depth: 0.08
              }]} />
              <meshStandardMaterial 
                color="#80ffff"
                emissive="#80ffff"
                emissiveIntensity={4}
                metalness={0.6}
                roughness={0.1}
                opacity={0.2}
                transparent
              />
            </mesh>
            
            {/* Add point light for local illumination */}
            <pointLight
              color="#00ffff"
              intensity={4}
              distance={2}
              decay={2}
            />
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
          <group position={[0, 0.3, 0.0]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
            {/* Base blade - making it more translucent */}
            <mesh>
              <extrudeGeometry args={[createBladeShape(), bladeExtrudeSettings]} />
              <meshStandardMaterial 
                color="#d8f2ff"  // Light blue base
                metalness={0.3}
                roughness={0.2}
                opacity={0.6}    // More translucent
                transparent
              />
            </mesh>
            
            {/* Inner glow - bright blue core */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), innerBladeExtrudeSettings]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#40a0ff"  // Bright blue
                emissiveIntensity={8}  // Increased intensity
                metalness={0.1}
                roughness={0.1}
                opacity={0.9}
                transparent
              />
            </mesh>
            
            {/* Middle ethereal layer */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), {
                ...innerBladeExtrudeSettings,
                depth: 0.035
              }]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#80c0ff"  // Lighter blue
                emissiveIntensity={6}
                metalness={0.1}
                roughness={0.1}
                opacity={0.5}
                transparent
              />
            </mesh>
            
            {/* Outer ethereal glow */}
            <mesh>
              <extrudeGeometry args={[createInnerBladeShape(), {
                ...innerBladeExtrudeSettings,
                depth: 0.05
              }]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#a0d8ff"  // Very light blue
                emissiveIntensity={4}
                metalness={0.1}
                roughness={0.1}
                opacity={0.3}
                transparent
              />
            </mesh>
          </group>
        </group>
      </group>
    );
  }