import { CatmullRomCurve3, Vector3, DataTexture, RGBAFormat, FloatType } from 'three';
import { useMemo } from 'react';

export default function GravelPath() {
  const gravelTexture = useMemo(() => {
    const width = 128;
    const height = 128;
    const size = width * height;
    const data = new Float32Array(4 * size);
    
    // Base color #dfad72 in RGB
    const baseR = 0.875; // 223/255
    const baseG = 0.678; // 173/255
    const baseB = 0.447; // 114/255

    for (let i = 0; i < size; i++) {
      const stride = i * 4;
      
      // Create noise pattern
      const x = i % width;
      const y = Math.floor(i / width);
      
      // Create more structured noise using position
      const frequency = 0.1;
      const noise = Math.sin(x * frequency) * Math.cos(y * frequency) * 0.1 +
                   Math.random() * 0.1 - 0.05;
      
      // Add some variation to create gravel-like texture
      const grainNoise = Math.random() > 0.7 ? 0.15 : 0;
      
      data[stride] = baseR + noise + grainNoise;     // R
      data[stride + 1] = baseG + noise + grainNoise; // G
      data[stride + 2] = baseB + noise + grainNoise; // B
      data[stride + 3] = 1.0;                        // A
    }

    const texture = new DataTexture(data, width, height, RGBAFormat, FloatType);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const curve = new CatmullRomCurve3([
    new Vector3(0, 0, 10),
    new Vector3(5, 0, 0),
    new Vector3(0, 0, -10),
    new Vector3(-5, 0, -20),
    new Vector3(0, 0, -30),
    new Vector3(-10, 0, -30),
    new Vector3(0, 0, -40),
  ]);

  const points = curve.getPoints(50);
  
  return (
    <>
      {points.map((point, index) => (
        <mesh key={index} position={[point.x, 0.01, point.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.2]} />
          <meshStandardMaterial 
            map={gravelTexture}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}
    </>
  );
}