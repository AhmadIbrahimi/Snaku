import { FoodType, FoodDef, LevelDef, Direction } from './types';

export const CELL_SIZE = 20;

export const FOOD_DEFS: Record<FoodType, FoodDef> = {
  [FoodType.APPLE]: { type: FoodType.APPLE, points: 10, growth: 1, color: '#ff4d4d', rarity: 'Common', spawnFreq: 0.25 },
  [FoodType.BANANA]: { type: FoodType.BANANA, points: 15, growth: 2, color: '#ffeb3b', rarity: 'Common', spawnFreq: 0.20 },
  [FoodType.GRAPE]: { type: FoodType.GRAPE, points: 20, growth: 3, color: '#9c27b0', rarity: 'Uncommon', spawnFreq: 0.15 },
  [FoodType.MANGO]: { type: FoodType.MANGO, points: 25, growth: 4, color: '#ff9800', rarity: 'Uncommon', spawnFreq: 0.12 },
  [FoodType.WATERMELON]: { type: FoodType.WATERMELON, points: 35, growth: 5, color: '#4caf50', rarity: 'Rare', spawnFreq: 0.08 },
  [FoodType.STAR_FRUIT]: { type: FoodType.STAR_FRUIT, points: 40, growth: 6, color: '#ffeb3b', rarity: 'Uncommon', spawnFreq: 0.09 },
  [FoodType.GOLDEN_APPLE]: { type: FoodType.GOLDEN_APPLE, points: 50, growth: 7, color: '#ffd700', rarity: 'Rare', spawnFreq: 0.05 },
  [FoodType.DRAGON_FRUIT]: { type: FoodType.DRAGON_FRUIT, points: 75, growth: 10, color: '#e91e63', rarity: 'Very Rare', spawnFreq: 0.03 },
  [FoodType.MYSTICAL_ORB]: { type: FoodType.MYSTICAL_ORB, points: 100, growth: 15, color: '#00bcd4', rarity: 'Ultra', spawnFreq: 0.01 },
  [FoodType.POWER_BERRY]: { type: FoodType.POWER_BERRY, points: 5, growth: 1, color: '#2196f3', rarity: 'Common', spawnFreq: 0.02 },
  [FoodType.POISON_FRUIT]: { type: FoodType.POISON_FRUIT, points: -20, growth: -5, color: '#212121', rarity: 'Rare', spawnFreq: 0.03 },
  [FoodType.TIME_FRUIT]: { type: FoodType.TIME_FRUIT, points: 30, growth: 4, color: '#f06292', rarity: 'Uncommon', spawnFreq: 0.05 },
  [FoodType.PORTAL_GEM]: { type: FoodType.PORTAL_GEM, points: 60, growth: 8, color: '#00e676', rarity: 'Rare', spawnFreq: 0.04 },
  [FoodType.CHAOS_ORB]: { type: FoodType.CHAOS_ORB, points: 45, growth: 6, color: '#aa00ff', rarity: 'Uncommon', spawnFreq: 0.06 },
  [FoodType.VOID_STAR]: { type: FoodType.VOID_STAR, points: 80, growth: 12, color: '#000000', rarity: 'Very Rare', spawnFreq: 0.02 },
};

