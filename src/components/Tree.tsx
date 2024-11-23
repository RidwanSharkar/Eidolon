import { useRef, useEffect, useMemo } from 'react';
import { Mesh, Vector3, Color } from 'three';
import * as THREE from 'three';
import React from 'react';

interface TreeProps {
  health: number;
  position?: Vector3;
  scale?: number;
  isInteractive?: boolean;
  trunkColor: Color;
  leafColor: Color;
}

const varyColor = (baseColor: Color, range: number = 0.1) => {
  const color = new THREE.Color(baseColor);
  color.r = THREE.MathUtils.clamp(color.r + (Math.random() - 0.5) * range, 0, 1);
  color.g = THREE.MathUtils.clamp(color.g + (Math.random() - 0.5) * range, 0, 1);
  color.b = THREE.MathUtils.clamp(color.b + (Math.random() - 0.5) * range, 0, 1);
  return color;
};

const TreeComponent: React.FC<TreeProps> = ({ 
  health, 
  position = new Vector3(0, 2, -5),
  scale = 1,
  isInteractive = false,
  trunkColor,
  leafColor,
}: TreeProps) => {
  const treeRef = useRef<Mesh>(null);

  // Memoize the varied colors to ensure they are calculated only once
  const variedTrunkColor = useMemo(() => varyColor(trunkColor), [trunkColor]);
  const variedLeafColor = useMemo(() => varyColor(leafColor), [leafColor]);

  useEffect(() => {
    if (isInteractive && health <= 0 && treeRef.current) {
      treeRef.current.parent?.remove(treeRef.current);
    }
  }, [health, isInteractive]);

  if (isInteractive && health <= 0) return null;

  // Calculate trunk dimensions based on scale
  const trunkRadius = 0.25 * scale;
  const trunkHeight = 4.2 * scale;
  const leafSize = 1.5 * scale;
  const leafHeight = 2 * scale;

  return (
    <group name="tree" position={position} scale={scale}>
      <mesh ref={treeRef}>
        {/* Trunk */}
        <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, trunkHeight, 8]} />
        <meshStandardMaterial 
          color={variedTrunkColor}
          roughness={0.8}
          metalness={0.1}
        />
        
        {/* Main foliage */}
        <mesh position={[0, trunkHeight * 0.6, 0]} name="tree-top">
          <coneGeometry args={[leafSize, leafHeight, 8]} />
          <meshStandardMaterial 
            color={variedLeafColor}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Secondary foliage layer */}
        <mesh position={[0, trunkHeight * 0.8, 0]} name="tree-top-2">
          <coneGeometry args={[leafSize * 0.7, leafHeight * 0.7, 8]} />
          <meshStandardMaterial 
            color={variedLeafColor.clone().offsetHSL(0, 0, -0.1)}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Top foliage layer */}
        <mesh position={[0, trunkHeight, 0]} name="tree-top-3">
          <coneGeometry args={[leafSize * 0.4, leafHeight * 0.4, 8]} />
          <meshStandardMaterial 
            color={variedLeafColor.clone().offsetHSL(0, 0, -0.15)}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </mesh>
    </group>
  );
};

// Memoize the Tree component to prevent unnecessary re-renders
export default React.memo(TreeComponent);