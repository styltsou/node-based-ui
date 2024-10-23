export enum PortPlacement {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

// TODO: Might not need that
interface Port {
  nodeId: string;
  placement: PortPlacement;
  type: 'source' | 'target';
}

export type { Port };
