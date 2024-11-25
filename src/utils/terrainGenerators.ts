import { Vector3, Color } from 'three';
import { trunkColors, leafColors } from '@/utils/colors';

export interface GeneratedTree {
  position: Vector3;
  scale: number;
  trunkColor: Color;
  leafColor: Color;
}

export const generateMountains = (): Array<{ position: Vector3; scale: number }> => {
  const mountains: Array<{ position: Vector3; scale: number }> = [];
  const numberOfMountains = 45; 

  for (let i = 0; i < numberOfMountains; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 35 + Math.random() * 40;

    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    const scale = 0.6 + Math.random() * 0.8;

    mountains.push({
      position: new Vector3(x, 0, z),
      scale: scale,
    });
  }

  return mountains;
};

export const generateTrees = (): GeneratedTree[] => {
  const trees: GeneratedTree[] = [];
  const numberOfClusters = 15;
  const treesPerCluster = 8;

  for (let i = 0; i < numberOfClusters; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 30;

    const clusterX = Math.cos(angle) * distance;
    const clusterZ = Math.sin(angle) * distance;

    const numberOfTreesInCluster = treesPerCluster + Math.floor(Math.random() * 5);

    for (let j = 0; j < numberOfTreesInCluster; j++) {
      const offsetDistance = Math.random() * (6 + ((j % 3) * 2));
      const offsetAngle = Math.random() * Math.PI * 2;

      const treeX = clusterX + Math.cos(offsetAngle) * offsetDistance;
      const treeZ = clusterZ + Math.sin(offsetAngle) * offsetDistance;

      const scale = 0.4 + Math.random() * 1.6;

      const trunkColor = trunkColors[Math.floor(Math.random() * trunkColors.length)];
      const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];

      trees.push({
        position: new Vector3(treeX, 0, treeZ),
        scale: scale,
        trunkColor: new Color(trunkColor),
        leafColor: new Color(leafColor),
      });
    }
  }

  return trees;
};

export const generateMushrooms = (): Array<{ position: Vector3; scale: number }> => {
  const mushrooms: Array<{ position: Vector3; scale: number }> = [];
  const numberOfMushrooms = 100; // Adjust as needed

  for (let i = 0; i < numberOfMushrooms; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 45; // Within the baseRadius + layers

    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);

    const scale = 0.3 + Math.random() * 0.2; // Small mushrooms

    mushrooms.push({
      position: new Vector3(x, 0, z),
      scale: scale,
    });
  }

  return mushrooms;
}; 