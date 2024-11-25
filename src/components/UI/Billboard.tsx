import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group, Vector3 } from 'three';

interface BillboardProps {
  children: React.ReactNode;
  position?: [number, number, number];
  lockX?: boolean;
  lockY?: boolean;
  lockZ?: boolean;
}

export default function Billboard({ 
  children, 
  position = [0, 0, 0],
  lockX = false,
  lockY = false,
  lockZ = false
}: BillboardProps) {
  const groupRef = useRef<Group>(null);

  useFrame(({ camera }) => {
    if (!groupRef.current) return;

    const billboardPosition = groupRef.current.position;
    const cameraPosition = camera.position;

    // Calculate direction to camera
    const direction = new Vector3().subVectors(cameraPosition, billboardPosition);
    
    // Create rotation based on camera direction
    const rotation = groupRef.current.rotation.clone();
    
    if (!lockY) rotation.y = Math.atan2(direction.x, direction.z);
    if (!lockX) rotation.x = Math.atan2(-direction.y, Math.sqrt(direction.x * direction.x + direction.z * direction.z));
    if (!lockZ) rotation.z = 0;

    // Apply rotation
    groupRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
  });

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
} 