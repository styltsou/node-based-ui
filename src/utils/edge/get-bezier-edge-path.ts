/*
 * This file is adapted from react-flow library
 * https://github.com/wbkd/react-flow/blob/master/src/utils/getBezierEdgePath.ts
 *
 * Changed the GetBezierPathParams to use the Point and PortPlacement types so it matches the rest of the codebase
 */

import { Point, PortPlacement } from '../../types';

export type GetBezierPathParams = {
  source: Point;
  sourcePlacement?: PortPlacement;
  target: Point;
  targetPlacement?: PortPlacement;
  curvature?: number;
};

export type GetControlWithCurvatureParams = {
  pos: PortPlacement;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: number;
};

export function getBezierEdgeCenter({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceControlX,
  sourceControlY,
  targetControlX,
  targetControlY,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceControlX: number;
  sourceControlY: number;
  targetControlX: number;
  targetControlY: number;
}): [number, number, number, number] {
  // cubic bezier t=0.5 mid point, not the actual mid point, but easy to calculate
  // https://stackoverflow.com/questions/67516101/how-to-find-distance-mid-point-of-bezier-curve
  const centerX =
    sourceX * 0.125 +
    sourceControlX * 0.375 +
    targetControlX * 0.375 +
    targetX * 0.125;
  const centerY =
    sourceY * 0.125 +
    sourceControlY * 0.375 +
    targetControlY * 0.375 +
    targetY * 0.125;
  const offsetX = Math.abs(centerX - sourceX);
  const offsetY = Math.abs(centerY - sourceY);

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
  x1,
  y1,
  x2,
  y2,
  c,
}: GetControlWithCurvatureParams): [number, number] {
  switch (pos) {
    case PortPlacement.LEFT:
      return [x1 - calculateControlOffset(x1 - x2, c), y1];
    case PortPlacement.RIGHT:
      return [x1 + calculateControlOffset(x2 - x1, c), y1];
    case PortPlacement.TOP:
      return [x1, y1 - calculateControlOffset(y1 - y2, c)];
    case PortPlacement.BOTTOM:
      return [x1, y1 + calculateControlOffset(y2 - y1, c)];
  }
}

/**
 * Get a bezier path from source to target handle
 * @param params.source - The source point
 * @param params.sourcePlacement - The position of the source handle (default: PortPlacement.BOTTOM)
 * @param params.target - The target point
 * @param params.targetPlacement - The position of the target handle (default: PortPlacement.TOP)
 * @param params.curvature - The curvature of the bezier edge
 * @returns A path string you can use in an SVG, the labelX and labelY position (center of path) and offsetX, offsetY between source port and label
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
export default function getBezierPath({
  source,
  sourcePlacement = PortPlacement.BOTTOM,
  target,
  targetPlacement = PortPlacement.TOP,
  curvature = 0.5,
}: GetBezierPathParams): [
  path: string,
  labelX: number,
  labelY: number,
  offsetX: number,
  offsetY: number
] {
  const [sourceControlX, sourceControlY] = getControlWithCurvature({
    pos: sourcePlacement,
    x1: source.x,
    y1: source.y,
    x2: target.x,
    y2: target.y,
    c: curvature,
  });
  const [targetControlX, targetControlY] = getControlWithCurvature({
    pos: targetPlacement,
    x1: target.x,
    y1: target.y,
    x2: source.x,
    y2: source.y,
    c: curvature,
  });
  const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX: source.x,
    sourceY: source.y,
    targetX: target.x,
    targetY: target.y,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY,
  });

  return [
    `M${source.x},${source.y} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${target.x},${target.y}`,
    labelX,
    labelY,
    offsetX,
    offsetY,
  ];
}
