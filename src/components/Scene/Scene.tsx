import React, { useState, useCallback } from 'react';
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
import EnemyUnit from '../Units/EnemyUnit';
import { v4 as uuidv4 } from 'uuid';
import { EnemyUnitProps } from '../../types/EnemyUnitProps';

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
}

const Scene: React.FC<SceneProps> = ({
  mountainData,
  treeData,
  mushroomData,
  treePositions,
  interactiveTrunkColor,
  interactiveLeafColor,
  unitProps,
}) => {
  // State to manage enemies
  const [enemies, setEnemies] = useState<Array<EnemyUnitProps>>([
    {
      id: `enemy-${uuidv4()}`,
      initialPosition: new THREE.Vector3(10, 0, 10),
      health: 200,
      maxHealth: 200,
      onTakeDamage: (id, damage) => handleTakeDamage(id, damage),
    },
    {
      id: `enemy-${uuidv4()}`,
      initialPosition: new THREE.Vector3(-10, 0, 10),
      health: 200,
      maxHealth: 200,
      onTakeDamage: (id, damage) => handleTakeDamage(id, damage),
    },
    // Add more enemies as needed
  ]);

  // Handle taking damage
  const handleTakeDamage = useCallback((id: string, damage: number) => {
    setEnemies(prevEnemies => 
      prevEnemies.map(enemy =>
        enemy.id === id 
          ? { ...enemy, health: Math.max(0, enemy.health - damage) }
          : enemy
      )
    );
  }, []);

  // State to manage dummies
  const [dummyProps, setDummyProps] = useState<Array<TrainingDummyProps>>([
    {
      id: 'dummy1',
      position: new THREE.Vector3(5, 0, 5),
      health: 200,
      maxHealth: 200,
      onHit: () => {
        setDummyProps(prevDummies => prevDummies.map(dummy =>
          dummy.id === 'dummy1'
            ? { ...dummy, health: dummy.maxHealth }
            : dummy
        ));
      },
    },
    {
      id: 'dummy2',
      position: new THREE.Vector3(-5, 0, 5),
      health: 200,
      maxHealth: 200,
      onHit: () => {
        setDummyProps(prevDummies => prevDummies.map(dummy =>
          dummy.id === 'dummy2'
            ? { ...dummy, health: dummy.maxHealth }
            : dummy
        ));
      },
    },
    // Add more dummies if needed
  ]);

  // Unified hit handler
  const handleHit = useCallback((targetId: string, damage: number) => {
    if (targetId === 'dummy1' || targetId === 'dummy2') {
      // Handle dummies
      setDummyProps(prevDummies =>
        prevDummies.map(dummy =>
          dummy.id === targetId
            ? { ...dummy, health: Math.max(dummy.health - damage, 0) }
            : dummy
        )
      );
    } else if (targetId.startsWith('enemy-')) { // Adjusted to match prefixed IDs
      // Handle enemies
      setEnemies(prevEnemies =>
        prevEnemies.map(enemy =>
          enemy.id === targetId
            ? { ...enemy, health: Math.max(enemy.health - damage, 0) }
            : enemy
        ).filter(enemy => enemy.health > 0) // Remove dead enemies
      );
    }
  }, []);

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

      {/* Player Unit */}
      <Unit 
        onHit={handleHit}
        controlsRef={unitProps.controlsRef}
        currentWeapon={unitProps.currentWeapon}
        onWeaponSelect={unitProps.onWeaponSelect}
        health={unitProps.health}
        maxHealth={200}
        isPlayer={unitProps.isPlayer}
        abilities={unitProps.abilities}
        onAbilityUse={unitProps.onAbilityUse}
        onPositionUpdate={unitProps.onPositionUpdate}
        enemyData={enemies.map(enemy => ({
          id: enemy.id,
          position: enemy.initialPosition,
          health: enemy.health,
          maxHealth: enemy.maxHealth
        }))}
      />

      {/* Training Dummies */}
      {dummyProps.map((dummy) => (
        <TrainingDummy 
          key={`dummy-${dummy.id}`} 
          id={dummy.id} 
          position={dummy.position} 
          health={dummy.health}
          maxHealth={dummy.maxHealth} 
          onHit={dummy.onHit}
        />
      ))}

      {/* Enemy Units */}
      {enemies.map(enemy => (
        <EnemyUnit
          key={enemy.id}
          id={enemy.id}
          initialPosition={enemy.initialPosition}
          health={enemy.health}
          maxHealth={enemy.maxHealth}
          onTakeDamage={enemy.onTakeDamage}
        />
      ))}
    </>
  );
};

export default Scene;