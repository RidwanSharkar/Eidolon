import React from 'react';
import { WeaponType } from '../../types/weapons';
import styles from './Panel.module.css';
import Image from 'next/image';

interface PanelProps {
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
  playerHealth: number;
  maxHealth: number;
  abilities: WeaponInfo;
}

interface AbilityButton {
  key: string;
  cooldown: number;
  currentCooldown: number;
  icon: string;
}

interface WeaponInfo {
  [key: string]: {
    q: AbilityButton;
    e: AbilityButton;
  };
}

/**
 * RoundedSquareProgress Component
 * Renders a sweeping cooldown animation around a rounded square.
 */
const RoundedSquareProgress: React.FC<{
  size: number;
  strokeWidth: number;
  percentage: number; // 0 to 100
  borderRadius: number;
}> = ({ size, strokeWidth, percentage, borderRadius }) => {
  const halfStroke = strokeWidth / 2;
  const adjustedSize = size - strokeWidth;
  const perimeter = 4 * adjustedSize; // Approximate perimeter for a rounded square
  const dashOffset = perimeter - (perimeter * percentage) / 100;

  return (
    <svg
      width={size}
      height={size}
      className={styles.roundedSquareProgress}
    >
      {/* Foreground Rect for Sweeping Animation */}
      <rect
        x={halfStroke}
        y={halfStroke}
        width={adjustedSize}
        height={adjustedSize}
        rx={borderRadius}
        ry={borderRadius}
        stroke="#39ff14"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={perimeter}
        strokeDashoffset={dashOffset}
        className={styles.progressForeground}
      />
    </svg>
  );
};

export default function Panel({ currentWeapon, onWeaponSelect, playerHealth, maxHealth, abilities }: PanelProps) {
  return (
    <div className={styles.bottomPanel}>
      {/* Health Bar Section */}
      <div className={styles.healthBarSection}>
        <div className={styles.healthBar}>
          <div 
            className={styles.healthBarInner} 
            style={{ width: `${(playerHealth / maxHealth) * 100}%` }}
          />
          <div className={styles.healthBarGlow} />
        </div>
        <span className={styles.healthText}>{`${playerHealth}/${maxHealth}`}</span>
      </div>

      {/* Abilities Section */}
      <div className={styles.abilityContainer}>
        {abilities[currentWeapon] && (
          <>
            <div className={styles.ability}>
              <div className={styles.keyBind}>Q</div>
              <Image 
                src={abilities[currentWeapon].q.icon} 
                alt="Q ability" 
                width={50}
                height={50}
                className={styles.abilityIcon}
              />
              {abilities[currentWeapon].q.currentCooldown > 0 && (
                <div className={styles.cooldownOverlay}>
                  <RoundedSquareProgress
                    size={50}
                    strokeWidth={4}
                    percentage={(abilities[currentWeapon].q.currentCooldown / abilities[currentWeapon].q.cooldown) * 100}
                    borderRadius={8}
                  />
                  <span className={styles.cooldownText}>
                    {Math.ceil(abilities[currentWeapon].q.currentCooldown)}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.ability}>
              <div className={styles.keyBind}>E</div>
              <Image 
                src={abilities[currentWeapon].e.icon} 
                alt="E ability" 
                width={50}
                height={50}
                className={styles.abilityIcon}
              />
              {abilities[currentWeapon].e.currentCooldown > 0 && (
                <div className={styles.cooldownOverlay}>
                  <RoundedSquareProgress
                    size={50}
                    strokeWidth={4}
                    percentage={(abilities[currentWeapon].e.currentCooldown / abilities[currentWeapon].e.cooldown) * 100}
                    borderRadius={8}
                  />
                  <span className={styles.cooldownText}>
                    {Math.ceil(abilities[currentWeapon].e.currentCooldown)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Weapons Section */}
      <div className={styles.weaponIcons}>
        {Object.values(WeaponType)
          .filter((_, index) => index < 3) // Only show first 3 weapons
          .map((weapon, index) => (
            <div 
              key={weapon}
              className={`${styles.weaponSlot} ${currentWeapon === weapon ? styles.activeWeapon : ''}`}
              onClick={() => onWeaponSelect(weapon)}
            >
              <div className={styles.keyBind}>{index + 1}</div>
              <Image 
                src={`/icons/${index + 1}.svg`} 
                alt={weapon} 
                width={50} 
                height={50} 
                className={styles.weaponIcon}
              />
            </div>
          ))}
      </div>
    </div>
  );
}