import React, { useMemo } from 'react';
import * as THREE from 'three';

const SunsetSkyShader = {
  uniforms: {
    topColor: { value: new THREE.Color('#c45e99') },
    middleColor: { value: new THREE.Color('#de6795') },
    bottomColor: { value: new THREE.Color('#fc9f82') },
    offset: { value: 33 },
    exponent: { value: 0.6 },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 middleColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    
    varying vec3 vWorldPosition;
    
    void main() {
      float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
      float mixStrength = max(pow(max(h, 0.0), exponent), 0.0);
      vec3 color = mix(middleColor, topColor, mixStrength);
      color = mix(bottomColor, color, smoothstep(0.0, 1.0, h));
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

const CustomSky: React.FC = () => {
  const shaderParams = useMemo(() => ({
    uniforms: SunsetSkyShader.uniforms,
    vertexShader: SunsetSkyShader.vertexShader,
    fragmentShader: SunsetSkyShader.fragmentShader,
    side: THREE.BackSide,
  }), []);

  return (
    <mesh>
      <sphereGeometry args={[500, 32, 32]} />
      <shaderMaterial attach="material" args={[shaderParams]} />
    </mesh>
  );
};

export default CustomSky; 