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
      <img 
        src="/icons/1.svg" 
        alt="Scythe" 
        style={weaponIconStyle}
        className={currentWeapon === WeaponType.SCYTHE ? styles.activeWeapon : ''}
        onClick={() => onWeaponSelect(WeaponType.SCYTHE)}
      />
      <img 
        src="/icons/3.svg" 
        alt="Sword" 
        style={weaponIconStyle}
        className={currentWeapon === WeaponType.SWORD ? styles.activeWeapon : ''}
        onClick={() => onWeaponSelect(WeaponType.SWORD)}
      />
      <img 
        src="/icons/5.svg" 
        alt="Sabres" 
        style={weaponIconStyle}
        className={currentWeapon === WeaponType.SABRES ? styles.activeWeapon : ''}
        onClick={() => onWeaponSelect(WeaponType.SABRES)}
      />
      <img 
        src="/icons/7.svg" 
        alt="Sabres2" 
        style={weaponIconStyle}
        className={currentWeapon === WeaponType.SABRES2 ? styles.activeWeapon : ''}
        onClick={() => onWeaponSelect(WeaponType.SABRES2)}
      />
    </div>
  );
}