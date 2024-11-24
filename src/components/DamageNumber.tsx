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
  const startY = position.y + 2; // Start above the target

  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const lifespan = 3; // 3 seconds duration
    
    if (elapsed >= lifespan) {
      onComplete();
      return;
    }

    // Float upward and fade out
    textRef.current.position.y = startY + (elapsed * 0.5);
    textRef.current.material.opacity = 1 - (elapsed / lifespan);
  });

  return (
    <Text
      ref={textRef}
      position={[position.x, startY, position.z]}
      fontSize={0.5}
      color={isCritical ? '#ff0000' : '#ffffff'}
      anchorX="center"
      anchorY="middle"
      fontWeight={isCritical ? 'bold' : 'normal'}
    >
      {isCritical ? ' ' : ''}{damage}
    </Text>
  );
} 