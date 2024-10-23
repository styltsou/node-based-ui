import type { Point } from './Point';
import { EdgeType } from './Edge';
import { PortPlacement } from './Port';

export type ConnectionLine = {
  type: EdgeType | EdgeType.Straight;
  sourcePort: {
    position: Point;
    placement: PortPlacement;
  };
  targetPort: {
    position: Point;
    placement: PortPlacement;
  };
};
