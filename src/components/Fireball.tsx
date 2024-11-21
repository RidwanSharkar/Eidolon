import React, { useRef, useState } from 'react';
import { Mesh, Vector3, Clock, Color } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import FireballTrail from './FireballTrail';
import * as THREE from 'three';
import Explosion from './Explosion';

interface FireballProps {
  position: Vector3;
  direction: Vector3;
  onImpact: () => void;
}

export default function Fireball({ position, direction, onImpact }: FireballProps) {
  const fireballRef = useRef<Mesh>(null);
  const clock = useRef(new Clock());
  const speed = 0.5;
  const lifespan = 10;
  const isExploding = useRef(false);
  const currentPosition = useRef(position.clone());
  const { scene } = useThree();
  const size = 0.3;
  const color = new Color('#00ff44');
  const collisionPoint = useRef<Vector3 | null>(null);
  const [explosions, setExplosions] = useState<JSX.Element[]>([]);

  const checkCollision = (nextPosition: Vector3): boolean => {
    const raycaster = new THREE.Raycaster();
    const rayDirection = nextPosition.clone().sub(currentPosition.current).normalize();
    raycaster.set(currentPosition.current, rayDirection);

    const collidableObjects = scene.children.filter(child => 
      (child.name === 'mountain' && child instanceof THREE.Group) ||
      (child.name === 'tree' && child instanceof THREE.Group)
    );

    const allMeshes = collidableObjects.flatMap(group => {
      const meshes: THREE.Mesh[] = [];
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshes.push(child);
        }
      });
      return meshes;
    });

    const intersects = raycaster.intersectObjects(allMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const movementDistance = currentPosition.current.distanceTo(nextPosition);
      if (hit.distance <= movementDistance) {
        collisionPoint.current = hit.point.clone();
        return true;
      }
    }

    return false;
  };

  // Function to remove explosion from state
  const removeExplosion = (key: string) => {
    setExplosions(prev => prev.filter(explosion => explosion.key !== key));
  };

  const startExplosion = () => {
    if (!isExploding.current && collisionPoint.current instanceof Vector3) {
      isExploding.current = true;
      if (fireballRef.current) {
        fireballRef.current.visible = false;
      }
      onImpact();

      const explosionKey = `explosion-${Date.now()}`;
      
      const explosionPosition = collisionPoint.current.clone();
      
      setExplosions(prev => [
        ...prev,
        <Explosion
          key={explosionKey}
          position={explosionPosition}
          color="#00ff44"
          size={2}
          duration={1}
          particleCount={100}
          onComplete={() => {
            removeExplosion(explosionKey);
            if (fireballRef.current) {
              fireballRef.current.removeFromParent();
            }
          }}
        />
      ]);
    }
  };

  useFrame((_, delta) => {
    if (!fireballRef.current || isExploding.current) return;

    if (clock.current.getElapsedTime() > lifespan) {
      fireballRef.current.removeFromParent();
      return;
    }

    const movement = direction.clone().multiplyScalar(speed * delta * 60);
    const nextPosition = currentPosition.current.clone().add(movement);

    // Check for collisions before moving
    if (checkCollision(nextPosition)) {
      startExplosion();
    } else {
      currentPosition.current.copy(nextPosition);
      fireballRef.current.position.copy(currentPosition.current);
    }
  });

  return (
    <group name="fireball-group">
      <mesh ref={fireballRef} position={currentPosition.current}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={2}
          toneMapped={false}
        />
        <pointLight color={color} intensity={8} distance={12} />
      </mesh>

      {!isExploding.current && (
        <FireballTrail
          color={color}
          size={size}
          meshRef={fireballRef}
          opacity={1}
        />
      )}
      {explosions}
    </group>
  );
}