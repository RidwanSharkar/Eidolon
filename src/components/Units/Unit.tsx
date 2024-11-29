import { useRef, useState, useEffect, useCallback } from 'react';
import { Mesh, Vector3, Group } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import Fireball from '../Spells/Fireball';
import OrbitControlsImpl from 'three/examples/jsm/controls/OrbitControls';
import Scythe from '../Weapons/Scythe';
import Sword from '../Weapons/Sword';
import GhostTrail from '../Effects/GhostTrail';
import Sabres from '../Weapons/Sabres';
import Sabres2 from '../Weapons/Sabres2';
import Billboard from '../UI/Billboard';
import Smite from '../Spells/Smite';
import DamageNumber from '../UI/DamageNumber';
import * as THREE from 'three';
import { WeaponType, WeaponInfo } from '../../types/weapons';
import { WEAPON_DAMAGES } from '../../constants/weaponStats';
import EtherealBow from '../Weapons/EtherealBow';
import BoneWings from './BoneWings';
// NEEDS COLLOSAL REFACTORING hamie

export interface UnitProps {
  onHit: (targetId: string, damage: number) => void;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
  health: number;
  maxHealth: number;
  isPlayer?: boolean;
  abilities: WeaponInfo;
  onAbilityUse: (weapon: WeaponType, ability: 'q' | 'e') => void;
  onPositionUpdate: (position: THREE.Vector3) => void;
  enemyData: Array<{
    id: string;
    position: Vector3;
    health: number;
    maxHealth: number;
  }>;
}

const calculateDamage = (baseAmount: number): { damage: number; isCritical: boolean } => {
  const isCritical = Math.random() < 0.15; // 15% chance
  const damage = isCritical ? baseAmount * 2 : baseAmount;
  return { damage, isCritical };
};

const OrbitalParticles = ({ parentRef, fireballCharges }: { 
  parentRef: React.RefObject<Group>;
  fireballCharges: Array<{ id: number; available: boolean; cooldownStartTime: number | null }>;
}) => {
  const particlesRef = useRef<Mesh[]>([]);
  const particleCount = 8;
  const orbitRadius = 0.875;
  const orbitSpeed = 1.75;
  const particleSize = 0.125;

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
      {Array.from({ length: particleCount }).map((_, i) => {
        const chargeStatus = fireballCharges[i];
        
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) particlesRef.current[i] = el;
            }}
          >
            <sphereGeometry args={[particleSize, 8, 8]} />
            <meshStandardMaterial
              color={chargeStatus?.available ? "#00ff44" : "#333333"}
              emissive={chargeStatus?.available ? "#00ff44" : "#333333"}
              emissiveIntensity={chargeStatus?.available ? 2 : 0.5}
              transparent
              opacity={chargeStatus?.available ? 0.8 : 0.4}
            />
          </mesh>
        );
      })}
    </>
  );
};

interface FireballData {
  id: number;
  position: Vector3;
  direction: Vector3;
  startPosition: Vector3;
  maxDistance: number;
}

// ORB CHARGE COOLDOWN
const FIREBALL_COOLDOWN = 9000; // 6 seconds 

