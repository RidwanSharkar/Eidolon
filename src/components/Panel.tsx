import { WeaponType } from './Unit';
import styles from './Panel.module.css';

interface PanelProps {
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
}

const weaponIconStyle = {
  width: '70px',
  height: '70px',
  objectFit: 'contain' as const,
  cursor: 'pointer'
};

export default function Panel({ currentWeapon, onWeaponSelect }: PanelProps) {
  return (
    <div className={styles.bottomPanel}>
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
    </div>
  );
}