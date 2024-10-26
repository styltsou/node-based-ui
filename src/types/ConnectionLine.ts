import type { Node } from './Node';
import { PortPlacement } from './Port';

export type ConnectionLine = {
  sourceNode?: Node;
  sourcePortPlacement?: PortPlacement;
  targetNode?: Node;
  targetPortPlacement?: PortPlacement;
};
