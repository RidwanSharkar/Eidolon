import { WeaponType } from './Unit';
import styles from './Panel.module.css';

interface PanelProps {
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
  playerHealth: number;
  maxHealth: number;
  abilities: WeaponInfo;
}

const weaponIconStyle = {
  width: '50px',
  height: '50px',
  objectFit: 'contain' as const,
  cursor: 'pointer'
};

interface AbilityButton {
  key: string;
  cooldown: number;
  currentCooldown: number;
  icon: string;
}

interface WeaponInfo {
  [WeaponType.SWORD]: {
    q: AbilityButton;
    e: AbilityButton;
  };
  [WeaponType.SCYTHE]: {
    q: AbilityButton;
    e: AbilityButton;
  };
  [WeaponType.SABRES]: {
    q: AbilityButton;
    e: AbilityButton;
  };
  [WeaponType.SABRES2]: {
    q: AbilityButton;
    e: AbilityButton;
  };
}

export default function Panel({ currentWeapon, onWeaponSelect, playerHealth, maxHealth, abilities }: PanelProps) {
  return (
    <div className={styles.bottomPanel}>
      <div className={styles.healthBar}>
        <div 
          className={styles.healthBarInner} 
          style={{ width: `${(playerHealth / maxHealth) * 100}%` }}
        >
          <span className={styles.healthText}>{playerHealth}/{maxHealth}</span>
        </div>
      </div>
      <div 
        className={currentWeapon === WeaponType.SCYTHE ? styles.activeWeapon : ''}
        onClick={() => onWeaponSelect(WeaponType.SCYTHE)}
        style={{ ...weaponIconStyle, position: 'relative' }}
      >
        <img src="/icons/1.svg" alt="Scythe" style={weaponIconStyle} />
        <span className={styles.keyBinding}>1</span>
      </div>
      <div 
        className={currentWeapon === WeaponType.SWORD ? styles.activeWeapon : ''}
        onClick={() => onWeaponSelect(WeaponType.SWORD)}
        style={{ ...weaponIconStyle, position: 'relative' }}
      >
        <img src="/icons/3.svg" alt="Sword" style={weaponIconStyle} />
        <span className={styles.keyBinding}>2</span>
      </div>
      <div 
        className={currentWeapon === WeaponType.SABRES ? styles.activeWeapon : ''}
        onClick={() => onWeaponSelect(WeaponType.SABRES)}
        style={{ ...weaponIconStyle, position: 'relative' }}
      >
        <img src="/icons/5.svg" alt="Sabres" style={weaponIconStyle} />
        <span className={styles.keyBinding}>3</span>
      </div>
      <div 
        className={currentWeapon === WeaponType.SABRES2 ? styles.activeWeapon : ''}
        onClick={() => onWeaponSelect(WeaponType.SABRES2)}
        style={{ ...weaponIconStyle, position: 'relative' }}
      >
        <img src="/icons/7.svg" alt="Sabres2" style={weaponIconStyle} />
        <span className={styles.keyBinding}>4</span>
      </div>
      <div className={styles.abilityContainer}>
        <div className={styles.ability}>
          <div 
            className={styles.abilityIcon} 
            style={{
              opacity: abilities[currentWeapon].q.currentCooldown > 0 ? 0.5 : 1,
              position: 'relative'
            }}
          >
            <img src={abilities[currentWeapon].q.icon} alt="Q ability" />
            {abilities[currentWeapon].q.currentCooldown > 0 && (
              <div className={styles.cooldownOverlay}>
                {Math.ceil(abilities[currentWeapon].q.currentCooldown)}
              </div>
            )}
            <span className={styles.keyBinding}>Q</span>
          </div>
        </div>
        <div className={styles.ability}>
          <div 
            className={styles.abilityIcon}
            style={{
              opacity: abilities[currentWeapon].e.currentCooldown > 0 ? 0.5 : 1,
              position: 'relative'
            }}
          >
            <img src={abilities[currentWeapon].e.icon} alt="E ability" />
            {abilities[currentWeapon].e.currentCooldown > 0 && (
              <div className={styles.cooldownOverlay}>
                {Math.ceil(abilities[currentWeapon].e.currentCooldown)}
              </div>
            )}
            <span className={styles.keyBinding}>E</span>
          </div>
        </div>
      </div>
    </div>
  );
}