// src/versus/Boss/MeteorTrail.tsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MeteorTrailProps {
  color: THREE.Color;
  size: number;
  meshRef: React.RefObject<THREE.Mesh | THREE.Group>;
}

export default function MeteorTrail({ color, size, meshRef }: MeteorTrailProps) {
  const particlesCount = 8;
  const particlesRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<Float32Array>(new Float32Array(particlesCount * 3));
  const opacitiesRef = useRef<Float32Array>(new Float32Array(particlesCount));
  const scalesRef = useRef<Float32Array>(new Float32Array(particlesCount));
  const isInitialized = useRef(false);

  // Initialize positions with the meteor's initial position
  useEffect(() => {
    if (meshRef.current && !isInitialized.current) {
      const position = meshRef.current.position;

      for (let i = 0; i < particlesCount; i++) {
        positionsRef.current[i * 3] = position.x;
        positionsRef.current[i * 3 + 1] = position.y;
        positionsRef.current[i * 3 + 2] = position.z;
        opacitiesRef.current[i] = 0;
        scalesRef.current[i] = 0;
      }
      isInitialized.current = true;
    }
  }, [meshRef]);

  useFrame(() => {
    if (!particlesRef.current?.parent || !meshRef.current || !isInitialized.current) return;

    const position = meshRef.current.position;

    // Update trail positions with upward spacing for falling meteor
    for (let i = particlesCount - 1; i > 0; i--) {
      positionsRef.current[i * 3] = positionsRef.current[(i - 1) * 3];
      positionsRef.current[i * 3 + 1] = positionsRef.current[(i - 1) * 3 + 1] + 0.5; // minus to plus for upward trail
      positionsRef.current[i * 3 + 2] = positionsRef.current[(i - 1) * 3 + 2];

      // Keep the same opacity and scale adjustments
      opacitiesRef.current[i] = Math.pow((1 - i / particlesCount), 0.3) * 0.9;
      scalesRef.current[i] = size * (2 - (i / particlesCount) * 0.5);
    }

    // Update the head of the trail
    positionsRef.current[0] = position.x;
    positionsRef.current[1] = position.y;
    positionsRef.current[2] = position.z;
    opacitiesRef.current[0] = 0.9; // Increased from 0.8
    scalesRef.current[0] = size * 0.8; // Increased from 5

    // Update geometry
    if (particlesRef.current) {
      const geometry = particlesRef.current.geometry;
      (geometry.attributes.position as THREE.BufferAttribute).array = positionsRef.current;
      geometry.attributes.position.needsUpdate = true;

      if (geometry.attributes.opacity) {
        (geometry.attributes.opacity as THREE.BufferAttribute).array = opacitiesRef.current;
        geometry.attributes.opacity.needsUpdate = true;
      }

      if (geometry.attributes.scale) {
        (geometry.attributes.scale as THREE.BufferAttribute).array = scalesRef.current;
        geometry.attributes.scale.needsUpdate = true;
      }
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positionsRef.current}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={particlesCount}
          array={opacitiesRef.current}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={particlesCount}
          array={scalesRef.current}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float opacity;
          attribute float scale;
          varying float vOpacity;
          void main() {
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = scale * 45.0 * (300.0 / -mvPosition.z);
          }
        `}
        fragmentShader={`
          varying float vOpacity;
          uniform vec3 uColor;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            float strength = smoothstep(0.5, 0.1, d);
            vec3 glowColor = mix(uColor, vec3(1.0), 0.4);
            gl_FragColor = vec4(glowColor, vOpacity * strength);
          }
        `}
        uniforms={{
          uColor: { value: color },
        }}
      />
    </points>
  );
}