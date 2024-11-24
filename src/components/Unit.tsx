import { useRef, useState, useEffect } from 'react';
import { Mesh, Vector3, Group } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import Fireball from './Fireball';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls';
import Scythe from './Scythe';
import Sword from './Sword';
import GhostTrail from './GhostTrail';
import Sabres from './Sabres';
import Sabres2 from './Sabres2';
import Billboard from './Billboard';

// WeaponType enum
export enum WeaponType {
  SCYTHE = 'scythe',
  SWORD = 'sword',
  SABRES = 'sabres',
  SABRES2 = 'sabres2'
}

interface UnitProps {
  onDummyHit: () => void;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
  health: number;
  maxHealth: number;
  isPlayer?: boolean;
}

const OrbitalParticles = ({ parentRef }: { parentRef: React.RefObject<Group> }) => {
  const particlesRef = useRef<Mesh[]>([]);
  const particleCount = 8;
  const orbitRadius = 1.0;
  const orbitSpeed = 1.75;
  const particleSize = 0.13;

  const colors = Array(particleCount).fill('#39ff14');

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

export default function Unit({ onDummyHit, controlsRef, currentWeapon, onWeaponSelect, health, maxHealth, isPlayer = false }: UnitProps) {
  const groupRef = useRef<Group>(null);
  const [isSwinging, setIsSwinging] = useState(false);
  const [fireballs, setFireballs] = useState<{ id: number; position: Vector3; direction: Vector3 }[]>([]);
  const nextFireballId = useRef(0);
  const speed = 0.20; // MOVEMENT SPEED
  const { camera } = useThree();
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false
  });

  const shootFireball = () => {
    if (!groupRef.current) return;

    const unitPosition = groupRef.current.position.clone();
    unitPosition.y += 1;

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

    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new Vector3(
      -cameraDirection.z,
      0,
      cameraDirection.x
    );

    const moveDirection = new Vector3(0, 0, 0);

    if (keys.current.w) moveDirection.add(cameraDirection);
    if (keys.current.s) moveDirection.sub(cameraDirection);
    if (keys.current.a) moveDirection.sub(cameraRight);
    if (keys.current.d) moveDirection.add(cameraRight);

    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      groupRef.current.position.add(moveDirection.multiplyScalar(speed));

      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
      groupRef.current.rotation.y = targetRotation;
    }

    if (controlsRef.current) {
      const unitPosition = groupRef.current.position;
      controlsRef.current.target.set(unitPosition.x, unitPosition.y, unitPosition.z);
    }

    if (isSwinging && groupRef.current) {
      const unitPosition = groupRef.current.position;
      const treePosition = new Vector3(0, 2, -5);
      const distance = unitPosition.distanceTo(treePosition);
      
      if (distance < 3) {
        onDummyHit();
      }
    }

    // Check for sword hits during swing
    if (isSwinging && currentWeapon === WeaponType.SWORD && groupRef.current) {
      const dummyPosition = new Vector3(5, 0, 5);
      if (handleSwordHit(dummyPosition)) {
        onDummyHit();
      }
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }

      if (key === 'q' && !isSwinging) {
        setIsSwinging(true);
      }

      if (key === 'e') {
        shootFireball();
      }

      // Weapon selection using number keys
      switch (key) {
        case '1':
          onWeaponSelect(WeaponType.SCYTHE);
          break;
        case '2':
          onWeaponSelect(WeaponType.SWORD);
          break;
        case '3':
          onWeaponSelect(WeaponType.SABRES);
          break;
        case '4':
          onWeaponSelect(WeaponType.SABRES2);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSwinging, onWeaponSelect]);

  const handleSwingComplete = () => {
    setIsSwinging(false);
  };

  // Add hit detection for sword swings
  const handleSwordHit = (targetPosition: Vector3) => {
    if (!groupRef.current || !isSwinging) return false;
    
    const distance = groupRef.current.position.distanceTo(targetPosition);
    const swordRange = 3; // Adjust based on sword size
    
    // Check if target is within sword range and swing arc
    if (distance <= swordRange) {
      // Calculate angle between unit's forward direction and target
      const forward = new Vector3(0, 0, 1).applyQuaternion(groupRef.current.quaternion);
      const toTarget = targetPosition.clone().sub(groupRef.current.position).normalize();
      const angle = forward.angleTo(toTarget);
      
      // Check if target is within swing arc (120 degrees)
      if (angle <= Math.PI / 1.5) {
        return true;
      }
    }
    return false;
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
        {currentWeapon === WeaponType.SABRES2 ? (
          <Sabres2 
            isSwinging={isSwinging} 
            onSwingComplete={handleSwingComplete}
          />
        ) : currentWeapon === WeaponType.SABRES ? (
          <Sabres 
            isSwinging={isSwinging} 
            onSwingComplete={handleSwingComplete}
          />
        ) : currentWeapon === WeaponType.SCYTHE ? (
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

        {/* Add HP bar if not player */}
        {!isPlayer && (
          <Billboard
            position={[0, 2, 0]}
            lockX={false}
            lockY={false}
            lockZ={false}
          >
            <mesh>
              <planeGeometry args={[1, 0.1]} />
              <meshBasicMaterial color="#333333" />
            </mesh>
            <mesh position={[-0.5 + (health / maxHealth) * 0.5, 0, 0.001]}>
              <planeGeometry args={[(health / maxHealth), 0.08]} />
              <meshBasicMaterial color="#ff3333" />
            </mesh>
          </Billboard>
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