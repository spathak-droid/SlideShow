
import { Tile, CandyColor, SpecialType, BlockerType } from '../types';
import { GRID_ROWS, GRID_COLS, CANDY_COLORS } from '../constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const createTile = (x: number, y: number, color?: CandyColor): Tile => ({
  id: generateId(),
  color: color || CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
  special: SpecialType.NONE,
  blocker: BlockerType.NONE,
  x,
  y,
  isMatched: false
});

export const initializeGrid = (rows: number, cols: number, iceCount: number, lockCount: number): Tile[][] => {
  let grid: Tile[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      let color: CandyColor;
      do {
        color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
      } while (
        (r > 1 && grid[r - 1][c].color === color && grid[r - 2][c].color === color) ||
        (c > 1 && grid[r][c - 1].color === color && grid[r][c - 2].color === color)
      );
      grid[r][c] = createTile(r, c, color);
    }
  }

  let iceAdded = 0;
  while (iceAdded < iceCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (grid[r][c].blocker === BlockerType.NONE) {
      grid[r][c].blocker = BlockerType.ICE;
      iceAdded++;
    }
  }

  let locksAdded = 0;
  while (locksAdded < lockCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (grid[r][c].blocker === BlockerType.NONE) {
      grid[r][c].blocker = BlockerType.LOCK;
      locksAdded++;
    }
  }
  return grid;
};

export interface MatchGroup {
  tiles: { r: number, c: number }[];
  color: CandyColor;
  type: SpecialType;
  pivot?: { r: number, c: number };
}

export const checkMatches = (grid: Tile[][]): MatchGroup[] => {
  if (!grid || grid.length === 0) return [];
  const rows = grid.length;
  const cols = grid[0].length;
  const horizontalMatches: { r: number, c: number }[][] = [];
  const verticalMatches: { r: number, c: number }[][] = [];

  // Find Horizontal
  for (let r = 0; r < rows; r++) {
    let count = 1;
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1 && grid[r][c].color === grid[r][c + 1].color) {
        count++;
      } else {
        if (count >= 3) {
          const group = [];
          for (let i = 0; i < count; i++) group.push({ r, c: c - i });
          horizontalMatches.push(group);
        }
        count = 1;
      }
    }
  }

  // Find Vertical
  for (let c = 0; c < cols; c++) {
    let count = 1;
    for (let r = 0; r < rows; r++) {
      if (r < rows - 1 && grid[r][c].color === grid[r + 1][c].color) {
        count++;
      } else {
        if (count >= 3) {
          const group = [];
          for (let i = 0; i < count; i++) group.push({ r: r - i, c });
          verticalMatches.push(group);
        }
        count = 1;
      }
    }
  }

  const groups: MatchGroup[] = [];
  const processedH = new Set<string>();
  const processedV = new Set<string>();

  // Check for T/L shapes by intersecting H and V matches
  horizontalMatches.forEach((hMatch, hIdx) => {
    verticalMatches.forEach((vMatch, vIdx) => {
      const intersection = hMatch.find(h => vMatch.some(v => v.r === h.r && v.c === h.c));
      if (intersection) {
        processedH.add(hIdx.toString());
        processedV.add(vIdx.toString());
        groups.push({
          tiles: [...hMatch, ...vMatch.filter(v => !(v.r === intersection.r && v.c === intersection.c))],
          color: grid[intersection.r][intersection.c].color,
          type: SpecialType.WRAPPED,
          pivot: intersection
        });
      }
    });
  });

  // Add remaining horizontal matches
  horizontalMatches.forEach((hMatch, idx) => {
    if (processedH.has(idx.toString())) return;
    const color = grid[hMatch[0].r][hMatch[0].c].color;
    let type = SpecialType.NONE;
    if (hMatch.length === 4) type = SpecialType.STRIPED_V;
    if (hMatch.length >= 5) type = SpecialType.COLOR_BOMB;
    groups.push({ tiles: hMatch, color, type, pivot: hMatch[1] });
  });

  // Add remaining vertical matches
  verticalMatches.forEach((vMatch, idx) => {
    if (processedV.has(idx.toString())) return;
    const color = grid[vMatch[0].r][vMatch[0].c].color;
    let type = SpecialType.NONE;
    if (vMatch.length === 4) type = SpecialType.STRIPED_H;
    if (vMatch.length >= 5) type = SpecialType.COLOR_BOMB;
    groups.push({ tiles: vMatch, color, type, pivot: vMatch[1] });
  });

  return groups;
};

export const getEffectRange = (tile: Tile, grid: Tile[][]): { r: number, c: number }[] => {
  const range: { r: number, c: number }[] = [];
  const rows = grid.length;
  const cols = grid[0].length;

  if (tile.special === SpecialType.STRIPED_H) {
    for (let c = 0; c < cols; c++) range.push({ r: tile.x, c });
  } else if (tile.special === SpecialType.STRIPED_V) {
    for (let r = 0; r < rows; r++) range.push({ r, c: tile.y });
  } else if (tile.special === SpecialType.WRAPPED) {
    for (let r = tile.x - 1; r <= tile.x + 1; r++) {
      for (let c = tile.y - 1; c <= tile.y + 1; c++) {
        if (r >= 0 && r < rows && c >= 0 && c < cols) range.push({ r, c });
      }
    }
  }
  return range;
};
