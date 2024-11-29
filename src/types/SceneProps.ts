import { Vector3, Color } from 'three';
import { GeneratedTree } from '@/utils/terrainGenerators';
import { UnitProps } from './UnitProps';
import { TrainingDummyProps } from './TrainingDummyProps';

export interface SkeletonProps {
  id: string;
  initialPosition: Vector3;
  health: number;
  maxHealth: number;
  onTakeDamage: (id: string, damage: number) => void;
}

export interface SceneProps {
  mountainData: Array<{
    position: Vector3;
    scale: number;
  }>;
  treeData: GeneratedTree[];
  mushroomData: Array<{
    position: Vector3;
    scale: number;
  }>;
  treePositions: {
    mainTree: Vector3;
  };
  interactiveTrunkColor: Color;
  interactiveLeafColor: Color;
  unitProps: UnitProps;
  dummyProps: TrainingDummyProps[];
  skeletonProps: SkeletonProps[];
} 