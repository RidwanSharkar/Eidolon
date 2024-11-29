import { Vector3 } from 'three';

export interface TrainingDummyProps {
  id: 'dummy1' | 'dummy2';
  position: Vector3;
  health: number;
  maxHealth: number;
  onHit: () => void;
} 