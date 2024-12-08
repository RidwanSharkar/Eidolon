import React, { useState, useCallback, useRef } from 'react';
import { Vector3 } from 'three';
import Terrain from '../Environment/Terrain';
import Mountain from '../Environment/Mountain';
import Tree from '../Environment/Tree';
import Mushroom from '../Environment/Mushroom';
import Unit from '../Units/Unit';
import EnemyUnit from '../Units/EnemyUnit';
import { SceneProps as SceneType } from '../../types/SceneProps';
import { Group } from 'three';
import { UnitProps } from '../../types/UnitProps';
import Planet from '../Environment/Planet';
import CustomSky from '../Effects/CustomSky';
import Behavior from '../Units/Behavior';
import DriftingSouls from '../Effects/DriftingSouls';
import BackgroundStars from '../Effects/BackgroundStars';

interface Enemy {
  id: string;
  initialPosition: Vector3;
  currentPosition: Vector3;
  health: number;
  maxHealth: number;
}

export default function Scene({
  mountainData,
  treeData,
  mushroomData,
  treePositions,
  interactiveTrunkColor,
  interactiveLeafColor,
  unitProps,
  skeletonProps,
  killCount,
}: SceneType) {
  // State for enemies (only skeletons now)
  const [enemies, setEnemies] = useState<Enemy[]>(
    skeletonProps.map((skeleton, index) => ({
      id: `skeleton-${index}`,
      initialPosition: skeleton.initialPosition,
      currentPosition: skeleton.initialPosition.clone(),
      health: skeleton.maxHealth,
      maxHealth: skeleton.maxHealth,
    }))
  );

  // Update playerHealth state to be used with HealthBar
  const [playerHealth, setPlayerHealth] = useState<number>(unitProps.health);

  // Ref to track player position
  const playerRef = useRef<Group>(null);

  // State to store player position
  const [playerPosition, setPlayerPosition] = useState<Vector3>(new Vector3(0, 0, 0));

  // Callback to handle damage to enemies
  const handleTakeDamage = useCallback((targetId: string, damage: number) => {
    console.log(`Target ${targetId} takes ${damage} damage`);
    setEnemies(prevEnemies =>
      prevEnemies.map(enemy => {
        const strippedId = targetId.replace('enemy-', '');
        if (enemy.id === strippedId) {
          const newHealth = Math.max(0, enemy.health - damage);
          console.log(`Enemy ${strippedId} health: ${enemy.health} -> ${newHealth}`);
          if (newHealth === 0 && enemy.health > 0) {
            console.log('Enemy defeated, triggering onEnemyDeath');
            unitProps.onEnemyDeath();
          }
          return {
            ...enemy,
            health: newHealth
          };
        }
        return enemy;
      })
    );
  }, [unitProps]);

  // Update handlePlayerDamage to use setPlayerHealth
  const handlePlayerDamage = useCallback((damage: number) => {
    unitProps.onDamage?.(damage);
  }, [unitProps]);

  // Callback to update player position
  const handlePlayerPositionUpdate = useCallback((position: Vector3) => {
    setPlayerPosition(position);
  }, []);

  // Add this callback before unitComponentProps
  const handleEnemyPositionUpdate = useCallback((id: string, newPosition: Vector3) => {
    setEnemies(prevEnemies =>
      prevEnemies.map(enemy =>
        enemy.id === id.replace('enemy-', '')
          ? { ...enemy, currentPosition: newPosition.clone() }
          : enemy
      )
    );
  }, []);

  // Add function to handle spawning new skeletons
  const handleSpawnSkeleton = useCallback((position: Vector3) => {
    setEnemies(prev => {
      const newId = `skeleton-${prev.length}`;
      return [...prev, {
        id: newId,
        initialPosition: position,
        currentPosition: position.clone(),
        health: 200,
        maxHealth: 200,
      }];
    });
  }, []);

  // Add reset function
  const handleReset = useCallback(() => {
    setPlayerHealth(unitProps.maxHealth);
    setEnemies(skeletonProps.map((skeleton, index) => ({
      id: `skeleton-${index}`,
      initialPosition: skeleton.initialPosition,
      currentPosition: skeleton.initialPosition.clone(),
      health: skeleton.maxHealth,
      maxHealth: skeleton.maxHealth,
    })));
  }, [skeletonProps, unitProps.maxHealth]);

  // Update unitComponentProps to use playerHealth
  const unitComponentProps: UnitProps = {
    onHit: handleTakeDamage,
    controlsRef: unitProps.controlsRef,
    currentWeapon: unitProps.currentWeapon,
    onWeaponSelect: unitProps.onWeaponSelect,
    health: playerHealth,
    maxHealth: unitProps.maxHealth,
    isPlayer: unitProps.isPlayer,
    abilities: unitProps.abilities,
    onAbilityUse: unitProps.onAbilityUse,
    onPositionUpdate: handlePlayerPositionUpdate,
    enemyData: enemies.map((enemy) => ({
      id: `enemy-${enemy.id}`,
      position: enemy.currentPosition,
      health: enemy.health,
      maxHealth: enemy.maxHealth,
    })),
    onDamage: unitProps.onDamage,
    onEnemyDeath: () => {
      console.log("Kill counted in Scene");  // Debug log
    }
  };

  return (
    <>
      <Behavior 
        playerHealth={playerHealth}
        onReset={handleReset}
        onSpawnSkeleton={handleSpawnSkeleton}
        killCount={killCount}
      />

      {/* Background Environment */}
      <BackgroundStars />
      <DriftingSouls />
      <CustomSky />
      <Planet />

      {/* Ground Environment */}
      <Terrain />
      {mountainData.map((data, index) => (
        <Mountain key={`mountain-${index}`} position={data.position} scale={data.scale} />
      ))}

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

      {/* Enemy Units (Skeletons only) */}
      {enemies.map((enemy) => (
        <EnemyUnit
        
          key={enemy.id}
          id={enemy.id}
          initialPosition={enemy.initialPosition}
          health={enemy.health}
          maxHealth={enemy.maxHealth}
          onTakeDamage={handleTakeDamage}
          onPositionUpdate={handleEnemyPositionUpdate}
          playerPosition={playerPosition}
          onAttackPlayer={handlePlayerDamage}
        />
      ))}
    </>
  );
}