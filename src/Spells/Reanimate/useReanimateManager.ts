import { useRef, useCallback } from 'react';
import { Group, Vector3 } from 'three';
import { ORBITAL_COOLDOWN } from '../../Unit/ChargedOrbitals';

interface UseReanimateManagerProps {
  parentRef: React.RefObject<Group>;
  charges: Array<{
    id: number;
    available: boolean;
    cooldownStartTime: number | null;
  }>;
  setCharges: React.Dispatch<React.SetStateAction<Array<{
    id: number;
    available: boolean;
    cooldownStartTime: number | null;
  }>>>;
  onHealthChange: (health: number) => void;
  setDamageNumbers: React.Dispatch<React.SetStateAction<Array<{
    id: number;
    damage: number;
    position: Vector3;
    isCritical: boolean;
    isHealing?: boolean;
  }>>>;
  nextDamageNumberId: React.MutableRefObject<number>;
}

export function useReanimateManager({
  charges,
  setCharges,
  onHealthChange,
  parentRef,
  setDamageNumbers,
  nextDamageNumberId
}: UseReanimateManagerProps) {
  const lastCastTime = useRef<number>(0);
  const HEAL_AMOUNT = 10;
  const COOLDOWN = 775; // 1 second in milliseconds

  const castReanimate = useCallback(() => {
    const now = Date.now();
    const timeSinceLastCast = now - lastCastTime.current;
    
    // Check if ability is on cooldown
    if (timeSinceLastCast < COOLDOWN) {
      console.log('Reanimate is on cooldown');
      return false;
    }

    // Find first available charge
    const availableChargeIndex = charges.findIndex(charge => charge.available);
    
    if (availableChargeIndex === -1) {
      console.log('No charges available for Reanimate');
      return false;
    }

    // Update last cast time
    lastCastTime.current = now;

    // Use the charge
    setCharges(prev => prev.map((charge, index) => 
      index === availableChargeIndex 
        ? { ...charge, available: false, cooldownStartTime: Date.now() }
        : charge
    ));

    // Create healing damage number
    const currentRef = parentRef?.current;
    if (currentRef) {
      setDamageNumbers(prev => [...prev, {
        id: nextDamageNumberId.current++,
        damage: HEAL_AMOUNT,
        position: currentRef.position.clone().add(new Vector3(0, 2, 0)),
        isCritical: false,
        isHealing: true
      }]);
    }

    // Apply healing - pass the delta amount directly
    onHealthChange(HEAL_AMOUNT);

    // Start cooldown recovery
    setTimeout(() => {
      setCharges(prev => prev.map((charge, index) => 
        index === availableChargeIndex
          ? { ...charge, available: true, cooldownStartTime: null }
          : charge
      ));
    }, ORBITAL_COOLDOWN);

    console.log(`Reanimate casted. Healed for ${HEAL_AMOUNT} points.`);
    return true;
  }, [charges, setCharges, onHealthChange, parentRef, setDamageNumbers, nextDamageNumberId]);

  return {
    castReanimate
  };
} 