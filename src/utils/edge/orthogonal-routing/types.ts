import type { Point } from '../../../types';

export type RulerLine = {
  position: number;
  orientation: 'horizontal' | 'vertical';
};

export type GridBounds = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type GridSlice = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'corner' | 'external' | 'internal';
};

export type GraphNode = {
  point: Point;
  edges: {
    node: GraphNode;
    weight: number;
  }[];
};

export type Direction = 'horizontal' | 'vertical' | 'none';

export interface NodeState {
  node: GraphNode;
  distance: number;
  direction: Direction;
}
