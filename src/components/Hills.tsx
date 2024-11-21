import {  } from 'three';

export default function Hills() {
  return (
    <>
      <mesh position={[-10, 2, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[10, 2, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </>
  );
}