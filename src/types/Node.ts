import { PortPlacement } from './Port';

export interface Node {
  id: string;
  type: string;
  isLocked: boolean;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  ports: PortPlacement[];
  data?: Record<string, unknown>;
}
