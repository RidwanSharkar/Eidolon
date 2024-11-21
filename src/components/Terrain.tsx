import { Mesh, Shape, DoubleSide } from 'three';
import React, { useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

export default function Terrain() {
  const terrainRef = useRef<Mesh>(null);
  const grassTexture = useLoader(TextureLoader, '/textures/grass.png');
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);

  const octagon = new Shape();
  const radius = 50; // Adjust the size as needed
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    if (i === 0) {
      octagon.moveTo(x, z);
    } else {
      octagon.lineTo(x, z);
    }
  }
  octagon.closePath();

  return (
    <mesh ref={terrainRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <shapeGeometry args={[octagon]} />
      <meshStandardMaterial
        map={grassTexture}
        side={DoubleSide}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
}