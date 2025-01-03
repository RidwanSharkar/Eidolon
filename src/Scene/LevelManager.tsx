// src/Scene/LevelManager.tsx
import React, { useCallback, useState, useEffect } from 'react';
import Scene from './Scene';
import Scene2 from './Scene2';   
import { SceneProps } from './SceneProps';

interface LevelManagerProps {
  sceneProps: SceneProps & {
    spawnInterval?: number;
    maxSkeletons?: number;
    initialSkeletons?: number;
  };
  onAbilityUnlock: (abilityType: 'r' | 'passive') => void;
  onLevelTransition: (level: number, showPanel: boolean) => void;
  currentLevel: number;
}

export default function LevelManager({ 
  sceneProps, 
  onLevelTransition,
  currentLevel 
}: LevelManagerProps) {
  const [showScene2, setShowScene2] = useState(false);

  const handleLevelComplete = useCallback(() => {
    if (currentLevel === 1) {
      onLevelTransition(1, true);
    } else if (currentLevel === 2) {
      onLevelTransition(2, false);
    }
  }, [currentLevel, onLevelTransition]);

  useEffect(() => {
    return () => {
      if (sceneProps.unitProps.controlsRef.current) {
        sceneProps.unitProps.controlsRef.current.dispose();
      }
    };
  }, [sceneProps.unitProps.controlsRef]);

  useEffect(() => {
    if (currentLevel === 2) {
      // Cleanup Scene1 resources before showing Scene2
      if (sceneProps.unitProps.fireballManagerRef?.current?.cleanup) {
        sceneProps.unitProps.fireballManagerRef.current.cleanup();
      }
      setShowScene2(true);
    } else {
      setShowScene2(false);
    }
  }, [currentLevel, sceneProps.unitProps.controlsRef, sceneProps.unitProps.fireballManagerRef]);

  return (
    <>
      {!showScene2 ? (
        <Scene {...sceneProps} onLevelComplete={handleLevelComplete} />
      ) : (
        <Scene2 {...sceneProps} onLevelComplete={handleLevelComplete} />
      )}
    </>
  );
}