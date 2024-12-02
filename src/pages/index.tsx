import { Canvas } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import Scene from '../components/Scene/Scene';
import Panel from '../components/UI/Panel';
import { WeaponType } from '../types/weapons';
import { trunkColors, leafColors } from '@/utils/colors';
import { generateMountains, generateTrees, generateMushrooms } from '@/utils/terrainGenerators';
import { Vector3 } from 'three';
import OrbitControls from 'three/examples/jsm/controls/OrbitControls';
import { SceneProps } from '@/types/SceneProps';

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

// Add this helper function at the top of the file, after the imports
const generateRandomPosition = () => {
  const radius = 30; // Increased radius for more spread
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random()) * radius; // Using sqrt for more even distribution
  return new Vector3(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
};

// Modify the number of skeletons
const NUM_SKELETONS = 5;  // Changed from 30 to 5

// Home Component
export default function HomePage() {
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>(WeaponType.SCYTHE);
  const controlsRef = useRef<OrbitControls>(null) as React.MutableRefObject<OrbitControls | null>;
  const [playerHealth] = useState(200);
  const [dummyHealth, setDummyHealth] = useState(300);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [dummy2Health, setDummy2Health] = useState(300);
  const [abilities, setAbilities] = useState<WeaponInfo>({
    [WeaponType.SWORD]: {
      q: { key: 'q', cooldown: 1.4, currentCooldown: 0, icon: '/icons/q2.svg', maxCooldown: 1, name: 'Sword Q' },
      e: { key: 'e', cooldown: 3, currentCooldown: 0, icon: '/icons/e2.svg', maxCooldown: 3, name: 'Sword E' }
    },
    [WeaponType.SCYTHE]: {
      q: { key: 'q', cooldown: 1, currentCooldown: 0, icon: '/icons/q1.svg', maxCooldown: 1, name: 'Scythe Q' },
      e: { key: 'e', cooldown: 0.33, currentCooldown: 0, icon: '/icons/e1.svg', maxCooldown: 1, name: 'Scythe E' }
    },
    [WeaponType.SABRES]: {
      q: { key: 'q', cooldown: 1, currentCooldown: 0, icon: '/icons/q3.svg', maxCooldown: 1, name: 'Sabres Q' },
      e: { key: 'e', cooldown: 0.5, currentCooldown: 0, icon: '/icons/e3.svg', maxCooldown: 1, name: 'Sabres E' }
    },
    [WeaponType.SABRES2]: {
      q: { key: 'q', cooldown: 1, currentCooldown: 0, icon: '/icons/sabres2_q.svg', maxCooldown: 1, name: 'Sabres2 Q' },
      e: { key: 'e', cooldown: 3, currentCooldown: 0, icon: '/icons/sabres2_e.svg', maxCooldown: 3, name: 'Sabres2 E' }
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

  // Update the dummy reset handlers
  const handleDummy1Reset = useCallback(() => {
    console.log('handleDummy1Reset called');
    console.log('Resetting Dummy 1 health to max');
    requestAnimationFrame(() => {
      setDummyHealth(300);
      console.log('Dummy 1 health set to 300');
    });
  }, []);

  const handleDummy2Reset = useCallback(() => {
    console.log('handleDummy2Reset called');
    console.log('Resetting Dummy 2 health to max');
    requestAnimationFrame(() => {
      setDummy2Health(300);
      console.log('Dummy 2 health set to 300');
    });
  }, []);

  useEffect(() => {
    console.log(`Dummy 1 Health: ${dummyHealth}`);
  }, [dummyHealth]);

  // Update the skeleton health state to handle 30 skeletons
  const [skeletonHealths, setSkeletonHealths] = useState(() => 
    Array(NUM_SKELETONS).fill(200) // Create an array of 30 skeletons with 200 health each
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

  // Prepare props for Scene component
  const sceneProps: SceneProps = {
    mountainData,
    treeData,
    mushroomData,
    treePositions,
    interactiveTrunkColor,
    interactiveLeafColor,
    unitProps: {
      dummyProps: [],
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
      },
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
        // Generate 30 skeletons with random positions
        ...Array(NUM_SKELETONS).fill(null).map((_, index) => ({
          id: `skeleton-${index}`,
          position: generateRandomPosition(),
          health: skeletonHealths[index],
          maxHealth: 200,
        })),
      ],
    },
    dummyProps: [
      {
        id: 'dummy1',
        position: new Vector3(5, 0, 5),
        health: dummyHealth,
        maxHealth: 300,
        onHit: handleDummy1Reset,
      },
      {
        id: 'dummy2',
        position: new Vector3(-5, 0, 5),
        health: dummy2Health,
        maxHealth: 300,
        onHit: handleDummy2Reset,
      }
    ],
    skeletonProps // Use the memoized skeletonProps
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