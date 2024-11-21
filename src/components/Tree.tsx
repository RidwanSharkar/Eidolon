import { useRef, useEffect } from 'react';
import { Mesh, Vector3,} from 'three';
import * as THREE from 'three';

interface TreeProps {
  health: number;
  position?: Vector3;
  scale?: number;
  isInteractive?: boolean;
}

// Natural color palettes
const trunkColors = [
  "#3b2616", // Dark brown
  "#4a3421", // Medium brown
  "#5c4033", // Chestnut
  "#654321", // Dark golden brown
  "#8b7355", // Wood brown
];

const leafColors = [
  "#1b4d3e", // Dark forest green
  "#228b22", // Forest green
  "#2e8b57", // Sea green
  "#355e3b", // Hunter green
  "#3a5f0b", // Dark olive green
];

export default function Tree({ 
  health, 
  position = new Vector3(0, 1.5, -5),
  scale = 1,
  isInteractive = false 
}: TreeProps) {
  const treeRef = useRef<Mesh>(null);

  // Randomly select colors from palettes
  const trunkColor = trunkColors[Math.floor(Math.random() * trunkColors.length)];
  const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
  
  // Slightly vary the selected colors
  const varyColor = (baseColor: string, range: number = 0.1) => {
    const color = new THREE.Color(baseColor);
    color.r += (Math.random() - 0.5) * range;
    color.g += (Math.random() - 0.5) * range;
    color.b += (Math.random() - 0.5) * range;
    return color;
  };

  useEffect(() => {
    if (isInteractive && health <= 0 && treeRef.current) {
      treeRef.current.parent?.remove(treeRef.current);
    }
  }, [health, isInteractive]);

  if (isInteractive && health <= 0) return null;

  // Calculate trunk dimensions based on scale
  const trunkRadius = 0.35 * scale;
  const trunkHeight = 4 * scale;
  const leafSize = 1.5 * scale;
  const leafHeight = 2 * scale;

  return (
    <group name="tree" position={position} scale={scale}>
      <mesh ref={treeRef}>
        {/* Trunk */}
        <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, trunkHeight, 8]} />
        <meshStandardMaterial 
          color={varyColor(trunkColor)}
          roughness={0.8}
          metalness={0.1}
        />
        
        {/* Main foliage */}
        <mesh position={[0, trunkHeight * 0.6, 0]} name="tree-top">
          <coneGeometry args={[leafSize, leafHeight, 8]} />
          <meshStandardMaterial 
            color={varyColor(leafColor)}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Secondary foliage layer */}
        <mesh position={[0, trunkHeight * 0.8, 0]} name="tree-top-2">
          <coneGeometry args={[leafSize * 0.7, leafHeight * 0.7, 8]} />
          <meshStandardMaterial 
            color={varyColor(leafColor, 0.15)}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Top foliage layer */}
        <mesh position={[0, trunkHeight, 0]} name="tree-top-3">
          <coneGeometry args={[leafSize * 0.4, leafHeight * 0.4, 8]} />
          <meshStandardMaterial 
            color={varyColor(leafColor, 0.15)}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </mesh>
    </group>
  );
}