import styles from './Panel.module.css';

export default function Panel() {
  return (
    <>
      <div className={styles.leftPanel}>
        {/* Icons or buttons for classes */}
        <img src="/icons/1.svg" alt="Paladin" />
        <img src="/icons/3.svg" alt="Rogue" />
        <img src="/icons/5.svg" alt="Mage" />
      </div>
      <div className={styles.rightPanel}>
        {/* Additional content if needed */}
      </div>
    </>
  );
}