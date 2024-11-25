import React from 'react';
import Terrain from '../Environment/Terrain';
import Mountain from '../Environment/Mountain';
import GravelPath from '../Environment/GravelPath';
import Tree from '../Environment/Tree';
import Mushroom from '../Environment/Mushroom';
import Unit from '../Units/Unit';
import TrainingDummy from '../Units/TrainingDummy';
import CustomSky from '../Effects/CustomSky';
import Planet from '../Environment/Planet';
import Lights from '../Effects/Lights';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { UnitProps } from '../../types/UnitProps';
import { TrainingDummyProps } from '../../types/TrainingDummyProps';

// Props Interface
interface SceneProps {
  mountainData: Array<{ position: THREE.Vector3; scale: number }>;
  treeData: Array<{
    position: THREE.Vector3;
    scale: number;
    trunkColor: THREE.Color;
    leafColor: THREE.Color;
  }>;
  mushroomData: Array<{ position: THREE.Vector3; scale: number }>;
  treePositions: { mainTree: THREE.Vector3 };
  interactiveTrunkColor: THREE.Color;
  interactiveLeafColor: THREE.Color;
  unitProps: UnitProps;
  dummyProps: Array<TrainingDummyProps>;
}

const Scene: React.FC<SceneProps> = ({
  mountainData,
  treeData,
  mushroomData,
  treePositions,
  interactiveTrunkColor,
  interactiveLeafColor,
  unitProps,
  dummyProps,
}) => {
  return (
    <>
      <CustomSky />
      <Planet />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <Lights />
      <Terrain />
      {mountainData.map((data, index) => (
        <Mountain key={`mountain-${index}`} position={data.position} scale={data.scale} />
      ))}
      <GravelPath />

      {/* Render all trees */}
      {treeData.map((data, index) => (
        <Tree 
          key={`tree-${index}`} 
          position={data.position} 
          scale={data.scale} 
          trunkColor={data.trunkColor}
          leafColor={data.leafColor}
        />
      ))}

      {/* Render all mushrooms */}
      {mushroomData.map((data, index) => (
        <Mushroom key={`mushroom-${index}`} position={data.position} scale={data.scale} />
      ))}

      {/* Render the main interactive tree */}
      <Tree 
        position={treePositions.mainTree} 
        scale={1} 
        trunkColor={interactiveTrunkColor}
        leafColor={interactiveLeafColor}
      />

      <Unit {...unitProps} />

      {dummyProps.map((props, index) => (
        <TrainingDummy 
          key={`dummy-${index}`} 
          position={props.position} 
          health={props.health}
          maxHealth={props.maxHealth} 
          onHit={props.onHit} 
        />
      ))}
    </>
  );
};

export default Scene;