// src/types/Fireball.ts
import { Vector3 } from 'three';

export interface FireballType {
  id: number;
  position: Vector3;
  direction: Vector3;
  targetId?: string;
}