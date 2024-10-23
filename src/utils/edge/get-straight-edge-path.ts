import type { Point } from '../../types';

export default function getStraightEdgePath(start: Point, end: Point): string {
  let d = '';

  d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

  return d;
}
