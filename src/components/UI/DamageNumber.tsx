import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
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
  
  // Adjust offsets for better spacing
  const timeOffset = (Date.now() % 1000) / 1000;
  const horizontalOffset = Math.sin(timeOffset * Math.PI * 2) * 0.3; // Reduced from 0.5
  const verticalOffset = Math.cos(timeOffset * Math.PI * 2) * 0.2; // Reduced from 0.3

  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const lifespan = 1.5; // Reduced from 2.0 for snappier feedback
    
    if (elapsed >= lifespan) {
      onComplete();
      return;
    }

    // Smooth movement using easing
    const progress = elapsed / lifespan;
    const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic easing out
    
    // Smooth floating motion
    const floatHeight = startY + (easedProgress * 1.2); // Reduced vertical travel
    const finalY = floatHeight + verticalOffset;
    const finalX = position.x + horizontalOffset;
    
    // Apply smooth position updates
    textRef.current.position.set(
      finalX,
      finalY,
      position.z
    );
    
    // Smooth opacity transition
    textRef.current.material.opacity = Math.min(1, 3 * (1 - progress));
  });

  return (
    <Text
      ref={textRef}
      position={[position.x + horizontalOffset, startY + verticalOffset, position.z]}
      fontSize={isCritical ? 1.0 : 0.8}
      color={isCritical ? '#ff0000' : isLightning ? '#ffdb4d' : '#ffffff'}
      anchorX="center"
      anchorY="middle"
      fontWeight={isCritical ? 'bold' : 'normal'}
    >
      {damage}
    </Text>
  );
} 