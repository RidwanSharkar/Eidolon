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
import Smite from './Smite';
import DamageNumber from './DamageNumber';

// WeaponType enum
export enum WeaponType {
  SCYTHE = 'scythe',
  SWORD = 'sword',
  SABRES = 'sabres',
  SABRES2 = 'sabres2'
}

// Add export to the interface declaration
export interface UnitProps {
  onDummyHit: (dummyId: 'dummy1' | 'dummy2', damage: number) => void;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
  health: number;
  maxHealth: number;
  isPlayer?: boolean;
  abilities: WeaponInfo;
  onAbilityUse: (weapon: WeaponType, ability: 'q' | 'e') => void;
}

const calculateDamage = (baseAmount: number): { damage: number; isCritical: boolean } => {
  const isCritical = Math.random() < 0.15; // 15% chance
  const damage = isCritical ? baseAmount * 2 : baseAmount;
  return { damage, isCritical };
};

const WEAPON_DAMAGES = {
  [WeaponType.SWORD]: { normal: 10, special: 25 },
  [WeaponType.SCYTHE]: { normal: 7, special: 15 },
  [WeaponType.SABRES]: { normal: 6, special: 0 }, // Special not used
  [WeaponType.SABRES2]: { normal: 6, special: 0 }, // Special not used
};

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

export default function Unit({ onDummyHit, controlsRef, currentWeapon, onWeaponSelect, health, maxHealth, isPlayer = false, abilities, onAbilityUse }: UnitProps) {
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
  const [isSmiting, setIsSmiting] = useState(false);
  const [smiteEffects, setSmiteEffects] = useState<{ id: number; position: Vector3 }[]>();
  const nextSmiteId = useRef(0);
  const [damageNumbers, setDamageNumbers] = useState<{
    id: number;
    damage: number;
    position: Vector3;
    isCritical: boolean;
  }[]>([]);
  const nextDamageNumberId = useRef(0);

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

  const handleWeaponHit = (targetPosition: Vector3) => {
    if (!groupRef.current || !isSwinging) return null;
    
    const distance = groupRef.current.position.distanceTo(targetPosition);
    const weaponRange = 3;
    
    if (distance <= weaponRange) {
      const baseDamage = isSmiting && currentWeapon === WeaponType.SWORD
        ? WEAPON_DAMAGES[WeaponType.SWORD].special 
        : WEAPON_DAMAGES[currentWeapon].normal;

      const { damage, isCritical } = calculateDamage(baseDamage);
      return { damage, isCritical };
    }
    return null;
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
      const dummyPosition = new Vector3(5, 0, 5);
      const dummy2Position = new Vector3(-5, 0, 5);
      
      const dummy1Hit = handleWeaponHit(dummyPosition);
      const dummy2Hit = handleWeaponHit(dummy2Position);
      
      if (dummy1Hit) {
        onDummyHit('dummy1', dummy1Hit.damage);
        setDamageNumbers(prev => [...prev, {
          id: nextDamageNumberId.current++,
          damage: dummy1Hit.damage,
          position: dummyPosition,
          isCritical: dummy1Hit.isCritical
        }]);
      }
      
      if (dummy2Hit) {
        onDummyHit('dummy2', dummy2Hit.damage);
        setDamageNumbers(prev => [...prev, {
          id: nextDamageNumberId.current++,
          damage: dummy2Hit.damage,
          position: dummy2Position,
          isCritical: dummy2Hit.isCritical
        }]);
      }
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }

      if (key === 'q') {
        const qAbility = abilities[currentWeapon].q;
        if (qAbility.currentCooldown <= 0 && !isSwinging) {
          setIsSwinging(true);
          onAbilityUse(currentWeapon, 'q');
        }
      }

      if (key === 'e') {
        const eAbility = abilities[currentWeapon].e;
        if (eAbility.currentCooldown <= 0) {
          if (currentWeapon === WeaponType.SWORD && !isSmiting) {
            setIsSmiting(true);
            const targetPos = groupRef.current!.position.clone();
            targetPos.add(new Vector3(0, 0, 3.5).applyQuaternion(groupRef.current!.quaternion));
            setSmiteEffects(prev => [...(prev || []), { 
              id: nextSmiteId.current++, 
              position: targetPos 
            }]);
            onAbilityUse(currentWeapon, 'e');
          } else if (currentWeapon !== WeaponType.SWORD) {
            shootFireball();
            onAbilityUse(currentWeapon, 'e');
          }
        }
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
  }, [isSwinging, onWeaponSelect, isSmiting, currentWeapon, abilities, onAbilityUse]);

  const handleSwingComplete = () => {
    setIsSwinging(false);
  };

  const handleSmiteComplete = () => {
    setIsSmiting(false);
  };

  const handleSmiteEffectComplete = (id: number) => {
    setSmiteEffects(prev => prev?.filter(effect => effect.id !== id));
  };

  const handleDamageNumberComplete = (id: number) => {
    setDamageNumbers(prev => prev.filter(dn => dn.id !== id));
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
            isSwinging={isSwinging}
            isSmiting={isSmiting}
            onSwingComplete={handleSwingComplete}
            onSmiteComplete={handleSmiteComplete}
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

      {smiteEffects?.map(effect => (
        <Smite
          key={effect.id}
          position={effect.position}
          onComplete={() => handleSmiteEffectComplete(effect.id)}
        />
      ))}

      {damageNumbers.map(dn => (
        <DamageNumber
          key={dn.id}
          damage={dn.damage}
          position={dn.position}
          isCritical={dn.isCritical}
          onComplete={() => handleDamageNumberComplete(dn.id)}
        />
      ))}
    </>
  );
}