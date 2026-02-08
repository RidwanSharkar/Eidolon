import React, { useState } from 'react';
import styles from './WeaponSelectionPanel.module.css';
import { WeaponType, WEAPON_ABILITY_TOOLTIPS } from '@/Weapons/weapons';
import Image from 'next/image';
import Tooltip from '@/Interface/Tooltip';

interface WeaponSelectionPanelProps {
  onWeaponSelect: (weapon: WeaponType) => void;
  selectedWeapon: WeaponType | null;
  onStart: () => void;
}

export default function WeaponSelectionPanel({ 
  onWeaponSelect, 
  selectedWeapon,
  onStart 
}: WeaponSelectionPanelProps) {
  const [tooltipContent, setTooltipContent] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const handleAbilityHover = (e: React.MouseEvent, weapon: WeaponType, abilityType: 'q' | 'e') => {
    const tooltip = WEAPON_ABILITY_TOOLTIPS[weapon][abilityType];
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate viewport boundaries
    const viewportWidth = window.innerWidth;
    
    // Initial position calculation
    let x = rect.left + rect.width / 2;
    let y = rect.top - 10;
    
    // Ensure tooltip stays within viewport bounds
    // Add some padding from viewport edges
    const VIEWPORT_PADDING = 20;
    const TOOLTIP_WIDTH = 300; // This should match the max-width in CSS
    const TOOLTIP_HEIGHT = 150; // Approximate height, adjust as needed
    
    // Adjust horizontal position if needed
    if (x - TOOLTIP_WIDTH / 2 < VIEWPORT_PADDING) {
      x = VIEWPORT_PADDING + TOOLTIP_WIDTH / 2;
    } else if (x + TOOLTIP_WIDTH / 2 > viewportWidth - VIEWPORT_PADDING) {
      x = viewportWidth - VIEWPORT_PADDING - TOOLTIP_WIDTH / 2;
    }
    
    // Adjust vertical position if needed
    if (y - TOOLTIP_HEIGHT < VIEWPORT_PADDING) {
      // If tooltip would be cut off at top, show it below the element instead
      y = rect.bottom + TOOLTIP_HEIGHT / 2;
    }
    
    setTooltipContent({
      title: tooltip.title,
      description: tooltip.description
    });
    setTooltipPosition({ x, y });
  };

  const handleAbilityLeave = () => {
    setTooltipContent(null);
  };

  return (
    <div 
      className={`${styles.panel} ${
        selectedWeapon === WeaponType.SWORD ? styles.swordTheme :
        selectedWeapon === WeaponType.SCYTHE ? styles.scytheTheme :
        selectedWeapon === WeaponType.SABRES ? styles.sabresTheme :
        selectedWeapon === WeaponType.SPEAR ? styles.spearTheme :
        selectedWeapon === WeaponType.BOW ? styles.bowTheme :
        ''
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <h2>Eidolon</h2>
      
      <div className={styles.iconSelection}>
        <div className={styles.weaponContainer}>
          <div 
            className={`${styles.icon} ${selectedWeapon === WeaponType.SWORD ? styles.selected : ''}`}
            onClick={() => onWeaponSelect(WeaponType.SWORD)}
          >
            <div className={styles.iconContent}>
              <Image 
                src={`${basePath}/icons/1.svg`}
                alt="Sword"
                width={240}
                height={280}
                unoptimized
              />
            </div>
          </div>
          <div className={styles.abilityIcons}>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.SWORD, 'q')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/q2.svg`}
                alt="Q Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>Q</span>
            </div>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.SWORD, 'e')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/e2.svg`}
                alt="E Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>E</span>
            </div>
          </div>
        </div>

        <div className={styles.weaponContainer}>
          <div 
            className={`${styles.icon} ${selectedWeapon === WeaponType.SCYTHE ? styles.selected : ''}`}
            onClick={() => onWeaponSelect(WeaponType.SCYTHE)}
          >
            <div className={styles.iconContent}>
              <Image 
                src={`${basePath}/icons/3.svg`}
                alt="Scythe"
                width={240}
                height={280}
                unoptimized
              />
            </div>
          </div>
          <div className={styles.abilityIcons}>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.SCYTHE, 'q')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/q1.svg`}
                alt="Q Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>Q</span>
            </div>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.SCYTHE, 'e')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/e1.svg`}
                alt="E Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>E</span>
            </div>
          </div>
        </div>

        <div className={styles.weaponContainer}>
          <div 
            className={`${styles.icon} ${selectedWeapon === WeaponType.SABRES ? styles.selected : ''}`}
            onClick={() => onWeaponSelect(WeaponType.SABRES)}
          >
            <div className={styles.iconContent}>
              <Image 
                src={`${basePath}/icons/2.svg`}
                alt="Sabres"
                width={240}
                height={280}
                unoptimized
              />
            </div>
          </div>
          <div className={styles.abilityIcons}>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.SABRES, 'q')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/q3.svg`}
                alt="Q Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>Q</span>
            </div>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.SABRES, 'e')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/e3.svg`}
                alt="E Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>E</span>
            </div>
          </div>
        </div>

        <div className={styles.weaponContainer}>
          <div 
            className={`${styles.icon} ${selectedWeapon === WeaponType.SPEAR ? styles.selected : ''}`}
            onClick={() => onWeaponSelect(WeaponType.SPEAR)}
          >
            <div className={styles.iconContent}>
              <Image 
                src={`${basePath}/icons/4.svg`}
                alt="Spear"
                width={240}
                height={280}
                unoptimized
              />
            </div>
          </div>
          <div className={styles.abilityIcons}>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.SPEAR, 'q')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/q4.svg`}
                alt="Q Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>Q</span>
            </div>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.SPEAR, 'e')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/e4.svg`}
                alt="E Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>E</span>
            </div>
          </div>
        </div>

        <div className={styles.weaponContainer}>
          <div 
            className={`${styles.icon} ${selectedWeapon === WeaponType.BOW ? styles.selected : ''}`}
            onClick={() => onWeaponSelect(WeaponType.BOW)}
          >
            <div className={styles.iconContent}>
              <Image 
                src={`${basePath}/icons/5.svg`}
                alt="Bow"
                width={240}
                height={280}
                unoptimized
              />
            </div>
          </div>
          <div className={styles.abilityIcons}>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.BOW, 'q')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/q5.svg`}
                alt="Q Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>Q</span>
            </div>
            <div 
              className={styles.abilityIcon}
              onMouseEnter={(e) => handleAbilityHover(e, WeaponType.BOW, 'e')}
              onMouseLeave={handleAbilityLeave}
            >
              <Image 
                src={`${basePath}/icons/e5.svg`}
                alt="E Ability"
                width={80}
                height={100}
                unoptimized
              />
              <span className={styles.abilityKey}>E</span>
            </div>
          </div>
        </div>
      </div>

      <button 
        className={styles.startButton}
        onClick={onStart}
        disabled={!selectedWeapon}
      >
        Enter
      </button>

      {tooltipContent && (
        <Tooltip 
          content={tooltipContent}
          visible={!!tooltipContent}
          x={tooltipPosition.x}
          y={tooltipPosition.y}
        />
      )}
    </div>
  );
}