export const LEVELS: LevelDef[] = [
  { id: 1, name: 'Tutorial Novice', unlockPoints: 0, speed: 5, width: 20, height: 15, obstacles: false, poison: false, timeFruits: false, portals: false, bossMode: false, difficulty: 'Easy' },
  { id: 2, name: 'Green Beginnings', unlockPoints: 150, speed: 6, width: 20, height: 15, obstacles: false, poison: false, timeFruits: false, portals: false, bossMode: false, difficulty: 'Easy' },
  { id: 3, name: 'Speed Challenge', unlockPoints: 400, speed: 7, width: 20, height: 15, obstacles: false, poison: false, timeFruits: false, portals: false, bossMode: false, difficulty: 'Easy' },
  { id: 4, name: 'Obstacle Intro', unlockPoints: 800, speed: 8, width: 22, height: 17, obstacles: true, poison: false, timeFruits: false, portals: false, bossMode: false, difficulty: 'Medium' },
  { id: 5, name: 'Rare Fruit Era', unlockPoints: 1500, speed: 9, width: 22, height: 17, obstacles: true, poison: false, timeFruits: false, portals: false, bossMode: false, difficulty: 'Medium' },
  { id: 6, name: 'Poison Intro', unlockPoints: 2500, speed: 10, width: 24, height: 18, obstacles: true, poison: true, timeFruits: false, portals: false, bossMode: false, difficulty: 'Medium' },
  { id: 7, name: 'Time & Power', unlockPoints: 4000, speed: 11, width: 24, height: 18, obstacles: true, poison: true, timeFruits: true, portals: false, bossMode: false, difficulty: 'Hard' },
  { id: 8, name: 'Obstacle Expansion', unlockPoints: 6000, speed: 12, width: 26, height: 20, obstacles: true, poison: true, timeFruits: true, portals: false, bossMode: false, difficulty: 'Hard' },
  { id: 9, name: 'Portal Teleport', unlockPoints: 8500, speed: 13, width: 26, height: 20, obstacles: true, poison: true, timeFruits: true, portals: true, bossMode: false, difficulty: 'Very Hard' },
  { id: 10, name: 'Boss Mode Chaos', unlockPoints: 11000, speed: 14, width: 28, height: 22, obstacles: true, poison: true, timeFruits: true, portals: true, bossMode: true, difficulty: 'Expert' },
  { id: 11, name: 'Chaos Randomness', unlockPoints: 14500, speed: 15, width: 30, height: 24, obstacles: true, poison: true, timeFruits: true, portals: true, bossMode: true, difficulty: 'Master' },
  { id: 12, name: 'Master Challenge', unlockPoints: 18000, speed: 16, width: 32, height: 24, obstacles: true, poison: true, timeFruits: true, portals: true, bossMode: true, difficulty: 'Master' },
];

export const COLORS = [
  { min: 0, max: 100, name: 'Green Serpent', primary: '#00FF00', secondary: '#228B22', accent: '#7FFF7F' },
  { min: 101, max: 250, name: 'Blue Viper', primary: '#0066FF', secondary: '#000080', accent: '#00FFFF' },
  { min: 251, max: 500, name: 'Purple Mystic', primary: '#9370DB', secondary: '#4B0082', accent: '#DDA0DD' },
  { min: 501, max: 1000, name: 'Golden Wyrm', primary: '#FFD700', secondary: '#FF8C00', accent: '#FFFF00' },
  { min: 1001, max: 2000, name: 'Crimson Dragon', primary: '#DC143C', secondary: '#8B0000', accent: '#FF6B6B' },
  { min: 2001, max: 3500, name: 'Cyber Serpent', primary: '#00FFFF', secondary: '#0099FF', accent: '#FF00FF' },
  { min: 3501, max: 5000, name: 'Shadow Nightcrawler', primary: '#2D0052', secondary: '#000000', accent: '#1a0033' },
  { min: 5001, max: 7500, name: 'Infernal Viper', primary: '#FF4500', secondary: '#9933FF', accent: '#FF0000' },
  { min: 7501, max: 10000, name: 'Ethereal Spirit', primary: '#FFFFFF', secondary: '#ADD8E6', accent: '#E0FFFF' },
  { min: 10001, max: Infinity, name: 'Legendary Phoenix', primary: 'rainbow', secondary: 'rainbow', accent: '#FFFFFF' },
];

export const KEY_MAP: Record<string, Direction> = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  w: Direction.UP,
  s: Direction.DOWN,
  a: Direction.LEFT,
  d: Direction.RIGHT,
};
