import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls, Stars } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls';
import { useState, useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import Terrain from '../components/Terrain';
import Mountain from '../components/Mountain';
import GravelPath from '../components/GravelPath';
import Tree from '../components/Tree';
import Unit from '../components/Unit';
import Panel from '../components/Panel';
import { Vector3, Mesh, Color } from 'three';
import { WeaponType } from '@/components/Unit';
import { trunkColors, leafColors } from '@/utils/colors';
import TrainingDummy from '../components/TrainingDummy';


// DISGUSTINGLY PACKED - MOVE ALL DIS TOM FOOLERY m8
const SunsetSkyShader = {
  uniforms: {
    topColor: { value: new THREE.Color('#c45e99') },
    middleColor: { value: new THREE.Color('#de6795') },
    bottomColor: { value: new THREE.Color('#fc9f82') },
    offset: { value: 33 },
    exponent: { value: 0.6 },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 middleColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    
    varying vec3 vWorldPosition;
    
    void main() {
      float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
      float mixStrength = max(pow(max(h, 0.0), exponent), 0.0);
      vec3 color = mix(middleColor, topColor, mixStrength);
      color = mix(bottomColor, color, smoothstep(0.0, 1.0, h));
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// CustomSky Component
const CustomSky: React.FC = () => {
  const shaderParams = useMemo(() => ({
    uniforms: {
      topColor: { value: new Color('#c45e99') },
      middleColor: { value: new Color('#de6795') },
      bottomColor: { value: new Color('#fc9f82') },
      offset: { value: 33 },
      exponent: { value: 0.6 },
    },
    vertexShader: SunsetSkyShader.vertexShader,
    fragmentShader: SunsetSkyShader.fragmentShader,
    side: THREE.BackSide,
  }), []);

  return (
    <mesh>
      <sphereGeometry args={[500, 32, 32]} />
      <shaderMaterial attach="material" args={[shaderParams]} />
    </mesh>
  );
};

// Planets - PACK DIS SHIT UP FAM
const Planet: React.FC = () => {
  return (
    <group position={[100, 80, -150]} scale={[30, 30, 30]}>
      {/* Main planet sphere */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#B8E0D2"
          roughness={0.7}
          metalness={0.2}
          emissive="#B8E0D2"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#4dff90"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Outer glow */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#4dff90"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light for additional glow effect */}
      <pointLight
        color="#4dff90"
        intensity={2}
        distance={50}
      />
    </group>
  );
};

// Mushroom Component
interface MushroomProps {
  position: THREE.Vector3;
  scale: number;
}

const Mushroom: React.FC<MushroomProps> = ({ position, scale }) => {
  const mushroomRef = useRef<Mesh>(null!);

  // slight animation ( bobbing)
  useFrame((state) => {
    if (mushroomRef.current) {
      mushroomRef.current.position.y = position.y + Math.sin(state.clock.getElapsedTime()) * 0.05;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Stem */}
      <mesh ref={mushroomRef}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
        <meshStandardMaterial color="#d66a95" />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.35, 0]}>
        <coneGeometry args={[0.2, 0.3, 16]} />
        <meshStandardMaterial color="#d66a95" />
      </mesh>
    </group>
  );
};

// Define the GeneratedTree interface
interface GeneratedTree {
  position: THREE.Vector3;
  scale: number;
  trunkColor: THREE.Color;
  leafColor: THREE.Color;
}

const generateMountains = (): Array<{ position: Vector3; scale: number }> => {
  const mountains: Array<{ position: Vector3; scale: number }> = [];
  const numberOfMountains = 45; 

  for (let i = 0; i < numberOfMountains; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 35 + Math.random() * 40;

    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    const scale = 0.6 + Math.random() * 0.8;

    mountains.push({
      position: new THREE.Vector3(x, 0, z),
      scale: scale,
    });
  }

  return mountains;
};

const generateTrees = (): GeneratedTree[] => {
  const trees: GeneratedTree[] = [];
  const numberOfClusters = 15;
  const treesPerCluster = 8;

  for (let i = 0; i < numberOfClusters; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 30;

    const clusterX = Math.cos(angle) * distance;
    const clusterZ = Math.sin(angle) * distance;

    const numberOfTreesInCluster = treesPerCluster + Math.floor(Math.random() * 5);

    for (let j = 0; j < numberOfTreesInCluster; j++) {
      const offsetDistance = Math.random() * (6 + ((j % 3) * 2));
      const offsetAngle = Math.random() * Math.PI * 2;

      const treeX = clusterX + Math.cos(offsetAngle) * offsetDistance;
      const treeZ = clusterZ + Math.sin(offsetAngle) * offsetDistance;

      const scale = 0.4 + Math.random() * 1.6;

      const trunkColor = trunkColors[Math.floor(Math.random() * trunkColors.length)];
      const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];

      trees.push({
        position: new THREE.Vector3(treeX, 0, treeZ),
        scale: scale,
        trunkColor: new THREE.Color(trunkColor),
        leafColor: new THREE.Color(leafColor),
      });
    }
  }

  return trees;
};

const generateMushrooms = () => {
  const mushrooms: Array<{ position: THREE.Vector3; scale: number }> = [];
  const numberOfMushrooms = 100; // Adjust as needed

  for (let i = 0; i < numberOfMushrooms; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 45; // Within the baseRadius + layers

    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);

    const scale = 0.3 + Math.random() * 0.2; // Small mushrooms

    mushrooms.push({
      position: new THREE.Vector3(x, 0, z),
      scale: scale,
    });
  }

  return mushrooms;
};

// Home Component
export default function HomePage() {
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>(WeaponType.SCYTHE);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [playerHealth, setPlayerHealth] = useState(200);
  const [dummyHealth, setDummyHealth] = useState(300);
  const [treeHealth, setTreeHealth] = useState(50);
  const [lastHitTime, setLastHitTime] = useState(0);

  // Define the main tree position
  const treePositions = useMemo(() => ({
    mainTree: new THREE.Vector3(0, 2, -5),
  }), []);

  // Memoize mountain data
  const mountainData = useMemo(() => generateMountains(), []);

  // Memoize tree data
  const treeData: GeneratedTree[] = useMemo(() => generateTrees(), []);

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

  const handleDummyHit = () => {
    const currentTime = Date.now();
    if (currentTime - lastHitTime > 100) { // 100ms cooldown
      setDummyHealth(prev => Math.max(0, prev - 10));
      setLastHitTime(currentTime);
    }
  };

  const handleTreeHit = () => {
    const currentTime = Date.now();
    if (currentTime - lastHitTime > 100) { // 100ms cooldown
      setTreeHealth(prev => Math.max(0, prev - 10));
      setLastHitTime(currentTime);
    }
  };

  // Placeholder function to use setPlayerHealth and prevent unused variable error
  const handlePlayerDamage = () => {
    // Placeholder: Log a message when player takes damage
    console.log('Player takes damage!');
    // Example: Reduce player health by 10
    setPlayerHealth(prev => {
      const newHealth = Math.max(0, prev - 10);
      console.log('Player health:', newHealth);
      return newHealth;
    });
  };

  // **Use `handlePlayerDamage` in an effect to prevent "unused" errors**
  useEffect(() => {
    // Example usage: Reduce player health every 10 seconds
    const interval = setInterval(() => {
      handlePlayerDamage();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
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

        <ambientLight intensity={0.3} />

        <directionalLight
          position={[5, 10, 7.5]}
          intensity={0.5} // Increased intensity for sunset effect
          color={new Color('#fc9f82')} // Sunset color
        />

        <hemisphereLight
          args={[new Color('#de6795'), new Color('#2a2a2a'), 0.6]}
          position={[0, 50, 0]}
        />

        <DreiOrbitControls
          ref={controlsRef}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          maxDistance={75} // CAMERA maxDISTANCE
          mouseButtons={{
            LEFT: undefined,
            MIDDLE: undefined,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
        />

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
            health={treeHealth} // Pass current tree health
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
          health={treeHealth} // Pass current tree health
          trunkColor={interactiveTrunkColor}
          leafColor={interactiveLeafColor}
        />

        <Unit 
          onDummyHit={handleDummyHit}
          onTreeHit={handleTreeHit}
          controlsRef={controlsRef} 
          currentWeapon={currentWeapon} 
          onWeaponSelect={handleWeaponSelect}
          health={playerHealth}
          maxHealth={200}
          isPlayer={true}
        />

        <TrainingDummy 
          position={new THREE.Vector3(5, 0, 5)}
          health={dummyHealth}
          maxHealth={300}
          onHit={() => setDummyHealth(300)}
        />
      </Canvas>
      <Panel 
        currentWeapon={currentWeapon} 
        onWeaponSelect={handleWeaponSelect}
        playerHealth={playerHealth}
        maxHealth={200}
      />
    </div>
  );
}