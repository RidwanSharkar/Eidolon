import { WeaponType } from '../../types/weapons';
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
  [key: string]: {
    q: AbilityButton;
    e: AbilityButton;
  };
}

export default function Panel({ currentWeapon, onWeaponSelect, playerHealth, maxHealth, abilities }: PanelProps) {
  return (
    <>
      <div className={styles.leftPanel}>
        <div 
          className={currentWeapon === WeaponType.SCYTHE ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SCYTHE)}
          style={{ ...weaponIconStyle, position: 'relative' }}
        >
          <img src="/icons/1.svg" alt="Scythe" style={weaponIconStyle} />
        </div>
        <div 
          className={currentWeapon === WeaponType.SWORD ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SWORD)}
          style={{ ...weaponIconStyle, position: 'relative' }}
        >
          <img src="/icons/2.svg" alt="Sword" style={weaponIconStyle} />
        </div>
        <div 
          className={currentWeapon === WeaponType.SABRES ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SABRES)}
          style={{ ...weaponIconStyle, position: 'relative' }}
        >
          <img src="/icons/3.svg" alt="Sabres" style={weaponIconStyle} />
        </div>
        <div 
          className={currentWeapon === WeaponType.SABRES2 ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SABRES2)}
          style={{ ...weaponIconStyle, position: 'relative' }}
        >
          <img src="/icons/3.svg" alt="Sabres2" style={weaponIconStyle} />
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
              <div className={styles.ability}>
                <img 
                  src={abilities[currentWeapon].q.icon} 
                  alt="Q ability" 
                  className={styles.abilityIcon}
                />
                {abilities[currentWeapon].q.currentCooldown > 0 && (
                  <div className={styles.cooldownOverlay}>
                    {Math.ceil(abilities[currentWeapon].q.currentCooldown)}
                  </div>
                )}
              </div>
              <div className={styles.ability}>
                <img 
                  src={abilities[currentWeapon].e.icon} 
                  alt="E ability" 
                  className={styles.abilityIcon}
                />
                {abilities[currentWeapon].e.currentCooldown > 0 && (
                  <div className={styles.cooldownOverlay}>
                    {Math.ceil(abilities[currentWeapon].e.currentCooldown)}
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