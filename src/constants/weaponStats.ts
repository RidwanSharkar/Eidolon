import { WeaponType, WeaponDamages, WeaponCooldowns } from '../types/weapons';

export const WEAPON_DAMAGES: WeaponDamages = {
  [WeaponType.SWORD]: { normal: 10, special: 25 },
  [WeaponType.SCYTHE]: { normal: 7, special: 15 },
  [WeaponType.SABRES]: { normal: 6, special: 0 },
  [WeaponType.SABRES2]: { normal: 6, special: 0 }
};

export const WEAPON_COOLDOWNS: WeaponCooldowns = {
  [WeaponType.SCYTHE]: {
    primary: 1.5,
    secondary: 1.5
  },
  [WeaponType.SWORD]: {
    primary: 1.5,
    secondary: 3.0
  },
  [WeaponType.SABRES]: {
    primary: 1.0,
    secondary: 2.0
  },
  [WeaponType.SABRES2]: {
    primary: 1.0,
    secondary: 2.0
  }
}; 