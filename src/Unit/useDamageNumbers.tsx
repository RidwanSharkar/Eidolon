import { Vector3 } from 'three';
import { useState, useRef } from 'react';

export interface DamageNumber {
  id: number;
  damage: number;
  position: Vector3;
  isCritical: boolean;
  isLightning?: boolean;
  isHealing?: boolean;
}

export function useDamageNumbers() {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const nextDamageNumberId = useRef(0);

  const handleDamageNumberComplete = (id: number) => {
    setDamageNumbers(prev => prev.filter(num => num.id !== id));
  };

  return {
    damageNumbers,
    setDamageNumbers,
    nextDamageNumberId,
    handleDamageNumberComplete
  };
}