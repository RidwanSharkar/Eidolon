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
  onPositionUpdate: (position: THREE.Vector3) => void;
}

const calculateDamage = (baseAmount: number): { damage: number; isCritical: boolean } => {
  const isCritical = Math.random() < 0.15; // 15% chance
  const damage = isCritical ? baseAmount * 2 : baseAmount;
  return { damage, isCritical };
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

export default function Unit({ onDummyHit, controlsRef, currentWeapon, onWeaponSelect, health, maxHealth, isPlayer = false, abilities, onAbilityUse, onPositionUpdate }: UnitProps) {
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

  const handleWeaponHit = (targetPosition: Vector3, targetId: 'dummy1' | 'dummy2') => {
    if (!groupRef.current || !isSwinging) return null;
    
    const isDualWielding = currentWeapon === WeaponType.SABRES || currentWeapon === WeaponType.SABRES2;
    const maxHits = isDualWielding ? 2 : 1;
    const currentHits = hitCountThisSwing[targetId] || 0;
    
    if (currentHits >= maxHits) return null;
    
    const distance = groupRef.current.position.distanceTo(targetPosition);
    const weaponRange = isDualWielding ? 5.0 : 4.5;
    
    if (distance <= weaponRange) {
      setHitCountThisSwing(prev => ({
        ...prev,
        [targetId]: (prev[targetId] || 0) + 1
      }));
      
      let baseDamage;
      if (currentWeapon === WeaponType.SWORD && isSmiting) {
        baseDamage = 10; // Regular swing damage during smite
        const { damage, isCritical } = calculateDamage(baseDamage);
        
        // Add the damage number for the swing
        setDamageNumbers(prev => [...prev, {
          id: nextDamageNumberId.current++,
          damage,
          position: targetPosition,
          isCritical
        }]);
        onDummyHit(targetId, damage);
        
        // Add delayed lightning damage
        setTimeout(() => {
          const { damage: lightningDamage, isCritical: lightningCrit } = calculateDamage(25);
          onDummyHit(targetId, lightningDamage);
          setDamageNumbers(prev => [...prev, {
            id: nextDamageNumberId.current++,
            damage: lightningDamage,
            position: targetPosition,
            isCritical: lightningCrit,
            isLightning: true
          }]);
        }, 250);
        
        return { damage, isCritical };
      } else {
        baseDamage = WEAPON_DAMAGES[currentWeapon].normal;
        const { damage, isCritical } = calculateDamage(baseDamage);
        onDummyHit(targetId, damage);
        setDamageNumbers(prev => [...prev, {
          id: nextDamageNumberId.current++,
          damage,
          position: targetPosition,
          isCritical
        }]);
        return { damage, isCritical };
      }
    }
    return null;
  };

  const handleSwingComplete = () => {
    setIsSwinging(false);
    setHitCountThisSwing({});
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
      const dummyPosition = new Vector3(5, 0, 5);
      const dummy2Position = new Vector3(-5, 0, 5);
      
      const dummy1Hit = handleWeaponHit(dummyPosition, 'dummy1');
      const dummy2Hit = handleWeaponHit(dummy2Position, 'dummy2');
      
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

    // Update projectiles with range limit
    setActiveProjectiles(prev => prev.map(projectile => {
      const elapsed = (Date.now() - projectile.startTime) / 1000;
      
      // Calculate distance traveled
      const distanceTraveled = projectile.position.distanceTo(projectile.startPosition);
      
      if (distanceTraveled < projectile.maxDistance) {
        const speed = 0.5;
        const wave = Math.sin(elapsed * 10) * 0.05;
        
        projectile.position.add(
          projectile.direction
            .clone()
            .multiplyScalar(speed)
            .add(new Vector3(wave, wave, 0))
        );
        
        return projectile;
      }
      return projectile;
    }).filter(projectile => {
      // Remove projectiles that have exceeded their range or time limit
      const elapsed = (Date.now() - projectile.startTime) / 1000;
      const distanceTraveled = projectile.position.distanceTo(projectile.startPosition);
      return elapsed < 0.5 && distanceTraveled < projectile.maxDistance;
    }));
  });

  const releaseBowShot = useCallback((power: number) => {
    if (!groupRef.current) return;

    const damage = power >= 1 ? 40 : 5;
    const unitPosition = groupRef.current.position.clone();
    unitPosition.y += 1;

    const direction = new Vector3(0, 0, 1);
    direction.applyQuaternion(groupRef.current.quaternion);

    const maxRange = 15;
    const rayStart = unitPosition.clone();
    
    // Create a ray for hit detection
    const ray = new THREE.Ray(rayStart, direction.normalize());

    // Check hits on training dummies
    [
      { position: new Vector3(5, 0, 5), id: 'dummy1' as const },
      { position: new Vector3(-5, 0, 5), id: 'dummy2' as const }
    ].forEach(dummy => {
      const dummyPos = dummy.position.clone();
      dummyPos.y = 1;
      
      const distanceToRay = ray.distanceToPoint(dummyPos);
      const distanceAlongRay = ray.direction.dot(dummyPos.clone().sub(rayStart));
      
      const hitRadius = 1;
      if (distanceToRay < hitRadius && distanceAlongRay > 0 && distanceAlongRay < maxRange) {
        onDummyHit(dummy.id, damage);
        setDamageNumbers(prev => [...prev, {
          id: nextDamageNumberId.current++,
          damage,
          position: dummy.position.clone(),
          isCritical: power >= 1
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
  }, [currentWeapon, groupRef, onDummyHit, setDamageNumbers, setActiveProjectiles, onAbilityUse]);

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
            setSmiteEffects(prev => [...(prev || []), { 
              id: nextSmiteId.current++, 
              position: targetPos 
            }]);
            onAbilityUse(currentWeapon, 'e');
          } else if (currentWeapon === WeaponType.SABRES || currentWeapon === WeaponType.SABRES2) {
            setIsBowCharging(true);
            bowChargeStartTime.current = Date.now();
          } else {
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
  }, [isSwinging, onWeaponSelect, isSmiting, currentWeapon, abilities, onAbilityUse, isBowCharging, bowChargeProgress, releaseBowShot]);

  const handleSmiteComplete = () => {
    setIsSmiting(false);
    setIsSwinging(false);
    setHitCountThisSwing({});
  };

  const handleSmiteEffectComplete = (id: number) => {
    setSmiteEffects(prev => prev?.filter(effect => effect.id !== id));
  };

  const handleDamageNumberComplete = (id: number) => {
    setDamageNumbers(prev => prev.filter(dn => dn.id !== id));
  };

  useEffect(() => {
    if (currentWeapon === WeaponType.SABRES || currentWeapon === WeaponType.SABRES2) {
      setHitCountThisSwing({});
    }
  }, [currentWeapon]);

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
            onLeftSwingStart={() => {}}
            onRightSwingStart={() => {}}
          />
        ) : currentWeapon === WeaponType.SABRES ? (
          <Sabres 
            isSwinging={isSwinging} 
            onSwingComplete={handleSwingComplete}
            onLeftSwingStart={() => {}}
            onRightSwingStart={() => {}}
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
        <group
          key={projectile.id}
          position={projectile.position.toArray()}
          rotation={[0, Math.atan2(projectile.direction.x, projectile.direction.z), 0]}
        >
          {/* Core projectile */}
          <mesh>
            <cylinderGeometry args={[0.2, 0.4, 1.2, 8]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={5}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Inner energy core */}
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={8}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Outer energy shell */}
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

          {/* Trailing particles */}
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

          {/* Energy rings */}
          {[...Array(3)].map((_, i) => (
            <mesh
              key={`ring-${i}`}
              position={[0, 0, -i * 0.4]}
              rotation={[Math.PI / 2, 0, Date.now() * 0.003 + i * Math.PI / 3]}
            >
              <torusGeometry args={[0.4 + i * 0.1, 0.05, 8, 16]} />
              <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={3}
                transparent
                opacity={0.4 - i * 0.1}
              />
            </mesh>
          ))}

          {/* Strong point light for local illumination */}
          <pointLight 
            color="#00ffff" 
            intensity={4} 
            distance={5}
            decay={2}
          />

          {/* Wider ambient glow */}
          <pointLight
            color="#80ffff"
            intensity={2}
            distance={8}
            decay={1}
          />
        </group>
      ))}
    </>
  );
}