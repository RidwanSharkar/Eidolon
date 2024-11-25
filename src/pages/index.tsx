import { Canvas } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls';
import { useState, useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

import Scene from '../components/Scene/Scene';
import Panel from '../components/UI/Panel';
import { WeaponType } from '../types/weapons';
import { trunkColors, leafColors } from '@/utils/colors';
import { generateMountains, generateTrees, generateMushrooms } from '@/utils/terrainGenerators';

import { Vector3 } from 'three';

// Add these type definitions at the top of the file, after the imports
interface AbilityButton {
  key: string;
  cooldown: number;
  currentCooldown: number;
  icon: string;
}

interface WeaponInfo {
  [key: string]: {
    q: AbilityButton;
    e: AbilityButton;
  };
}

// Type for TrainingDummy props
type DummyId = 'dummy1' | 'dummy2';

// Home Component
export default function HomePage() {
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>(WeaponType.SCYTHE);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [playerHealth] = useState(200);
  const [dummyHealth, setDummyHealth] = useState(300);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [dummy2Health, setDummy2Health] = useState(300);
  const [abilities, setAbilities] = useState<WeaponInfo>({
    [WeaponType.SWORD]: {
      q: { key: 'q', cooldown: 2, currentCooldown: 0, icon: '/icons/sword_q.svg' },
      e: { key: 'e', cooldown: 5, currentCooldown: 0, icon: '/icons/sword_e.svg' }
    },
    [WeaponType.SCYTHE]: {
      q: { key: 'q', cooldown: 2, currentCooldown: 0, icon: '/icons/scythe_q.svg' },
      e: { key: 'e', cooldown: 5, currentCooldown: 0, icon: '/icons/scythe_e.svg' }
    },
    [WeaponType.SABRES]: {
      q: { key: 'q', cooldown: 2, currentCooldown: 0, icon: '/icons/sabres_q.svg' },
      e: { key: 'e', cooldown: 5, currentCooldown: 0, icon: '/icons/sabres_e.svg' }
    },
    [WeaponType.SABRES2]: {
      q: { key: 'q', cooldown: 2, currentCooldown: 0, icon: '/icons/sabres2_q.svg' },
      e: { key: 'e', cooldown: 5, currentCooldown: 0, icon: '/icons/sabres2_e.svg' }
    }
  });

  // Define the main tree position
  const treePositions = useMemo(() => ({
    mainTree: new Vector3(0, 2, -5),
  }), []);

  // Memoize mountain data
  const mountainData = useMemo(() => generateMountains(), []);

  // Memoize tree data
  const treeData = useMemo(() => generateTrees(), []);

  // Memoize mushroom data
  const mushroomData = useMemo(() => generateMushrooms(), []);

  // Assign consistent colors to the interactive tree using useMemo
  const interactiveTrunkColor = useMemo(() => 
    new THREE.Color(trunkColors[Math.floor(Math.random() * trunkColors.length)]),
    []
  );
  const interactiveLeafColor = useMemo(() => 
    new THREE.Color(leafColors[Math.floor(Math.random() * leafColors.length)]),
    []
  );

  const handleWeaponSelect = (weapon: WeaponType) => {
    setCurrentWeapon(weapon);
  };

  const handleDummyHit = (dummyId: DummyId, damage: number) => {
    const currentTime = Date.now();
    if (currentTime - lastHitTime > 100) { // 100ms cooldown
      if (dummyId === 'dummy1') {
        setDummyHealth(prev => Math.max(0, prev - damage));
      } else {
        setDummy2Health(prev => Math.max(0, prev - damage));
      }
      setLastHitTime(currentTime);
    }
  };

  const handleAbilityUse = (weapon: WeaponType, ability: 'q' | 'e') => {
    setAbilities(prev => {
      const newAbilities = { ...prev };
      newAbilities[weapon][ability].currentCooldown = newAbilities[weapon][ability].cooldown;
      return newAbilities;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAbilities((prev: WeaponInfo) => {
        const newAbilities = { ...prev };
        Object.keys(newAbilities).forEach(weapon => {
          ['q', 'e'].forEach(ability => {
            if (newAbilities[weapon as WeaponType][ability as 'q' | 'e'].currentCooldown > 0) {
              newAbilities[weapon as WeaponType][ability as 'q' | 'e'].currentCooldown -= 0.1;
            }
          });
        });
        return newAbilities;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Add unit position state
  const [unitPosition] = useState(new THREE.Vector3(0, 0, 0));

  // Prepare props for Scene component
  const sceneProps = {
    mountainData,
    treeData,
    mushroomData,
    treePositions,
    interactiveTrunkColor,
    interactiveLeafColor,
    unitProps: {
      onDummyHit: handleDummyHit,
      controlsRef,
      currentWeapon,
      onWeaponSelect: handleWeaponSelect,
      health: playerHealth,
      maxHealth: 200,
      isPlayer: true,
      abilities,
      onAbilityUse: handleAbilityUse,
      onPositionUpdate: (newPosition: THREE.Vector3) => {
        unitPosition.copy(newPosition);
      },
    },
    dummyProps: [
      {
        position: new Vector3(5, 0, 5),
        health: dummyHealth,
        maxHealth: 300,
        onHit: () => setDummyHealth(300),
      },
      {
        position: new Vector3(-5, 0, 5),
        health: dummy2Health,
        maxHealth: 300,
        onHit: () => setDummy2Health(300),
      },
    ],
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [0, 10, 20], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <Scene {...sceneProps} />
        <DreiOrbitControls
          ref={controlsRef}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          maxDistance={75}
          mouseButtons={{
            LEFT: undefined,
            MIDDLE: undefined,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
        />
      </Canvas>
      <Panel 
        currentWeapon={currentWeapon} 
        onWeaponSelect={handleWeaponSelect}
        playerHealth={playerHealth}
        maxHealth={200}
        abilities={abilities}
      />
    </div>
  );
}