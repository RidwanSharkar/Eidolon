import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import Terrain from '../Environment/Terrain';
import Mountain from '../Environment/Mountain';
import GravelPath from '../Environment/GravelPath';
import Tree from '../Environment/Tree';
import Mushroom from '../Environment/Mushroom';
import Unit from '../Units/Unit';
import TrainingDummy from '../Units/TrainingDummy';
import EnemyUnit from '../Units/EnemyUnit';
import { v4 as uuidv4 } from 'uuid';
import { SceneProps as SceneType } from '../../types/SceneProps';
import { Group } from 'three';
import { TrainingDummyProps } from '../../types/TrainingDummyProps';
import { UnitProps } from '../../types/UnitProps';
import { TargetId } from '../../types/TargetId';
import HealthBar from '../UI/HealthBar';

export default function Scene({
  mountainData,
  treeData,
  mushroomData,
  treePositions,
  interactiveTrunkColor,
  interactiveLeafColor,
  unitProps,
  skeletonProps,
}: SceneType) {
  // State for enemies
  const [enemies, setEnemies] = useState<Array<{
    id: string;
    initialPosition: Vector3;
    health: number;
    maxHealth: number;
  }>>([
    // Regular enemies
    {
      id: `enemy-${uuidv4()}`,
      initialPosition: new Vector3(10, 0, 10),
      health: 200,
      maxHealth: 200,
    },
    {
      id: `enemy-${uuidv4()}`,
      initialPosition: new Vector3(-10, 0, 10),
      health: 200,
      maxHealth: 200,
    },
    // Skeletons
    ...useMemo(() =>
      skeletonProps.map((skeleton, index) => ({
        id: `enemy-skeleton-${index}`, // Ensure consistent prefix
        initialPosition: skeleton.initialPosition,
        health: skeleton.health,
        maxHealth: skeleton.maxHealth,
      })), [skeletonProps]
    ),
  ]);

  // Update playerHealth state to be used with HealthBar
  const [playerHealth, setPlayerHealth] = useState<number>(unitProps.health);

  // Ref to track player position
  const playerRef = useRef<Group>(null);

  // State to store player position
  const [playerPosition, setPlayerPosition] = useState<Vector3>(new Vector3(0, 0, 0));

  // Callback to handle damage to enemies
  const handleTakeDamage = useCallback((targetId: TargetId, damage: number) => {
    console.log(`Target ${targetId} takes ${damage} damage.`);
    setEnemies((prevEnemies) =>
      prevEnemies.map((enemy) =>
        enemy.id === targetId
          ? { ...enemy, health: Math.max(0, enemy.health - damage) }
          : enemy
      )
    );
  }, []);

  // Callback to handle regeneration of enemies
  const handleRegenerate = useCallback((id: string) => {
    console.log(`Enemy ${id} regenerates to max health.`);
    setEnemies((prevEnemies) =>
      prevEnemies.map((enemy) =>
        enemy.id === id
          ? { ...enemy, health: enemy.maxHealth }
          : enemy
      )
    );
  }, []);

  // Update handlePlayerDamage to use setPlayerHealth
  const handlePlayerDamage = useCallback((damage: number) => {
    setPlayerHealth(prevHealth => Math.max(0, prevHealth - damage));
  }, []);

  // Callback to update player position
  const handlePlayerPositionUpdate = useCallback((position: Vector3) => {
    setPlayerPosition(position);
  }, []);

  // Update unitComponentProps to use playerHealth
  const unitComponentProps: UnitProps = {
    onHit: handleTakeDamage as (targetId: string, damage: number) => void,
    controlsRef: unitProps.controlsRef,
    currentWeapon: unitProps.currentWeapon,
    onWeaponSelect: unitProps.onWeaponSelect,
    health: playerHealth, // Use playerHealth here instead of unitProps.health
    maxHealth: unitProps.maxHealth,
    isPlayer: unitProps.isPlayer,
    abilities: unitProps.abilities,
    onAbilityUse: unitProps.onAbilityUse,
    onPositionUpdate: handlePlayerPositionUpdate,
    enemyData: enemies.map((enemy) => ({
      id: enemy.id,
      position: enemy.initialPosition,
      health: enemy.health,
      maxHealth: enemy.maxHealth,
    })),
    dummyProps: unitProps.dummyProps,
  };

  return (
    <>
      {/* Other Environment Components */}
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

      {/* Player Unit with ref */}
      <group ref={playerRef}>
        <Unit {...unitComponentProps} />
      </group>

      {/* Training Dummies */}
      {unitProps.dummyProps && unitProps.dummyProps.map((dummy: TrainingDummyProps) => (
        <TrainingDummy
          key={`dummy-${dummy.id}`}
          id={dummy.id}
          position={dummy.position}
          health={dummy.health}
          maxHealth={dummy.maxHealth}
          onHit={() => handleTakeDamage(dummy.id, 15)} // Example damage value
        />
      ))}

      {/* Enemy Units (Regular Enemies and Skeletons) */}
      {enemies.map((enemy) => (
        <EnemyUnit
          key={enemy.id}
          id={enemy.id}
          initialPosition={enemy.initialPosition}
          health={enemy.health}
          maxHealth={enemy.maxHealth}
          onTakeDamage={handleTakeDamage}
          onRegenerate={handleRegenerate}
          playerPosition={playerPosition} // Pass the correct player position
          onAttackPlayer={handlePlayerDamage} // Pass the correct function
        />
      ))}

      {/* Display Player Health */}
      <HealthBar 
        current={playerHealth}  // Changed from 'health' to 'current'
        max={100}              // Changed from 'maxHealth' to 'max'
        position={[0, 5, -10]}
      />
    </>
  );
}