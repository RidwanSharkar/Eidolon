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
    <>
      <div className={styles.leftPanel}>
        <div 
          className={currentWeapon === WeaponType.SCYTHE ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SCYTHE)}
          style={{ ...weaponIconStyle, position: 'relative' }}
        >
          <Image src="/icons/1.svg" alt="Scythe" width={50} height={50} style={weaponIconStyle} />
        </div>
        <div 
          className={currentWeapon === WeaponType.SWORD ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SWORD)}
          style={{ ...weaponIconStyle, position: 'relative' }}
        >
          <Image src="/icons/2.svg" alt="Sword" width={50} height={50} style={weaponIconStyle} />
        </div>
        <div 
          className={currentWeapon === WeaponType.SABRES ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SABRES)}
          style={{ ...weaponIconStyle, position: 'relative' }}
        >
          <Image src="/icons/3.svg" alt="Sabres" width={50} height={50} style={weaponIconStyle} />
        </div>
        <div 
          className={currentWeapon === WeaponType.SABRES2 ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SABRES2)}
          style={{ ...weaponIconStyle, position: 'relative' }}
        >
          <Image src="/icons/3.svg" alt="Sabres2" width={50} height={50} style={weaponIconStyle} />
        </div>
      </div>

      <div className={styles.bottomPanel}>
        <div className={styles.healthBar}>
          <div 
            className={styles.healthBarInner} 
            style={{ width: `${(playerHealth / maxHealth) * 100}%` }}
          >
            <span className={styles.healthText}>{`${playerHealth}/${maxHealth}`}</span>
          </div>
        </div>

        <div className={styles.abilityContainer}>
          {abilities[currentWeapon] && (
            <>
              {/* Q Ability */}
              <div className={styles.ability}>
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
                      size={50} // Match the ability icon size
                      strokeWidth={4}
                      percentage={(abilities[currentWeapon].q.currentCooldown / abilities[currentWeapon].q.cooldown) * 100}
                      borderRadius={8} // Match the icon's border radius
                    />
                    <span className={styles.cooldownText}>
                      {Math.ceil(abilities[currentWeapon].q.currentCooldown)}
                    </span>
                  </div>
                )}
              </div>

              {/* E Ability */}
              <div className={styles.ability}>
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
      </div>
    </>
  );
}

const weaponIconStyle = {
  width: '50px',
  height: '50px',
  objectFit: 'contain' as const,
  cursor: 'pointer',
  borderRadius: '8px' // Ensure the icons are rounded squares
};