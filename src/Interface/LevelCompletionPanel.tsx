import React, { useState } from 'react';
import styles from '@/Interface/LevelCompletionPanel.module.css';
import { AbilityType, WeaponType } from '@/Weapons/weapons';
import { WEAPON_ABILITY_TOOLTIPS } from '@/Weapons/weapons';
import Tooltip from '@/Interface/Tooltip';
import { WeaponInfo } from '@/Weapons/weapons';
import Image from 'next/image';

interface LevelCompletionPanelProps {
  onContinue: () => void; 
  onSelectIcon: (iconId: number) => void;
  selectedIcon: number | null;
  currentWeapon: WeaponType;
  onAbilityUnlock: (abilityType: AbilityType) => void;
  abilities: WeaponInfo;
}

export default function LevelCompletionPanel({ 
  onContinue, 
  onSelectIcon, 
  selectedIcon,
  currentWeapon,
  onAbilityUnlock,
  abilities
}: LevelCompletionPanelProps) {
  const [tooltipContent, setTooltipContent] = useState<{
    title: string;
    description: string;
    cost?: number | string;
    range?: number | string;
    damage?: number | string;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const getAbilityIcons = () => {
    switch (currentWeapon) {
      case WeaponType.SCYTHE:
        return { 
          r: `${basePath}/icons/r1.svg`, 
          p: `${basePath}/icons/p1.svg`,
          s: `${basePath}/icons/a1.svg`
        };
      case WeaponType.SWORD:
        return { 
          r: `${basePath}/icons/r2.svg`, 
          p: `${basePath}/icons/p2.svg`,
          s: `${basePath}/icons/a2.svg`
        };
      case WeaponType.SABRES:
        return { 
          r: `${basePath}/icons/r3.svg`, 
          p: `${basePath}/icons/p3.svg`,
          s: `${basePath}/icons/a3.svg`
        };
      case WeaponType.SPEAR:
        return { 
          r: `${basePath}/icons/r4.svg`, 
          p: `${basePath}/icons/p4.svg`,
          s: `${basePath}/icons/a4.svg`
        };
      case WeaponType.BOW:
        return { 
          r: `${basePath}/icons/r5.svg`, 
          p: `${basePath}/icons/p5.svg`,
          s: `${basePath}/icons/a5.svg`
        };
    }
  };

  const handleIconHover = (e: React.MouseEvent, abilityType: 'r' | 'passive' | 'active') => {
    const tooltip = WEAPON_ABILITY_TOOLTIPS[currentWeapon][abilityType];
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipContent(tooltip);
    setTooltipPosition({
      x: rect.left - 721,
      y: rect.top - 70
    });
  };

  const handleIconLeave = () => {
    setTooltipContent(null);
  };

  const handleIconSelect = (iconId: number, isUnlocked: boolean) => {
    if (isUnlocked) return;
    onSelectIcon(iconId);
  };

  const handleConfirm = () => {
    if (selectedIcon === null) return;
    
    // Convert iconId to ability type
    const abilityType = selectedIcon === 1 ? 'r' : selectedIcon === 2 ? 'passive' : 'active';
    
    // Unlock the ability
    onAbilityUnlock(abilityType);
    
    // Continue
    onContinue();
  };

  const icons = getAbilityIcons();

  return (
    <div 
      className={styles.panel} 
      style={{ pointerEvents: 'auto' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <h2>Level Complete!</h2>
      <p>Choose an ability to unlock:</p>
      <div className={styles.iconSelection}>
        <div 
          className={`${styles.icon} 
            ${selectedIcon === 1 ? styles.selected : ''} 
            ${abilities[currentWeapon].r.isUnlocked ? styles.disabled : ''}`}
          onClick={() => handleIconSelect(1, abilities[currentWeapon].r.isUnlocked)}
          onMouseEnter={(e) => handleIconHover(e, 'r')}
          onMouseLeave={handleIconLeave}
        >
          <div className={styles.iconContent}>
            {icons?.r && (
              <Image 
                src={icons.r} 
                alt="R Ability" 
                width={75}
                height={75}
                priority
              />
            )}
            <p>[R] Hotkey</p>
          </div>
        </div>
        <div 
          className={`${styles.icon} 
            ${selectedIcon === 2 ? styles.selected : ''} 
            ${abilities[currentWeapon].passive.isUnlocked ? styles.disabled : ''}`}
          onClick={() => handleIconSelect(2, abilities[currentWeapon].passive.isUnlocked)}
          onMouseEnter={(e) => handleIconHover(e, 'passive')}
          onMouseLeave={handleIconLeave}
        >
          <div className={styles.iconContent}>
            {icons?.p && (
              <Image 
                src={icons.p} 
                alt="Passive Ability" 
                width={75}
                height={75}
                priority
              />
            )}
            <p>[1] Hotkey</p>
          </div>
        </div>
        {(currentWeapon === WeaponType.SCYTHE || 
          currentWeapon === WeaponType.SABRES || 
          currentWeapon === WeaponType.SWORD ||
          currentWeapon === WeaponType.SPEAR ||
          currentWeapon === WeaponType.BOW) && (
          <div 
            className={`${styles.icon} 
              ${selectedIcon === 3 ? styles.selected : ''} 
              ${abilities[currentWeapon].active.isUnlocked ? styles.disabled : ''}`}
            onClick={() => handleIconSelect(3, abilities[currentWeapon].active.isUnlocked)}
            onMouseEnter={(e) => handleIconHover(e, 'active')}
            onMouseLeave={handleIconLeave}
          >
            <div className={styles.iconContent}>
              {icons?.s && (
                <Image 
                  src={icons.s} 
                  alt="Active Ability" 
                  width={75}
                  height={75}
                  priority
                />
              )}
              <p>[2] Hotkey</p>
            </div>
          </div>
        )}
      </div>
      <button 
        className={styles.continueButton}
        onClick={handleConfirm}
        disabled={selectedIcon === null}
      >
        Confirm
      </button>

      <Tooltip 
        content={tooltipContent!}
        visible={!!tooltipContent}
        x={tooltipPosition.x}
        y={tooltipPosition.y}
      />
    </div>
  );
} 