export default function Unit({ onHit, controlsRef, currentWeapon, onWeaponSelect, health, maxHealth, isPlayer = false, abilities, onAbilityUse, onPositionUpdate, enemyData }: UnitProps) {
  const groupRef = useRef<Group>(null);
  const [isSwinging, setIsSwinging] = useState(false);
  const [fireballs, setFireballs] = useState<FireballData[]>([]);
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
  const [smiteEffects, setSmiteEffects] = useState<{ id: number; position: Vector3 }[]>([]);
  const nextSmiteId = useRef(0);
  const [damageNumbers, setDamageNumbers] = useState<{
    id: number;
    damage: number;
    position: Vector3;
    isCritical: boolean;
    isLightning?: boolean;
  }[]>([]);
  const nextDamageNumberId = useRef(0);
  const [hitCountThisSwing, setHitCountThisSwing] = useState<Record<string, number>>({});
  const [isBowCharging, setIsBowCharging] = useState(false);
  const [bowChargeProgress, setBowChargeProgress] = useState(0);
  const bowChargeStartTime = useRef<number | null>(null);
  const bowChargeLineOpacity = useRef(0);
  const [activeProjectiles, setActiveProjectiles] = useState<Array<{
    id: number;
    position: Vector3;
    direction: Vector3;
    power: number;
    startTime: number;
    maxDistance: number;
    startPosition: Vector3;
  }>>([]);
  const [fireballCharges, setFireballCharges] = useState<Array<{
    id: number;
    available: boolean;
    cooldownStartTime: number | null;
  }>>([
    { id: 1, available: true, cooldownStartTime: null },
    { id: 2, available: true, cooldownStartTime: null },
    { id: 3, available: true, cooldownStartTime: null },
    { id: 4, available: true, cooldownStartTime: null },
    { id: 5, available: true, cooldownStartTime: null },
    { id: 6, available: true, cooldownStartTime: null },
    { id: 7, available: true, cooldownStartTime: null },
    { id: 8, available: true, cooldownStartTime: null }
  ]);
  const [collectedBones, setCollectedBones] = useState<number>(15); // Start with 15 bones for testing

  const shootFireball = useCallback(() => {
    if (!groupRef.current) return;

    const availableChargeIndex = fireballCharges.findIndex(charge => charge.available);
    if (availableChargeIndex === -1) return;

    const unitPosition = groupRef.current.position.clone();
    unitPosition.y += 1;

    const direction = new Vector3(0, 0, 1);
    direction.applyQuaternion(groupRef.current.quaternion);

    setFireballCharges(prev => prev.map((charge, index) => 
      index === availableChargeIndex
        ? { ...charge, available: false, cooldownStartTime: Date.now() }
        : charge
    ));

    setFireballs(prev => [...prev, {
      id: nextFireballId.current++,
      position: unitPosition.clone(),
      startPosition: unitPosition.clone(),
      direction: direction.normalize(),
      maxDistance: 15
    }]);
  }, [groupRef, fireballCharges, setFireballCharges, setFireballs]);

  const handleFireballImpact = (id: number) => {
    setFireballs(prev => prev.filter(fireball => fireball.id !== id));
  };

  const handleWeaponHit = (targetPosition: Vector3, targetId: string) => {
    if (!groupRef.current || !isSwinging) return null;

    const isEnemy = targetId.startsWith('enemy');
    const isDummy = targetId.startsWith('dummy');
    
    if (isEnemy && isDummy) return null;
    if (!isEnemy && !isDummy) return null;

    const maxHits = isEnemy 
      ? 2 // SWING RADIUS>!? forgot
      : (currentWeapon === WeaponType.SABRES || currentWeapon === WeaponType.SABRES2 ? 2 : 1);
    const currentHits = hitCountThisSwing[targetId] || 0;

    if (currentHits >= maxHits) return null;

    const distance = groupRef.current.position.distanceTo(targetPosition);
    const weaponRange = (currentWeapon === WeaponType.SABRES || currentWeapon === WeaponType.SABRES2) ? 5.0 : 4.5;

    if (distance <= weaponRange) {
      setHitCountThisSwing(prev => ({
        ...prev,
        [targetId]: (prev[targetId] || 0) + 1
      }));

      let baseDamage = WEAPON_DAMAGES[currentWeapon].normal;
      
      // Smite initial hit damage (10)
      if (isSmiting && currentWeapon === WeaponType.SWORD) {
        baseDamage = 10;
        const { damage, isCritical } = calculateDamage(baseDamage);
        onHit(targetId, damage);

        // Add the damage number for the initial hit
        setDamageNumbers(prev => [...prev, {
          id: nextDamageNumberId.current++,
          damage,
          position: targetPosition,
          isCritical
        }]);

        // Add delayed lightning damage (250ms instead of 100ms)
        setTimeout(() => {
          const { damage: lightningDamage, isCritical: lightningCrit } = calculateDamage(25);
          onHit(targetId, lightningDamage);
          setDamageNumbers(prev => [...prev, {
            id: nextDamageNumberId.current++,
            damage: lightningDamage,
            position: targetPosition,
            isCritical: lightningCrit,
            isLightning: true
          }]);
        }, 250);

        return { damage, isCritical };
      }

      // Normal weapon hit handling
      const { damage, isCritical } = calculateDamage(baseDamage);
      onHit(targetId, damage);

      // Special handling for Sabres to offset damage numbers
      if (currentWeapon === WeaponType.SABRES) {
        const offset = currentHits === 0 ? -0.4 : 0.4;
        setDamageNumbers(prev => [...prev, {
          id: nextDamageNumberId.current++,
          damage,
          position: new Vector3(
            targetPosition.x + offset,
            targetPosition.y,
            targetPosition.z
          ),
          isCritical
        }]);
      } else {
        setDamageNumbers(prev => [...prev, {
          id: nextDamageNumberId.current++,
          damage,
          position: targetPosition,
          isCritical
        }]);
      }

      return { damage, isCritical };
    }

    return null;
  };

  const handleSwingComplete = () => {
    setIsSwinging(false);
    setHitCountThisSwing({});
    setIsSmiting(false); // Reset smiting after swing
  };

  useFrame((_, delta) => {
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
      // Handle hits for training dummies
      const dummy1Position = new Vector3(5, 0, 5);
      const dummy2Position = new Vector3(-5, 0, 5);
      
      handleWeaponHit(dummy1Position, 'dummy1');
      handleWeaponHit(dummy2Position, 'dummy2');
      
      // Handle hits for enemy units
      enemyData.forEach(enemy => {
        const enemyPos = enemy.position.clone();
        enemyPos.y = 1.5;
        handleWeaponHit(enemyPos, enemy.id);
      });
    }

    if (groupRef.current) {
      onPositionUpdate(groupRef.current.position);
    }

    // Use delta for smoother bow charging
    if (isBowCharging && bowChargeStartTime.current !== null) {
      const chargeTime = (Date.now() - bowChargeStartTime.current) / 1000;
      const progress = Math.min(chargeTime / 2, 1); // 2 seconds for full charge
      setBowChargeProgress(progress);

      // Smooth charge line opacity using delta
      const targetOpacity = progress;
      const currentOpacity = bowChargeLineOpacity.current;
      bowChargeLineOpacity.current += (targetOpacity - currentOpacity) * delta * 5;

      if (progress >= 1) {
        releaseBowShot(1);
      }
    }

    // Update projectiles with range limit and collision detection
    setActiveProjectiles(prev => prev.map(projectile => {
      // Calculate distance traveled
      const distanceTraveled = projectile.position.distanceTo(projectile.startPosition);
      
      if (distanceTraveled < projectile.maxDistance) {
        const speed = 0.5;
        projectile.position.add(
          projectile.direction
            .clone()
            .multiplyScalar(speed)
        );

        // Check for collisions with enemies
        enemyData.forEach(enemy => {
          const distanceToEnemy = projectile.position.distanceTo(enemy.position);
          if (distanceToEnemy < 1.5) { // Hit radius
            handleProjectileHit(projectile.id, enemy.id, enemy.position.clone());
          }
        });
        
        return projectile;
      }
      return projectile;
    }).filter(projectile => {
      const distanceTraveled = projectile.position.distanceTo(projectile.startPosition);
      return distanceTraveled < projectile.maxDistance;
    }));

    // Update fireballs with collision detection
    setFireballs(prev => prev.map(fireball => {
      const distanceTraveled = fireball.position.distanceTo(fireball.startPosition);
      
      if (distanceTraveled >= fireball.maxDistance) {
        return null;
      }

      // Move the fireball
      const speed = 0.5;
      fireball.position.add(
        fireball.direction
          .clone()
          .multiplyScalar(speed)
      );

      // Check dummy collisions
      const dummy1Pos = new Vector3(5, 1.5, 5);
      const dummy2Pos = new Vector3(-5, 1.5, 5);
      
      if (fireball.position.distanceTo(dummy1Pos) < 1.5) {
        handleFireballHit(fireball.id, 'dummy1', dummy1Pos);
        return null;
      }
      
      if (fireball.position.distanceTo(dummy2Pos) < 1.5) {
        handleFireballHit(fireball.id, 'dummy2', dummy2Pos);
        return null;
      }

      // Check enemy collisions
      for (const enemy of enemyData) {
        const enemyPos = enemy.position.clone();
        enemyPos.y = 1.5;
        if (fireball.position.distanceTo(enemyPos) < 1.5) {
          handleFireballHit(fireball.id, enemy.id, enemyPos);
          return null;
        }
      }

      return fireball;
    }).filter(Boolean) as FireballData[]);

    // Update fireball charge cooldowns
    setFireballCharges(prev => prev.map(charge => {
      if (!charge.available && charge.cooldownStartTime) {
        const elapsedTime = Date.now() - charge.cooldownStartTime;
        if (elapsedTime >= FIREBALL_COOLDOWN) {
          return { ...charge, available: true, cooldownStartTime: null };
        }
      }
      return charge;
    }));
  });

  const releaseBowShot = useCallback((power: number) => {
    if (!groupRef.current) return;

    // Increase base damage for charged shots
    const damage = Math.floor(power >= 1 ? 40 : Math.max(20 * power, 5));
    const unitPosition = groupRef.current.position.clone();
    unitPosition.y += 1;

    const direction = new Vector3(0, 0, 1);
    direction.applyQuaternion(groupRef.current.quaternion);

    const maxRange = 15;
    const rayStart = unitPosition.clone();
    
    // Create a ray for hit detection
    const ray = new THREE.Ray(rayStart, direction.normalize());

    // Check hits on training dummies and enemy units
    const targets: Array<{ position: Vector3; id: string | 'dummy1' | 'dummy2' }> = [
      { position: new Vector3(5, 0, 5), id: 'dummy1' as const },
      { position: new Vector3(-5, 0, 5), id: 'dummy2' as const },
      // Add enemy positions dynamically
      // This requires accessing enemy data, possibly via context or props
    ];

    // Here, you should integrate with your enemy management system
    // For example, pass enemy positions and IDs via props or context
    // Assuming you have access to enemy data here

    // Example:
    // props.enemies.forEach(enemy => {
    //   targets.push({ position: enemy.position, id: enemy.id });
    // });

    // For demonstration, we'll assume a static reference
    // Replace this with dynamic data as per your implementation
    // ...

    // Update to target enemy units dynamically
    // This requires passing enemy data to Unit component or using a global state
    // For simplicity, here's how you might do it with props (not shown here)
    // Ensure to update the 'targets' array accordingly

    targets.forEach(dummy => {
      const dummyPos = dummy.position.clone();
      dummyPos.y = 1;
      
      const distanceToRay = ray.distanceToPoint(dummyPos);
      const distanceAlongRay = ray.direction.dot(dummyPos.clone().sub(rayStart));
      
      // Increased hit radius and more forgiving hit detection
      const hitRadius = 1.5;
      if (distanceToRay < hitRadius && distanceAlongRay > 0 && distanceAlongRay < maxRange) {
        const { damage: finalDamage, isCritical } = calculateDamage(damage);
        onHit(dummy.id, finalDamage);
        setDamageNumbers(prev => [...prev, {
          id: nextDamageNumberId.current++,
          damage: finalDamage,
          position: dummy.position.clone(),
          isCritical: power >= 1 || isCritical
        }]);
      }
    });

    // Add projectile with max range limit
    setActiveProjectiles(prev => [...prev, {
      id: Date.now(),
      position: rayStart.clone(),
      direction: direction.clone(),
      power,
      startTime: Date.now(),
      maxDistance: maxRange,
      startPosition: rayStart.clone() // Store initial position to track distance traveled
    }]);

    setIsBowCharging(false);
    setBowChargeProgress(0);
    bowChargeStartTime.current = null;
    onAbilityUse(currentWeapon, 'e');
  }, [currentWeapon, groupRef, onHit, setDamageNumbers, setActiveProjectiles, onAbilityUse]);

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
            setIsSwinging(true);
            const targetPos = groupRef.current!.position.clone();
            targetPos.add(new Vector3(0, 0, 3.5).applyQuaternion(groupRef.current!.quaternion));
            setSmiteEffects(prev => [...prev, { 
              id: nextSmiteId.current++, 
              position: targetPos 
            }]);
            onAbilityUse(currentWeapon, 'e');
          } else if ((currentWeapon === WeaponType.SABRES || currentWeapon === WeaponType.SABRES2) && !isBowCharging) {
            // Only start charging if we're not already charging
            setIsBowCharging(true);
            bowChargeStartTime.current = Date.now();
          } else if (!(currentWeapon === WeaponType.SABRES || currentWeapon === WeaponType.SABRES2)) {
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

      if (key === 'e' && isBowCharging) {
        releaseBowShot(bowChargeProgress);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shootFireball, isSwinging, onWeaponSelect, isSmiting, currentWeapon, abilities, onAbilityUse, isBowCharging, bowChargeProgress, releaseBowShot]);

  const handleSmiteComplete = () => {
    setIsSmiting(false);
    setIsSwinging(false);
    setHitCountThisSwing({});
  };

  const handleSmiteEffectComplete = (id: number) => {
    setSmiteEffects(prev => prev.filter(effect => effect.id !== id));
  };

  const handleDamageNumberComplete = (id: number) => {
    setDamageNumbers(prev => prev.filter(dn => dn.id !== id));
  };

  useEffect(() => {
    if (currentWeapon === WeaponType.SABRES || currentWeapon === WeaponType.SABRES2) {
      setHitCountThisSwing({});
    }
  }, [currentWeapon]);

  const handleProjectileHit = (projectileId: number, targetId: string, targetPosition: Vector3) => {
    const isEnemy = targetId.startsWith('enemy');
    if (!isEnemy) return; // Only hit enemies with projectiles

    const baseDamage = WEAPON_DAMAGES[currentWeapon].normal;
    const { damage, isCritical } = calculateDamage(baseDamage);
    
    onHit(targetId, damage);
    setDamageNumbers(prev => [...prev, {
      id: nextDamageNumberId.current++,
      damage,
      position: targetPosition,
      isCritical
    }]);

    // Remove the projectile
    setActiveProjectiles(prev => prev.filter(p => p.id !== projectileId));
  };

  const handleFireballHit = (fireballId: number, targetId: string, targetPosition: Vector3) => {
    const isEnemy = targetId.startsWith('enemy');
    const isDummy = targetId.startsWith('dummy');
    
    if (!isEnemy && !isDummy) return;

    const baseDamage = 15; // Fixed fireball damage
    const { damage, isCritical } = calculateDamage(baseDamage);
    
    onHit(targetId, damage);
    setDamageNumbers(prev => [...prev, {
      id: nextDamageNumberId.current++,
      damage,
      position: targetPosition.clone(),
      isCritical
    }]);

    // Remove the fireball
    handleFireballImpact(fireballId);
  };

  const handleEnemyDefeat = useCallback((enemyId: string) => {
    // Increment collected bones (max 30)
    setCollectedBones(prev => Math.min(prev + 1, 30));
    
    // ... rest of your existing defeat handling logic
  }, []);

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

        {/* Add Bone Wings with proper position/rotation vectors */}
        <group position={[0, 0.2, -0.2]}>
          {/* Left Wing */}
          <group rotation={[0, Math.PI / 8, 0]}>
            <BoneWings 
              collectedBones={collectedBones} 
              isLeftWing={true}
              parentRef={groupRef} 
            />
          </group>
          
          {/* Right Wing */}
          <group rotation={[0, -Math.PI / 8, 0]}>
            <BoneWings 
              collectedBones={collectedBones} 
              isLeftWing={false}
              parentRef={groupRef} 
            />
          </group>
        </group>

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

        <OrbitalParticles parentRef={groupRef} fireballCharges={fireballCharges} />
        {currentWeapon === WeaponType.SABRES2 ? (
          <Sabres2 
            isSwinging={isSwinging} 
            onSwingComplete={handleSwingComplete}
            onLeftSwingStart={() => {}}
            onRightSwingStart={() => {}}
          />
        ) : currentWeapon === WeaponType.SABRES ? (
          <Sabres 
            isSwinging={isSwinging} 
            onSwingComplete={handleSwingComplete}
            onLeftSwingStart={() => {}}
            onRightSwingStart={() => {}}
            isBowCharging={isBowCharging}
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

      {smiteEffects.map(effect => (
        <Smite
          key={effect.id}
          weaponType={currentWeapon}
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
          isLightning={dn.isLightning}
          onComplete={() => handleDamageNumberComplete(dn.id)}
        />
      ))}

      {(currentWeapon === WeaponType.SABRES || currentWeapon === WeaponType.SABRES2) && isBowCharging && (
        <EtherealBow
          position={groupRef.current?.position.clone().add(new Vector3(0, 1, 0)) || new Vector3()}
          direction={new Vector3(0, 0, 1).applyQuaternion(groupRef.current?.quaternion || new THREE.Quaternion())}
          chargeProgress={bowChargeProgress}
          isCharging={isBowCharging}
          onRelease={releaseBowShot}
        />
      )}

      {activeProjectiles.map(projectile => (
        <group key={projectile.id}>
          <group
            position={projectile.position.toArray()}
            rotation={[
              0,
              Math.atan2(projectile.direction.x, projectile.direction.z),
              0
            ]}
          >
            <mesh rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.4, 1.2, 8]} />
              <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={5}
                transparent
                opacity={0.9}
              />
            </mesh>

            <mesh rotation={[Math.PI/2, 0, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={8}
                transparent
                opacity={0.7}
              />
            </mesh>

            <mesh scale={[1.2, 1.2, 1.5]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color="#80ffff"
                emissive="#40ffff"
                emissiveIntensity={3}
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {[...Array(4)].map((_, i) => (
              <mesh
                key={i}
                position={[
                  Math.sin(Date.now() * 0.01 + i) * 0.2,
                  Math.cos(Date.now() * 0.01 + i) * 0.2,
                  -i * 0.3
                ]}
              >
                <sphereGeometry args={[0.15 - i * 0.03, 8, 8]} />
                <meshStandardMaterial
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={4}
                  transparent
                  opacity={0.5 - i * 0.1}
                />
              </mesh>
            ))}

            {[...Array(3)].map((_, i) => (
              <mesh
                key={`ring-${i}`}
                position={[0, 0, -i * 0.4]}
                rotation={[Math.PI / 2, 0, Date.now() * 0.003 + i * Math.PI / 3]}
              >
                <torusGeometry args={[0.5 + i * 0.1, 0.05, 8, 16]} />
                <meshStandardMaterial
                  color="#00ffff"
                  emissive="#00ffff"
                  emissiveIntensity={3}
                  transparent
                  opacity={0.4 - i * 0.1}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            ))}

            <pointLight 
              color="#00ffff" 
              intensity={4} 
              distance={5}
              decay={2}
            />

            <pointLight
              color="#80ffff"
              intensity={2}
              distance={8}
              decay={1}
            />
          </group>

          {projectile.power >= 1 && (
            <group
              position={projectile.position.toArray()}
              rotation={[
                0,
                Math.atan2(projectile.direction.x, projectile.direction.z),
                0
              ]}
            >
              {[...Array(12)].map((_, i) => {
                const scale = 1 - (i * 0.08);
                const opacity = 0.8 - (i * 0.06);
                const offset = -i * 0.5;
                
                return (
                  <group 
                    key={`power-trail-${i}`}
                    position={[0, 0, offset]}
                    scale={[scale * 0.6, scale * 0.6, 1]}
                  >
                    <mesh>
                      <torusGeometry args={[0.5, 0.15, 8, 16]} />
                      <meshStandardMaterial
                        color="#00ffff"
                        emissive="#00ffff"
                        emissiveIntensity={8}
                        transparent
                        opacity={opacity}
                        blending={THREE.AdditiveBlending}
                      />
                    </mesh>

                    <mesh scale={1.2}>
                      <torusGeometry args={[0.5, 0.2, 8, 16]} />
                      <meshStandardMaterial
                        color="#ffffff"
                        emissive="#80ffff"
                        emissiveIntensity={5}
                        transparent
                        opacity={opacity * 0.5}
                        blending={THREE.AdditiveBlending}
                      />
                    </mesh>
                  </group>
                );
              })}

              <pointLight
                color="#00ffff"
                intensity={3}
                distance={6}
                decay={2}
              />
            </group>
          )}
        </group>
      ))}
    </>
  );
}