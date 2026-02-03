
export enum CandyColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange'
}

export enum SpecialType {
  NONE = 'none',
  STRIPED_H = 'striped_h',
  STRIPED_V = 'striped_v',
  WRAPPED = 'wrapped',
  COLOR_BOMB = 'color_bomb'
}

export enum BlockerType {
  NONE = 'none',
  ICE = 'ice',
  LOCK = 'lock'
}

export interface Tile {
  id: string;
  color: CandyColor;
  special: SpecialType;
  blocker: BlockerType;
  x: number;
  y: number;
  isMatched: boolean;
  isNew?: boolean;
}

export interface GameState {
  level: number;
  moves: number;
  score: number;
  targetScore: number;
  objectives: {
    ice?: number;
    specialCandies?: number;
  };
  grid: Tile[][];
  status: 'landing' | 'video' | 'intro' | 'story' | 'playing' | 'cinematic' | 'gameover' | 'victory' | 'endingVideo' | 'montage' | 'ending';
  chainsRemaining: number;
}

export interface LevelConfig {
  rows: number;
  cols: number;
  moves: number;
  targetScore: number;
  iceCount: number;
  lockCount: number;
  description: string;
}
