import type { Node } from '../../types';

export default function getNodesBoundingBox(
  nodes: Node[],
  padding: number = 30
): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // Find the leftmost, rightmost, topmost and bottommost edges of all nodes
  const bounds = nodes.reduce(
    (acc, node) => {
      const left = node.position.x;
      const right = node.position.x + (node.size?.width || 0);
      const top = node.position.y;
      const bottom = node.position.y + (node.size?.height || 0);

      return {
        xMin: Math.min(acc.xMin, left),
        xMax: Math.max(acc.xMax, right),
        yMin: Math.min(acc.yMin, top),
        yMax: Math.max(acc.yMax, bottom),
      };
    },
    {
      xMin: Infinity,
      xMax: -Infinity,
      yMin: Infinity,
      yMax: -Infinity,
    }
  );

  // Add padding to the bounds
  bounds.xMin -= padding;
  bounds.xMax += padding;
  bounds.yMin -= padding;
  bounds.yMax += padding;

  return {
    x: bounds.xMin,
    y: bounds.yMin,
    width: bounds.xMax - bounds.xMin,
    height: bounds.yMax - bounds.yMin,
  };
}
