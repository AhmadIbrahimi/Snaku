
export enum FoodType {
  APPLE = 'APPLE',
  BANANA = 'BANANA',
  GRAPE = 'GRAPE',
  MANGO = 'MANGO',
  WATERMELON = 'WATERMELON',
  GOLDEN_APPLE = 'GOLDEN_APPLE',
  DRAGON_FRUIT = 'DRAGON_FRUIT',
  MYSTICAL_ORB = 'MYSTICAL_ORB',
  POWER_BERRY = 'POWER_BERRY',
  STAR_FRUIT = 'STAR_FRUIT',
  POISON_FRUIT = 'POISON_FRUIT',
  TIME_FRUIT = 'TIME_FRUIT',
  PORTAL_GEM = 'PORTAL_GEM',
  CHAOS_ORB = 'CHAOS_ORB',
  VOID_STAR = 'VOID_STAR'
}

export interface FoodDef {
  type: FoodType;
  points: number;
  growth: number;
  color: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Ultra';
  spawnFreq: number;
}

export interface Point {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface LevelDef {
  id: number;
  name: string;
  unlockPoints: number;
  speed: number;
  width: number;
  height: number;
  obstacles: boolean;
  poison: boolean;
  timeFruits: boolean;
  portals: boolean;
  bossMode: boolean;
  pointsToPass: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Expert' | 'Master';
}

export interface GameState {
  score: number;
  highScore: number;
  level: number;
  snake: Point[];
  direction: Direction;
  nextDirection: Direction;
  food: FoodInstance[];
  obstacles: Point[];
  isPaused: boolean;
  isGameOver: boolean;
  isLevelUp: boolean;
  combo: number;
  comboTimer: number;
  totalPoints: number;
  unlockedLevels: number[];
  snakeColor: string;
  rainbowTimer: number;
  foodEatenCount: number;
}

export interface FoodInstance extends Point {
  type: FoodType;
  expiresAt?: number;
}

export interface PlayerData {
  highScore: number;
  totalPoints: number;
  unlockedLevels: number[];
  levelBestScores: Record<number, number>;
  settings: GameSettings;
}

export interface GameSettings {
  masterVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  particlesEnabled: boolean;
  gridVisible: boolean;
  gameSpeed: number;
}
