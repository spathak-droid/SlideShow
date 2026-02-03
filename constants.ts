
import { CandyColor, LevelConfig } from './types';

export const GRID_ROWS = 8;
export const GRID_COLS = 8;

export const CANDY_COLORS = [
  CandyColor.RED,
  CandyColor.BLUE,
  CandyColor.GREEN,
  CandyColor.YELLOW,
  CandyColor.PURPLE,
  CandyColor.ORANGE
];

export const LEVELS: Record<number, LevelConfig> = {
  1: {
    rows: 8,
    cols: 8,
    moves: 12,
    targetScore: 2500,
    iceCount: 12,
    lockCount: 0,
    description: "Trial of the First Chain: Break through the frozen candies to weaken the magic."
  },
  2: {
    rows: 8,
    cols: 8,
    moves: 25,
    targetScore: 5000,
    iceCount: 20,
    lockCount: 6,
    description: "The Final Challenge: The monster is furious! Clear the locks and ice to free your love."
  }
};

export const COLOR_MAP: Record<CandyColor, string> = {
  [CandyColor.RED]: 'bg-red-500',
  [CandyColor.BLUE]: 'bg-blue-500',
  [CandyColor.GREEN]: 'bg-emerald-500',
  [CandyColor.YELLOW]: 'bg-yellow-400',
  [CandyColor.PURPLE]: 'bg-purple-600',
  [CandyColor.ORANGE]: 'bg-orange-500'
};
