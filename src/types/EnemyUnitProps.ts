   // src/types/EnemyUnitProps.ts

   import { Vector3 } from 'three';

   export interface EnemyUnitProps {
     id: string;
     initialPosition: Vector3;
     health: number;
     maxHealth: number;
     onTakeDamage: (id: string, damage: number) => void;
   }