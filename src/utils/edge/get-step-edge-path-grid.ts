import type { Node, Point } from '../../types';
import { PortPlacement } from '../../types/Port';
import { getOrthogonalRoute } from './orthogonal-routing';

// exported to use for visualizing the path
export function pathToSvg(points: Point[]): string {
  if (points.length < 2) {
    return '';
  }

  let svgPath = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const current = points[i];
    const previous = points[i - 1];

    if (current.x !== previous.x && current.y !== previous.y) {
      // If there's a diagonal movement, we need to add an intermediate point
      // We'll choose to move horizontally first, then vertically
      svgPath += ` L ${current.x} ${previous.y}`;
    }

    svgPath += ` L ${current.x} ${current.y}`;
  }

  return svgPath;
}

export default function getStepEdgePath({
  sourceNode,
  sourcePortPlacement,
  targetNode,
  targetPortPlacement,
}: {
  sourceNode: Node;
  sourcePortPlacement: PortPlacement;
  targetNode: Node;
  targetPortPlacement: PortPlacement;
}): string {
  const path = getOrthogonalRoute({
    sourceNode,
    sourcePortPlacement,
    targetNode,
    targetPortPlacement,
  });

  return pathToSvg(path);
}
