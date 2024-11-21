import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls';
import { useState, useRef } from 'react';
import * as THREE from 'three';
import Terrain from '../components/Terrain';
import Mountain from '../components/Mountain';
import GravelPath from '../components/GravelPath';
import Tree from '../components/Tree';
import Unit from '../components/Unit';
import Panel from '../components/Panel';

export default function Home() {
  const [treeHealth, setTreeHealth] = useState(3);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const handleTreeDamage = () => {
    setTreeHealth(prev => Math.max(0, prev - 1));
  };

  const generateMountains = () => {
    const positions: Array<{ position: THREE.Vector3, scale: number }> = [];
    
    // Parameters for mountain generation
    const layerCount = 3; // Number of circular layers
    const baseRadius = 45; // Starting radius
    const radiusIncrement = 5; // Distance between layers
    const mountainsPerLayer = 40; // Increased density
    const angleOffset = (Math.PI * 2) / (mountainsPerLayer * 2); // Offset for staggered placement

    // Generate multiple layers of mountains
    for (let layer = 0; layer < layerCount; layer++) {
      const radius = baseRadius + (layer * radiusIncrement);
      
      // Generate main mountains for this layer
      for (let i = 0; i < mountainsPerLayer; i++) {
        const angle = (i / mountainsPerLayer) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        
        // Random scale between 0.7 and 1.3
        const scale = 0.7 + Math.random() * 0.6;
        
        positions.push({
          position: new THREE.Vector3(x, 0, z),
          scale: scale
        });

        // Add intermediate mountains with slight position variation
        if (layer < layerCount - 1) { // Skip intermediates for last layer
          const intermediateAngle = angle + angleOffset;
          const intermediateRadius = radius + (radiusIncrement * 0.5);
          const ix = intermediateRadius * Math.cos(intermediateAngle);
          const iz = intermediateRadius * Math.sin(intermediateAngle);
          
          // Slightly smaller scale for intermediate mountains
          const intermediateScale = 0.6 + Math.random() * 0.4;
          
          positions.push({
            position: new THREE.Vector3(ix, 0, iz),
            scale: intermediateScale
          });
        }
      }
    }

    return positions;
  };

  const mountainData = generateMountains();

  const generateTrees = () => {
    const trees: Array<{ position: THREE.Vector3, scale: number, health: number }> = [];
    const numberOfClusters = 15; // Increased from 8 to 15 clusters
    const treesPerCluster = 8; // Increased base trees per cluster
    
    // Generate cluster center points
    for (let i = 0; i < numberOfClusters; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 30; // Wider range: between 10 and 40 units
      
      const clusterX = Math.cos(angle) * distance;
      const clusterZ = Math.sin(angle) * distance;
      
      // Generate trees for this cluster
      const numberOfTreesInCluster = treesPerCluster + Math.floor(Math.random() * 5); // 8-12 trees per cluster
      
      for (let j = 0; j < numberOfTreesInCluster; j++) {
        // Random offset from cluster center with varying distances
        const offsetDistance = Math.random() * (6 + (j % 3) * 2); // Creates more natural spread
        const offsetAngle = Math.random() * Math.PI * 2;
        
        const treeX = clusterX + Math.cos(offsetAngle) * offsetDistance;
        const treeZ = clusterZ + Math.sin(offsetAngle) * offsetDistance;
        
        // More varied tree sizes
        const scale = 0.4 + Math.random() * 1.6; // Between 0.4 and 2.0
        
        trees.push({
          position: new THREE.Vector3(treeX, 0, treeZ),
          scale: scale,
          health: 3
        });
      }
    }
    
    return trees;
  };

  const treeData = generateTrees();

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 20, 20], fov: 60 }}>
        <Sky 
          distance={450000} 
          sunPosition={[0, -1, 0]}
          inclination={0.1}
          azimuth={0.25} 
          mieCoefficient={0.001}
          mieDirectionalG={0.7}
          rayleigh={0.2}
          turbidity={10}
        />
        
        <Stars 
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 10, 7.5]} 
          intensity={0.2} 
          color="#b6ceff"
        />
        <hemisphereLight 
          args={["#b6ceff", "#2a2a2a", 0.6]} 
          position={[0, 50, 0]} 
        />
        
        <OrbitControls 
          ref={controlsRef}
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.2}
          maxDistance={55}           // CAMERA maxDISTANCE 
          mouseButtons={{
            LEFT: undefined,
            MIDDLE: undefined,
            RIGHT: THREE.MOUSE.ROTATE
          }}
        />
        
        <Terrain />
        {mountainData.map((data, index) => (
          <Mountain 
            key={`mountain-${index}`} 
            position={data.position} 
            scale={data.scale}
          />
        ))}
        <GravelPath />
        
        {/* Render all trees */}
        {treeData.map((data, index) => (
          <Tree 
            key={`tree-${index}`}
            position={data.position}
            scale={data.scale}
            health={3}
          />
        ))}
        
        {/* Keep the original interactive tree */}
        <Tree 
          position={new THREE.Vector3(0, 2, -5)} 
          scale={1} 
          health={treeHealth}
          isInteractive={true}
        />
        
        <Unit onHit={handleTreeDamage} controlsRef={controlsRef} />
      </Canvas>
      <Panel />
    </div>
  );
}