import styles from './Panel.module.css';

interface HealthBarProps {
  current: number;
  max: number;
}

export default function HealthBar({ current, max }: HealthBarProps) {
  const percentage = (current / max) * 100;
  
  return (
    <div className={styles.healthBar}>
      <div 
        className={styles.healthBarInner} 
        style={{ 
          width: `${percentage}%`,
          height: '30px',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span className={styles.healthText}>{`${current}/${max}`}</span>
      </div>
    </div>
  );
}