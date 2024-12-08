import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import Scene from '../components/Scene/Scene';
import Panel from '../components/UI/Panel';
import { WeaponType } from '../types/weapons';
import { trunkColors, leafColors } from '@/utils/colors';
import { generateMountains, generateTrees, generateMushrooms } from '@/utils/terrainGenerators';
import { Vector3 } from 'three';
import { SceneProps } from '@/types/SceneProps';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';

// SLOPPY CLEAN
// SHOULD BE  app/page.tsx for Next??!** water WE Doin
interface AbilityButton {
  key: string;
  cooldown: number;
  currentCooldown: number;
  icon: string;
  maxCooldown: number;
  name: string;
}

interface WeaponInfo {
  [key: string]: {
    q: AbilityButton;
    e: AbilityButton;
  };
}

// SKELE SPAWN POINTS
const generateRandomPosition = () => {
  const radius = 50; // Increased radius for more spread
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random()) * radius; // Using sqrt for more even distribution
  return new Vector3(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
};


const NUM_SKELETONS = 5;  // start with 5 skeletons

// Home Component
export default function HomePage() {
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>(WeaponType.SCYTHE);
  const controlsRef = useRef<OrbitControlsType>(null);
  const [playerHealth, setPlayerHealth] = useState(200);
  const [dummyHealth, setDummyHealth] = useState(300);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [dummy2Health, setDummy2Health] = useState(300);
  const [abilities, setAbilities] = useState<WeaponInfo>({
    [WeaponType.SWORD]: {
      q: { key: 'q', cooldown: 1.08, currentCooldown: 0, icon: '/Eidolon/icons/q2.svg', maxCooldown: 1.08, name: 'Sword Q' },
      e: { key: 'e', cooldown: 3.86, currentCooldown: 0, icon: '/Eidolon/icons/e2.svg', maxCooldown: 4, name: 'Sword E' }
    },
    [WeaponType.SCYTHE]: {
      q: { key: 'q', cooldown: 1, currentCooldown: 0, icon: '/Eidolon/icons/q1.svg', maxCooldown: 1, name: 'Scythe Q' },
      e: { key: 'e', cooldown: 0.75, currentCooldown: 0, icon: '/Eidolon/icons/e1.svg', maxCooldown: 0.75, name: 'Scythe E' }
    },
    [WeaponType.SABRES]: {
      q: { key: 'q', cooldown: 0.9, currentCooldown: 0, icon: '/Eidolon/icons/q3.svg', maxCooldown: 0.9, name: 'Sabres Q' },
      e: { key: 'e', cooldown: 1, currentCooldown: 0, icon: '/Eidolon/icons/e3.svg', maxCooldown: 1, name: 'Sabres E' }
    },
    [WeaponType.SABRES2]: {
      q: { key: 'q', cooldown: 1.5, currentCooldown: 0, icon: '/Eidolon/icons/q3.svg', maxCooldown: 1.5, name: 'Sabres2 Q' },
      e: { key: 'e', cooldown: 6, currentCooldown: 0, icon: '/Eidolon/icons/e2.svg', maxCooldown: 6, name: 'Sword E' }
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

  const handleHit = (targetId: string, damage: number) => {
    const currentTime = Date.now();
    if (currentTime - lastHitTime > 100) { // 100ms cooldown
      if (targetId === 'dummy1') {
        if (dummyHealth > 0) {
          const newHealth = Math.max(0, dummyHealth - damage);
          setDummyHealth(newHealth);
        }
      } else if (targetId === 'dummy2') {
        if (dummy2Health > 0) {
          const newHealth = Math.max(0, dummy2Health - damage);
          setDummy2Health(newHealth);
        }
      } else if (targetId.startsWith('skeleton-')) {
        const skeletonIndex = parseInt(targetId.split('-')[1]);
        if (skeletonHealths[skeletonIndex] > 0) {
          const newHealth = Math.max(0, skeletonHealths[skeletonIndex] - damage);
          setSkeletonHealths(prev => {
            const newHealths = [...prev];
            newHealths[skeletonIndex] = newHealth;
            return newHealths;
          });
        }
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
              newAbilities[weapon as WeaponType][ability as 'q' | 'e'].currentCooldown -= 0.15; //global cd?
            }
          });
        });
        return newAbilities;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Add unit position state
  const [unitPosition] = useState(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    console.log(`Dummy 1 Health: ${dummyHealth}`);
  }, [dummyHealth]);

  // dis sposed to be here?
  const [skeletonHealths, setSkeletonHealths] = useState(() => 
    Array(NUM_SKELETONS).fill(200) // Create an array of skeletons with 200 health each
  );

  // Initialize skeletonProps once
  const [skeletonProps] = useState(() => 
    Array(NUM_SKELETONS).fill(null).map((_, index) => ({
      id: `skeleton-${index}`,
      initialPosition: generateRandomPosition(),
      health: 200,
      maxHealth: 200,
      onTakeDamage: (id: string, damage: number) => {
        setSkeletonHealths(prev => prev.map((health, i) => 
          i === index ? Math.max(0, health - damage) : health
        ));
      }
    }))
  );

  const handlePlayerDamage = (damage: number) => {
    setPlayerHealth(prevHealth => Math.max(0, prevHealth - damage));
  };

  const [killCount, setKillCount] = useState(0);

  // Add this handler function
  const handleEnemyDeath = useCallback(() => {
    console.log("Enemy death registered in HomePage");
    setKillCount(prev => {
      const newCount = prev + 1;
      console.log("Kill count updated:", newCount);
      return newCount;
    });
  }, []);

  // Prepare props for Scene component
  const sceneProps: SceneProps = {
    mountainData,
    treeData,
    mushroomData,
    treePositions,
    interactiveTrunkColor,
    interactiveLeafColor,
    unitProps: {
      onHit: handleHit,
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
      }, //DORMANT
      enemyData: [
        {
          id: 'dummy1',
          position: new Vector3(5, 0, 5),
          health: dummyHealth,
          maxHealth: 300,
        },
        {
          id: 'dummy2',
          position: new Vector3(-5, 0, 5),
          health: dummy2Health,
          maxHealth: 300,
        },
        // Generate skeletons with random positions
        ...Array(NUM_SKELETONS).fill(null).map((_, index) => ({
          id: `skeleton-${index}`,
          position: generateRandomPosition(),
          health: skeletonHealths[index],
          maxHealth: 200,
        })),
      ],
      onDamage: handlePlayerDamage,
      onEnemyDeath: handleEnemyDeath,
    },

    skeletonProps, // Use the memoized skeletonProps
    killCount: killCount, // Pass killCount to Scene
  };

  // Add handleReset function
  const handleReset = () => {
    // Reset player health
    setPlayerHealth(200);

    // Reset dummy health
    setDummyHealth(300);
    setDummy2Health(300);

    // Reset skeleton health
    setSkeletonHealths(Array(NUM_SKELETONS).fill(200));

    // Reset ability cooldowns
    setAbilities(prev => {
      const newAbilities = { ...prev };
      Object.keys(newAbilities).forEach(weapon => {
        ['q', 'e'].forEach(ability => {
          newAbilities[weapon as WeaponType][ability as 'q' | 'e'].currentCooldown = 0;
        });
      });
      return newAbilities;
    });

    // Reset last hit time
    setLastHitTime(0);

    // Reset kill count
    setKillCount(0);
  };

  useEffect(() => {
    const preventSpaceScroll = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventSpaceScroll);
    
    return () => {
      window.removeEventListener('keydown', preventSpaceScroll);
    };
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <Canvas shadows camera={{ position: [0, 10, 20], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <Scene {...sceneProps} />
        <OrbitControls
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
        onReset={handleReset}
        killCount={killCount}
      />
    </div>
  );
}