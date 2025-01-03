import { Vector3, Group } from 'three';
import { WeaponType } from '../Weapons/weapons';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Enemy } from '../Versus/enemy';
import { RefObject } from 'react';

export interface AbilityButton {
  key: 'q' | 'e' | 'r' | 'passive';
  cooldown: number;
  currentCooldown: number;
  icon: string;
  maxCooldown: number;
  name: string;
  isUnlocked: boolean;
}

export interface WeaponAbilities {
  q: AbilityButton;
  e: AbilityButton;
  r: AbilityButton;
  passive: AbilityButton;
}

export type WeaponInfo = Record<WeaponType, WeaponAbilities>;

interface FireballManager {
  shootFireball: () => void;
  cleanup: () => void;
}

export interface UnitProps {
  onHit: (targetId: string, damage: number) => void;
  onHealthChange?: (newHealth: number) => void;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
  health: number;
  maxHealth: number;
  isPlayer?: boolean;
  abilities: WeaponInfo;
  onAbilityUse: (weapon: WeaponType, abilityKey: 'q' | 'e' | 'r' | 'passive') => void;
  onPositionUpdate: (pos: Vector3) => void;
  enemyData: Enemy[];
  onFireballDamage: (targetId: string, damage: number, isCritical: boolean, position: Vector3) => void;
  onDamage: (damage: number) => void;
  onEnemyDeath: () => void;
  fireballManagerRef?: React.MutableRefObject<FireballManager | null>;
  onSmiteDamage: (targetId: string, damage: number, isCritical: boolean, position: Vector3) => void;
  parentRef?: RefObject<Group>;
}