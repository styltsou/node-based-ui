export enum EdgeType {
  Straight = 'straight',
  Step = 'Step',
  SmoothStep = 'smoothstep',
  Bezier = 'bezier',
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
}
