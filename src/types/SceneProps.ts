import { Vector3, Color } from 'three';
import { GeneratedTree } from '@/utils/terrainGenerators';
import { UnitProps } from './UnitProps';

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
  dummyProps: Array<{
    position: Vector3;
    health: number;
    maxHealth: number;
    onHit: () => void;
  }>;
  skeletonProps: {
    position: Vector3;
    health: number;
    maxHealth: number;
    onHit: (damage: number) => void;
  };
} 