import { Point, Node, PortPlacement } from '../../../types';
import { GraphNode, NodeState, Direction } from './types';
import getPortPosition from '../../port/get-port-position';
import { PriorityQueue } from './priority-queue';

function getPointKey(p: Point): string {
  return `${p.x},${p.y}`;
}

function connectPoints(
  pointA: Point,
  pointB: Point,
  graph: Map<string, GraphNode>
) {
  const nodeA = graph.get(getPointKey(pointA))!;
  const nodeB = graph.get(getPointKey(pointB))!;

  const weight = Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);

  nodeA.edges.push({ node: nodeB, weight });
  nodeB.edges.push({ node: nodeA, weight });
}

// Helper function to check if a line segment intersects with or is tangent to a node
const intersectsOrTangentToNode = (p1: Point, p2: Point, node: Node) => {
  const { position, size } = node;
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  // Check for intersection or tangency
  return (
    maxX >= position.x &&
    minX <= position.x + size.width &&
    maxY >= position.y &&
    minY <= position.y + size.height
  );
};

const findClosestPointToPort = (
  port: Point,
  portPlacement: PortPlacement,
  points: Point[]
) => {
  const pointsInPortLine = points
    .filter(
      point =>
        (point.x === port.x && point.y !== port.y) ||
        (point.y === port.y && point.x !== port.x)
    )
    .map(point => ({
      point,
      alignment: point.x === port.x ? 'vertical' : 'horizontal',
    }));

  // Find a point in the port line that is closest to the port depending on the port placement
  let closestPointToPort: Point | null = null;

  // Include the port in the array of points
  if (
    portPlacement === PortPlacement.TOP ||
    portPlacement === PortPlacement.BOTTOM
  ) {
    // Sort points by y-coordinate
    const pointsToSort = [
      port,
      ...pointsInPortLine
        .filter(p => p.alignment === 'vertical')
        .map(p => p.point),
    ];
    const sortedPoints = pointsToSort.sort((a, b) => a.y - b.y);
    const portIndex = sortedPoints.findIndex(p => p === port);

    if (portPlacement === PortPlacement.TOP) {
      closestPointToPort = sortedPoints[portIndex - 1] || null;
    } else {
      closestPointToPort = sortedPoints[portIndex + 1] || null;
    }
  } else {
    // Sort points by x-coordinate
    const pointsToSort = [
      port,
      ...pointsInPortLine
        .filter(p => p.alignment === 'horizontal')
        .map(p => p.point),
    ];
    const sortedPoints = pointsToSort.sort((a, b) => a.x - b.x);
    const portIndex = sortedPoints.findIndex(p => p === port);

    if (portPlacement === PortPlacement.LEFT) {
      closestPointToPort = sortedPoints[portIndex - 1] || null;
    } else {
      closestPointToPort = sortedPoints[portIndex + 1] || null;
    }
  }

  return closestPointToPort;
};

export function getOrthogonalGraph(
  points: Point[],
  sourceNode: Node,
  sourcePortPlacement: PortPlacement,
  targetNode: Node,
  targetPortPlacement: PortPlacement
): Map<string, GraphNode> {
  const targetPort = getPortPosition(targetNode, targetPortPlacement);
  const sourcePort = getPortPosition(sourceNode, sourcePortPlacement);

  const graph = new Map<string, GraphNode>();

  // Create graph nodes
  points.forEach(point => {
    graph.set(getPointKey(point), { point, edges: [] });
  });

  // Connect points except from source and target ports
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i];
      const p2 = points[j];

      if (
        p1 === sourcePort ||
        p1 === targetPort ||
        p2 === sourcePort ||
        p2 === targetPort ||
        !(p1.x === p2.x || p1.y === p2.y)
      ) {
        continue;
      }

      if (
        !intersectsOrTangentToNode(p1, p2, sourceNode) &&
        !intersectsOrTangentToNode(p1, p2, targetNode)
      ) {
        connectPoints(p1, p2, graph);
      }
    }
  }

  // Connect source port
  const closestPointToSourcePort = findClosestPointToPort(
    sourcePort,
    sourcePortPlacement,
    points
  );

  connectPoints(sourcePort, closestPointToSourcePort, graph);

  // Connect target port
  const closestPointToTargetPort = findClosestPointToPort(
    targetPort,
    targetPortPlacement,
    points
  );

  connectPoints(targetPort, closestPointToTargetPort, graph);

  return graph;
}

export const DIRECTION_CHANGE_PENALTY = 20;

export function findShortestPath(
  graph: Map<string, GraphNode>,
  start: Point,
  end: Point,
  directionChangePenalty: number = DIRECTION_CHANGE_PENALTY
): Point[] {
  const distances = new Map<string, number>();
  const previous = new Map<string, GraphNode | null>();
  const pq = new PriorityQueue<NodeState>();

  // Initialize distances
  for (const [key] of graph) {
    distances.set(key, Infinity);
  }

  distances.set(getPointKey(start), 0);

  pq.enqueue(
    { node: graph.get(getPointKey(start))!, distance: 0, direction: 'none' },
    0
  );

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const currentKey = getPointKey(current.node.point);

    if (current.node.point.x === end.x && current.node.point.y === end.y) {
      break; // We've reached the end point
    }

    for (const { node: neighbor, weight } of current.node.edges) {
      const neighborKey = getPointKey(neighbor.point);

      // Determine the direction of this edge
      const newDirection: Direction =
        neighbor.point.x !== current.node.point.x ? 'horizontal' : 'vertical';

      // Apply penalty if direction changes
      const penalty =
        newDirection !== current.direction && current.direction !== 'none'
          ? directionChangePenalty
          : 0;

      const tentativeDistance = distances.get(currentKey)! + weight + penalty;

      if (tentativeDistance < distances.get(neighborKey)!) {
        distances.set(neighborKey, tentativeDistance);
        previous.set(neighborKey, current.node);
        pq.enqueue(
          {
            node: neighbor,
            distance: tentativeDistance,
            direction: newDirection,
          },
          tentativeDistance
        );
      }
    }
  }

  // Reconstruct the path
  const path: Point[] = [];
  let current: GraphNode | null = graph.get(getPointKey(end)) || null;

  while (current) {
    path.unshift(current.point);
    const previousKey = getPointKey(current.point);
    current = previous.get(previousKey) || null;
  }

  // Ensure the start point is included
  if (path[0] !== start) {
    path.unshift(start);
  }

  return path;
}
