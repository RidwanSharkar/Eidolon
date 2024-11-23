import { useRef, useState, useEffect } from 'react';
import { Mesh, Vector3, Group } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import Fireball from './Fireball';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls';
import Scythe from './Scythe';
import Sword from './Sword';
import GhostTrail from './GhostTrail';

// Add weapon type enum
export enum WeaponType {
  SCYTHE = 'scythe',
  SWORD = 'sword'
}

interface UnitProps {
  onHit: () => void;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  currentWeapon: WeaponType;
}

// ORBIT AURA
const OrbitalParticles = ({ parentRef }: { parentRef: React.RefObject<Group> }) => {
  const particlesRef = useRef<Mesh[]>([]);
  const particleCount = 8;
  const orbitRadius = 1.0;
  const orbitSpeed = 1.75;
  const particleSize = 0.13;

  // ORB COLORS x8
  const colors = [
    '#39ff14', 
    '#39ff14', 
    '#39ff14', 
    '#39ff14', 
    '#39ff14', 
    '#39ff14', 
    '#39ff14', 
    '#39ff14' 
  ];

  useFrame(() => {
    if (!parentRef.current) return;

    particlesRef.current.forEach((particle, i) => {
      const angle = (i / particleCount) * Math.PI * 2 + Date.now() * 0.001 * orbitSpeed;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      const y = Math.sin(Date.now() * 0.002 + i) * 0.2;

      particle.position.set(x, y, z);
    });
  });

  return (
    <>
      {Array.from({ length: particleCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) particlesRef.current[i] = el;
          }}
        >
          <sphereGeometry args={[particleSize, 8, 8]} />
          <meshBasicMaterial
            color={colors[i]}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </>
  );
};

export default function Unit({ onHit, controlsRef, currentWeapon }: UnitProps) {
  const groupRef = useRef<Group>(null);
  const [isSwinging, setIsSwinging] = useState(false);
  const [fireballs, setFireballs] = useState<{ id: number; position: Vector3; direction: Vector3 }[]>([]);
  const nextFireballId = useRef(0);
  const speed = 0.20;       // MOVEMENT SPEED
  const { camera } = useThree();
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false
  });

  const shootFireball = () => {
    if (!groupRef.current) return;

    // Get unit's current position and raise it to center height
    const unitPosition = groupRef.current.position.clone();
    unitPosition.y += 1;

    // Get direction unit is facing based on its current rotation
    const direction = new Vector3(0, 0, 1);
    direction.applyQuaternion(groupRef.current.quaternion);

    setFireballs(prev => [...prev, {
      id: nextFireballId.current++,
      position: unitPosition,
      direction: direction.normalize()
    }]);
  };

  const handleFireballImpact = (id: number) => {
    setFireballs(prev => prev.filter(fireball => fireball.id !== id));
  };

  useFrame(() => {
    if (!groupRef.current) return;

    // Get camera's forward direction (excluding Y component)
    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    // Get camera's right direction
    const cameraRight = new Vector3(
      -cameraDirection.z,
      0,
      cameraDirection.x
    );

    // Calculate movement direction based on key inputs
    const moveDirection = new Vector3(0, 0, 0);

    if (keys.current.w) moveDirection.add(cameraDirection);
    if (keys.current.s) moveDirection.sub(cameraDirection);
    if (keys.current.a) moveDirection.sub(cameraRight);
    if (keys.current.d) moveDirection.add(cameraRight);

    // Normalize and apply movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      groupRef.current.position.add(moveDirection.multiplyScalar(speed));

      // Rotate the character to face movement direction
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      groupRef.current.rotation.y = targetRotation;
    }

    // Update camera target
    if (controlsRef.current) {
      const unitPosition = groupRef.current.position;
      controlsRef.current.target.set(unitPosition.x, unitPosition.y, unitPosition.z);
    }

    // Rest of the existing code for swing detection
    if (isSwinging && groupRef.current) {
      const unitPosition = groupRef.current.position;
      const treePosition = new Vector3(0, 2, -5);
      const distance = unitPosition.distanceTo(treePosition);
      
      if (distance < 3) {
        onHit();
      }
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase() as keyof typeof keys.current] = true;
      }
      if (e.key.toLowerCase() === 'q' && !isSwinging) {
        setIsSwinging(true);
      }
      if (e.key.toLowerCase() === 'e') {
        shootFireball();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() in keys.current) {
        keys.current[e.key.toLowerCase() as keyof typeof keys.current] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSwinging]);

  const handleSwingComplete = () => {
    setIsSwinging(false);
  };

  return (
    <>
      <group ref={groupRef} position={[0, 1, 0]}>
        {/* HEAD  undead orb with more ethereal appearance */}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshPhongMaterial
            color="#67f2b9"
            transparent
            opacity={0.7}
            shininess={100}
          />
        </mesh>
        
        {/* Enhanced outer glow */}
        <mesh scale={1.4}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial
            color="#39ff14"
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>

        {/* Skull decoration with ethereal effect */}
        <mesh position={[0, 0.2, 0.3]} scale={0.4}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshPhongMaterial
            color="#67f2b9"
            transparent
            opacity={0.9}
            emissive="#000000"
            emissiveIntensity={0.2}
          />
        </mesh>

        <OrbitalParticles parentRef={groupRef} />
        {currentWeapon === WeaponType.SCYTHE ? (
          <Scythe 
            parentRef={groupRef}
            isSwinging={isSwinging} 
            onSwingComplete={handleSwingComplete} 
          />
        ) : (
          <Sword
            parentRef={groupRef}
            isSwinging={isSwinging}
            onSwingComplete={handleSwingComplete}
          />
        )}
      </group>

      {/* Add ghost trail effect */}
      <GhostTrail parentRef={groupRef} />

      {/* Fireballs with updated color */}
      {fireballs.map(fireball => (
        <Fireball
          key={fireball.id}
          position={fireball.position}
          direction={fireball.direction}
          onImpact={() => handleFireballImpact(fireball.id)}
        />
      ))}
    </>
  );
}