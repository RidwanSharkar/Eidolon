import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Material, Mesh } from 'three';

interface DamageNumberProps {
  damage: number;
  position: Vector3;
  isCritical?: boolean;
  isLightning?: boolean;
  onComplete: () => void;
}

// Define a more specific type for the text ref
interface TextMesh extends Mesh {
  material: Material & {
    opacity: number;
  };
}

export default function DamageNumber({ damage, position, isCritical = false, isLightning = false, onComplete }: DamageNumberProps) {
  const textRef = useRef<TextMesh>(null);
  const startTime = useRef(Date.now());
  const startY = position.y + 3.5;
  const { camera } = useThree();
  
  // Adjust offsets for better spacing
  const timeOffset = (Date.now() % 1000) / 1000;
  const horizontalOffset = Math.sin(timeOffset * Math.PI * 2) * 0.3;
  const verticalOffset = Math.cos(timeOffset * Math.PI * 2) * 0.2;

  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const lifespan = 1.5;
    
    if (elapsed >= lifespan) {
      onComplete();
      return;
    }

    // Make text always face the camera
    textRef.current.quaternion.copy(camera.quaternion);
    
    // Smooth movement using easing
    const progress = elapsed / lifespan;
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    
    const floatHeight = startY + (easedProgress * 1.2);
    const finalY = floatHeight + verticalOffset;
    const finalX = position.x + horizontalOffset;
    
    textRef.current.position.set(
      finalX,
      finalY,
      position.z
    );
    
    textRef.current.material.opacity = Math.min(1, 3 * (1 - progress));
  });

  return (
    <Text
      ref={textRef}
      position={[position.x, startY, position.z]}
      fontSize={0.5}
      color={isCritical ? "#ff0000" : (isLightning ? "#ffff00" : "#ffffff")}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.1}
      outlineColor="#000000"
      material-transparent={true}
      material-depthTest={false}
    >
      {damage}
    </Text>
  );
} 