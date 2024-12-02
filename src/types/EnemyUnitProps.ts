   // src/types/EnemyUnitProps.ts

   import { Vector3 } from 'three';
   import { TargetId } from './TargetId';

   export interface EnemyUnitProps {
     id: TargetId;
     initialPosition: Vector3;
     health: number;
     maxHealth: number;
     onTakeDamage: (targetId: TargetId, damage: number) => void;
     onRegenerate: (id: TargetId) => void;
     playerPosition: Vector3;
     onAttackPlayer: (damage: number) => void;
   }