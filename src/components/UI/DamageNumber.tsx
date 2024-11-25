import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Vector3, Material, Mesh } from 'three';

interface DamageNumberProps {
  damage: number;
  position: Vector3;
  isCritical?: boolean;
  onComplete: () => void;
}

// Define a more specific type for the text ref
interface TextMesh extends Mesh {
  material: Material & {
    opacity: number;
  };
}

export default function DamageNumber({ damage, position, isCritical = false, onComplete }: DamageNumberProps) {
  const textRef = useRef<TextMesh>(null);
  const startTime = useRef(Date.now());
  const startY = position.y + 3.5;
  
  // Calculate vertical offset for multiple hits
  const hitOffset = (Date.now() % 500) / 500 * 0.5; // 0 to 0.5 based on timestamp

  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const lifespan = 2;
    
    if (elapsed >= lifespan) {
      onComplete();
      return;
    }

    textRef.current.position.y = startY + hitOffset + (elapsed * 0.8);
    textRef.current.material.opacity = 1 - (elapsed / lifespan);
  });

  return (
    <Text
      ref={textRef}
      position={[position.x, startY + hitOffset, position.z]}
      fontSize={0.8}
      color={isCritical ? '#ff0000' : '#ffffff'}
      anchorX="center"
      anchorY="middle"
      fontWeight={isCritical ? 'bold' : 'normal'}
    >
      {damage}
    </Text>
  );
} 