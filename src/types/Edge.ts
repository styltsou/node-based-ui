import { PortPlacement } from './Port';

export enum EdgeType {
  Straight = 'straight',
  Step = 'step',
  SmoothStep = 'smoothstep',
  Bezier = 'bezier',
}

export interface Edge {
  id: string;
  source: string;
  sourcePortPlacement: PortPlacement;
  target: string;
  targetPortPlacement: PortPlacement;
  type: EdgeType;
}
