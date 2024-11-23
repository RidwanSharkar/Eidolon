import { WeaponType } from './Unit';
import styles from './Panel.module.css';

interface PanelProps {
  currentWeapon: WeaponType;
  onWeaponSelect: (weapon: WeaponType) => void;
}

export default function Panel({ currentWeapon, onWeaponSelect }: PanelProps) {
  return (
    <>
      <div className={styles.leftPanel}>
        <img 
          src="/icons/1.svg" 
          alt="Scythe" 
          className={currentWeapon === WeaponType.SCYTHE ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SCYTHE)}
        />
        <img 
          src="/icons/3.svg" 
          alt="Sword" 
          className={currentWeapon === WeaponType.SWORD ? styles.activeWeapon : ''}
          onClick={() => onWeaponSelect(WeaponType.SWORD)}
        />
        <img src="/icons/5.svg" alt="Spell" />
      </div>
      <div className={styles.rightPanel}>
        {/* Additional content if needed */}
      </div>
    </>
  );
}