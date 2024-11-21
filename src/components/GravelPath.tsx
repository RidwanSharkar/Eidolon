import { TextureLoader } from 'three';
import { useLoader } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';

export default function GravelPath() {
  const gravelTexture = useLoader(TextureLoader, '/textures/gravel.png');
  
  // Create a curved path
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
          <planeGeometry args={[2, 2]} />
          <meshStandardMaterial map={gravelTexture} />
        </mesh>
      ))}
    </>
  );
}