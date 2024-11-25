export enum WeaponType {
  SCYTHE = 'scythe',
  SWORD = 'sword',
  SABRES = 'sabres',
  SABRES2 = 'sabres2'
}

export interface Ability {
  currentCooldown: number;
  maxCooldown: number;
  name: string;
}

export interface WeaponAbilities {
  q: Ability;
  e: Ability;
}

export interface WeaponInfo {
  [key: string]: WeaponAbilities;
}

export interface WeaponDamage {
  normal: number;
  special: number;
}

export interface WeaponDamages {
  [key: string]: WeaponDamage;
}

export type WeaponCooldowns = Record<WeaponType, {
  primary: number;
  secondary: number;
}>; 