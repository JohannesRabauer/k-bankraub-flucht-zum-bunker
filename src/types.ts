export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export enum GameState {
  MENU,
  PLAYING,
  WIN,
  GAME_OVER,
}

export enum TileType {
  EMPTY = 0,
  SOLID = 1,
  SLIDE = 2, // must slide under
  PIT = 3,
  PLATFORM = 4,
  BUNKER = 5,
}

export interface Collectible {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'coin' | 'cash' | 'gold' | 'speed' | 'shield';
  collected: boolean;
}

export interface LevelData {
  width: number;
  height: number;
  tileSize: number;
  tiles: TileType[][];
  collectibles: Collectible[];
  playerStart: Vec2;
  bunkerX: number;
}
