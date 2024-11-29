// src/types/UnitProps.ts

import { Vector3 } from 'three';
import OrbitControls from 'three/examples/jsm/controls/OrbitControls';
import { WeaponType, WeaponInfo } from './weapons';
import { TargetId } from './TargetId';

export interface UnitProps {
  onHit: (targetId: TargetId, damage: number) => void;
  controlsRef: React.RefObject<OrbitControls>;
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
  health: number;
  maxHealth: number;
  isPlayer?: boolean;
  abilities: WeaponInfo;
  onAbilityUse: (weapon: WeaponType, ability: 'q' | 'e') => void;
  onPositionUpdate: (position: Vector3) => void;
  enemyData: Array<{
    id: string;
    position: Vector3;
    health: number;
    maxHealth: number;
  }>;
}