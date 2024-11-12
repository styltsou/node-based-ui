import { Point, Node, PortPlacement } from '../../types';

import { getOrthogonalRoute } from './orthogonal-routing';
import getLabelPosition from './orthogonal-routing/get-label-position';

export const CURVATURE_FACTOR = 15;

export function pathToSmoothSvg(points: Point[], radius: number): string {
  if (points.length < 2) {
    return '';
  }

  let svgPath = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];

    // Check if this point is a corner
    if (
      (prev.x !== current.x || current.x !== next.x) &&
      (prev.y !== current.y || current.y !== next.y)
    ) {
      // This is a corner, apply smoothing
      const v1 = { x: prev.x - current.x, y: prev.y - current.y };
      const v2 = { x: next.x - current.x, y: next.y - current.y };

      const crossProduct = v1.x * v2.y - v1.y * v2.x;
      const sweepFlag = crossProduct < 0 ? 1 : 0;

      const startPoint = {
        x: current.x + (v1.x / Math.hypot(v1.x, v1.y)) * radius,
        y: current.y + (v1.y / Math.hypot(v1.x, v1.y)) * radius,
      };

      const endPoint = {
        x: current.x + (v2.x / Math.hypot(v2.x, v2.y)) * radius,
        y: current.y + (v2.y / Math.hypot(v2.x, v2.y)) * radius,
      };

      svgPath += ` L ${startPoint.x} ${startPoint.y}`;
      svgPath += ` A ${radius} ${radius} 0 0 ${sweepFlag} ${endPoint.x} ${endPoint.y}`;
    } else {
      // This is not a corner, just draw a line to it
      svgPath += ` L ${current.x} ${current.y}`;
    }
  }

  // Add the final point
  const lastPoint = points[points.length - 1];
  svgPath += ` L ${lastPoint.x} ${lastPoint.y}`;

  return svgPath;
}

export default function getSmoothstepEdgePath({
  sourceNode,
  sourcePortPlacement,
  targetNode,
  targetPortPlacement,
}: {
  sourceNode: Node;
  sourcePortPlacement: PortPlacement;
  targetNode: Node;
  targetPortPlacement: PortPlacement;
}): [path: string, labelX: number, labelY: number] {
  // / Calculate the corner radius based on the minimum node dimension
  const cornerRadius =
    Math.min(
      sourceNode.size.width,
      sourceNode.size.height,
      targetNode.size.width,
      targetNode.size.height
    ) / CURVATURE_FACTOR;

  const points = getOrthogonalRoute({
    sourceNode,
    sourcePortPlacement,
    targetNode,
    targetPortPlacement,
  });

  const labelPosition = getLabelPosition(points);
  const path = pathToSmoothSvg(points, cornerRadius);

  return [path, labelPosition.x, labelPosition.y];
}
