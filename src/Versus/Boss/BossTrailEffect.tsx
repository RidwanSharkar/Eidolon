// src/versus/Boss/BossTrailEffect.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BossTrailEffectProps {
  parentRef: React.RefObject<THREE.Group>;
}

const BossTrailEffect: React.FC<BossTrailEffectProps> = ({ parentRef }) => {
  const particlesCount = 8;
  const particlesRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<Float32Array>(new Float32Array(particlesCount * 3));
  const opacitiesRef = useRef<Float32Array>(new Float32Array(particlesCount));
  const scalesRef = useRef<Float32Array>(new Float32Array(particlesCount));
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!particlesRef.current?.parent || !parentRef.current) return;
    
    timeRef.current += delta;
    const bossPosition = parentRef.current.position;
    
    // Create a spiral pattern
    for (let i = 0; i < particlesCount; i++) {
      const angle = (i / particlesCount) * Math.PI * 2 + timeRef.current;
      const radius =  + Math.sin(timeRef.current * 2 + i * 0.2) * 0.1;
      
      positionsRef.current[i * 3] = bossPosition.x + Math.cos(angle) * radius;
      positionsRef.current[i * 3 + 1] = bossPosition.y + Math.sin(timeRef.current + i * 0.1) * 0.0001;
      positionsRef.current[i * 3 + 2] = bossPosition.z + Math.sin(angle) * radius;

      opacitiesRef.current[i] = Math.pow((1 - i / particlesCount), 1.5) * 0.25;
      scalesRef.current[i] = 0.4 * Math.pow((1 - i / particlesCount), 0.6);
    }

    if (particlesRef.current) {
      const geometry = particlesRef.current.geometry;
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.opacity.needsUpdate = true;
      geometry.attributes.scale.needsUpdate = true;
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
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            float strength = smoothstep(0.5, 0.1, d);
            vec3 glowColor = mix(vec3(0.8, 0.1, 0.1), vec3(1.0, 0.3, 0.3), 0.4);
            gl_FragColor = vec4(glowColor, vOpacity * strength);
          }
        `}
      />
    </points>
  );
};

export default BossTrailEffect; 