import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FireballTrailProps {
  color: THREE.Color;
  size: number;
  meshRef: React.RefObject<THREE.Mesh>;
  opacity?: number;
}

const FireballTrail: React.FC<FireballTrailProps> = ({
  color,
  size,
  meshRef,
  opacity = 1
}) => {
  const particlesCount = 30;
  const particlesRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<Float32Array>(new Float32Array(particlesCount * 3));
  const opacitiesRef = useRef<Float32Array>(new Float32Array(particlesCount));
  const scalesRef = useRef<Float32Array>(new Float32Array(particlesCount));

  useFrame(() => {
    if (!particlesRef.current?.parent || !meshRef.current) return;

    const { x, y, z } = meshRef.current.position;

    for (let i = particlesCount - 1; i > 0; i--) {
      positionsRef.current[i * 3] = positionsRef.current[(i - 1) * 3];
      positionsRef.current[i * 3 + 1] = positionsRef.current[(i - 1) * 3 + 1];
      positionsRef.current[i * 3 + 2] = positionsRef.current[(i - 1) * 3 + 2];

      opacitiesRef.current[i] = Math.pow((1 - i / particlesCount), 2) * 0.5 * opacity;
      scalesRef.current[i] = size * 0.8 * Math.pow((1 - i / particlesCount), 0.5);
    }

    positionsRef.current[0] = x;
    positionsRef.current[1] = y;
    positionsRef.current[2] = z;
    opacitiesRef.current[0] = 0.6 * opacity;
    scalesRef.current[0] = size * 1.2;

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
            gl_PointSize = scale * 20.0 * (300.0 / -mvPosition.z);
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
};

export default FireballTrail; 