import type { Point } from '../../types';

export default function getStraightEdgePath(
  start: Point,
  end: Point
): [path: string, labelX: number, labelY: number] {
  let d = '';

  d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

  const labelX = (start.x + end.x) / 2;
  const labelY = (start.y + end.y) / 2;

  return [d, labelX, labelY];
}
