import { EdgeType, Node } from '../../types';

export type Point = {
  x: number;
  y: number;
};

export function getStraightEdgePath(start: Point, end: Point): string {
  let d = '';

  d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

  return d;
}

export function getBezierEdgePath(
  start: Point,
  end: Point,
  startNodeSize: { width: number; height: number },
  endNodeSize: { width: number; height: number }
): string {
  // Calculate the bounding boxes
  const startNodeBottom = start.y + startNodeSize.height / 2;
  // const startNodeTop = start.y - startNodeSize.height / 2;
  // const endNodeBottom = end.y + endNodeSize.height / 2;
  const endNodeTop = end.y - endNodeSize.height / 2;

  // Fixed vertical offset for control points
  const verticalOffset = 50; // This controls the height of the curve

  // Initialize control points
  const controlPoint1: Point = {
    x: start.x + (end.x - start.x) / 3, // Control point 1
    y: start.y - verticalOffset, // Start above the start node
  };

  const controlPoint2: Point = {
    x: start.x + (end.x - start.x) * (2 / 3), // Control point 2
    y: end.y - verticalOffset, // Start below the end node
  };

  // Adjust control points based on the relative positions of the nodes
  if (end.x < start.x) {
    // If the target node is to the left of the source node
    controlPoint1.y += verticalOffset; // Move control point 1 down
    controlPoint2.y += verticalOffset; // Move control point 2 down
  } else {
    // If the target node is to the right of the source node
    controlPoint1.y -= verticalOffset; // Move control point 1 up
    controlPoint2.y -= verticalOffset; // Move control point 2 up
  }

  // Ensure control points do not overlap with the nodes
  if (controlPoint1.y < startNodeBottom) {
    controlPoint1.y = startNodeBottom + verticalOffset; // Adjust if it overlaps with the start node
  }

  if (controlPoint2.y > endNodeTop) {
    controlPoint2.y = endNodeTop - verticalOffset; // Adjust if it overlaps with the end node
  }

  // Construct the Bezier path
  return `M ${start.x} ${start.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${end.x} ${end.y}`;
}

export default function getEdgePath(
  type: EdgeType,
  sourceNode: Node,
  targetNode: Node
) {
  // Find the appropriate port coords for each of the node

  if (!sourceNode || !targetNode) return '';

  const sourceNodePort: Point = {
    x: sourceNode.position.x + sourceNode.size.width,
    y: sourceNode.position.y + sourceNode.size.height / 2,
  };
  const targetNodePort: Point = {
    x: targetNode.position.x,
    y: targetNode.position.y + targetNode.size.height / 2,
  };

  switch (type) {
    case 'straight':
      return getStraightEdgePath(sourceNodePort, targetNodePort);
    case 'bezier':
      return getBezierEdgePath(
        sourceNodePort,
        targetNodePort,
        sourceNode.size,
        targetNode.size
      );
  }
}

export const getConectionLinePath = (
  sourceNode: Node,
  targetPoint: Point,
  type: EdgeType
) => {
  return getEdgePath(type, sourceNode, {
    id: 'connection-line-target',
    size: { width: 0, height: 0 },
    position: targetPoint,
    type: 'connection-line-targ',
    isLocked: false,
  });
};
