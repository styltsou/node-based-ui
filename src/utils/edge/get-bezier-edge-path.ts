// This is a modified version of the getBezierPath function from react-flow
// (kind of) changed only a function signature to match the one used in the rest of the code
// https://github.com/wbkd/react-flow/blob/main/src/utils/getBezierPath.ts

import { Point, PortPlacement } from '../../types';

export type GetBezierPathParams = {
  sourcePort: Point;
  sourcePortPlacement?: PortPlacement;
  targetPort: Point;
  targetPortPlacement?: PortPlacement;
  curvature?: number;
};

export type GetControlWithCurvatureParams = {
  pos: PortPlacement;
  sourcePort: Point;
  targetPort: Point;
  curvature: number;
};

export function getBezierEdgeCenter({
  sourcePort,
  targetPort,
  sourceControl,
  targetControl,
}: {
  sourcePort: Point;
  targetPort: Point;
  sourceControl: Point;
  targetControl: Point;
}): [number, number, number, number] {
  // cubic bezier t=0.5 mid point, not the actual mid point, but easy to calculate
  // https://stackoverflow.com/questions/67516101/how-to-find-distance-mid-point-of-bezier-curve
  const centerX =
    sourcePort.x * 0.125 +
    sourceControl.x * 0.375 +
    targetControl.x * 0.375 +
    targetPort.x * 0.125;
  const centerY =
    sourcePort.y * 0.125 +
    sourceControl.y * 0.375 +
    targetControl.y * 0.375 +
    targetPort.y * 0.125;
  const offsetX = Math.abs(centerX - sourcePort.x);
  const offsetY = Math.abs(centerY - sourcePort.y);

  return [centerX, centerY, offsetX, offsetY];
}

function calculateControlOffset(distance: number, curvature: number): number {
  if (distance >= 0) {
    return 0.5 * distance;
  }

  return curvature * 25 * Math.sqrt(-distance);
}

function getControlWithCurvature({
  pos,
  sourcePort,
  targetPort,
  curvature,
}: GetControlWithCurvatureParams): [number, number] {
  switch (pos) {
    case PortPlacement.LEFT:
      return [
        sourcePort.x -
          calculateControlOffset(sourcePort.x - targetPort.x, curvature),
        sourcePort.y,
      ];
    case PortPlacement.RIGHT:
      return [
        sourcePort.x +
          calculateControlOffset(targetPort.x - sourcePort.x, curvature),
        sourcePort.y,
      ];
    case PortPlacement.TOP:
      return [
        sourcePort.x,
        sourcePort.y -
          calculateControlOffset(sourcePort.y - targetPort.y, curvature),
      ];
    case PortPlacement.BOTTOM:
      return [
        sourcePort.x,
        sourcePort.y +
          calculateControlOffset(targetPort.y - sourcePort.y, curvature),
      ];
  }
}

/**
 * Get a bezier path from source to target handle
 * @param params.sourceX - The x position of the source handle
 * @param params.sourceY - The y position of the source handle
 * @param params.sourcePosition - The position of the source handle (default: Position.Bottom)
 * @param params.targetX - The x position of the target handle
 * @param params.targetY - The y position of the target handle
 * @param params.targetPosition - The position of the target handle (default: Position.Top)
 * @param params.curvature - The curvature of the bezier edge
 * @returns A path string you can use in an SVG, the labelX and labelY position (center of path) and offsetX, offsetY between source handle and label
 * @example
 *  const source = { x: 0, y: 20 };
    const target = { x: 150, y: 100 };
    
    const [path, labelX, labelY, offsetX, offsetY] = getBezierPath({
      sourceX: source.x,
      sourceY: source.y,
      sourcePosition: Position.Right,
      targetX: target.x,
      targetY: target.y,
      targetPosition: Position.Left,
});
 */
export default function getBezierEdgePath({
  sourcePort,
  sourcePortPlacement = PortPlacement.BOTTOM,
  targetPort,
  targetPortPlacement = PortPlacement.TOP,
  curvature = 0.25,
}: GetBezierPathParams): [
  path: string,
  labelX: number,
  labelY: number,
  offsetX: number,
  offsetY: number
] {
  const sourceControl = getControlWithCurvature({
    pos: sourcePortPlacement,
    sourcePort,
    targetPort,
    curvature,
  });
  const targetControl = getControlWithCurvature({
    pos: targetPortPlacement,
    sourcePort,
    targetPort,
    curvature,
  });
  const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    sourcePort,
    targetPort,
    sourceControl: { x: sourceControl[0], y: sourceControl[1] },
    targetControl: { x: targetControl[0], y: targetControl[1] },
  });

  return [
    `M${sourcePort.x},${sourcePort.y} C${sourceControl[0]},${sourceControl[1]} ${targetControl[0]},${targetControl[1]} ${targetPort.x},${targetPort.y}`,
    labelX,
    labelY,
    offsetX,
    offsetY,
  ];
}
