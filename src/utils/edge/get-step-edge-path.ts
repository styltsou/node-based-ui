import type { Node, Point } from '../../types';
import { PortPlacement } from '../../types/Port';
import getPortPosition from '../port/get-port-position';

export type RulerLine = {
  position: number;
  orientation: 'horizontal' | 'vertical';
};

export type GridBounds = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type GridSlice = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'corner' | 'external' | 'internal';
};

export type GraphNode = {
  point: Point;
  edges: {
    node: GraphNode;
    weight: number;
  }[];
};

export function getRulerLines({
  sourceNode,
  sourcePortPlacement,
  targetNode,
  targetPortPlacement,
}: {
  sourceNode: Node;
  sourcePortPlacement: PortPlacement;
  targetNode: Node;
  targetPortPlacement: PortPlacement;
}): RulerLine[] {
  const nodes = [
    { node: sourceNode, portPlacement: sourcePortPlacement },
    { node: targetNode, portPlacement: targetPortPlacement },
  ];

  return nodes.flatMap(({ node, portPlacement }) => {
    const { position, size } = node;
    return [
      { position: position.x, orientation: 'vertical' },
      { position: position.x + size.width, orientation: 'vertical' },
      { position: position.y, orientation: 'horizontal' },
      { position: position.y + size.height, orientation: 'horizontal' },
      {
        position: [PortPlacement.TOP, PortPlacement.BOTTOM].includes(
          portPlacement
        )
          ? position.x + size.width / 2
          : position.y + size.height / 2,
        orientation: [PortPlacement.TOP, PortPlacement.BOTTOM].includes(
          portPlacement
        )
          ? 'vertical'
          : 'horizontal',
      },
    ];
  });
}

export const getGridBounds = ({
  sourceNode,
  targetNode,
}: {
  sourceNode: Node;
  targetNode: Node;
}): GridBounds => {
  const padding =
    Math.min(
      Math.min(sourceNode.size.width, sourceNode.size.height),
      Math.min(targetNode.size.width, targetNode.size.height)
    ) / 2;

  // Calculate the bounds of the grid
  const xMin = Math.min(sourceNode.position.x, targetNode.position.x) - padding;
  const xMax =
    Math.max(
      sourceNode.position.x + sourceNode.size.width,
      targetNode.position.x + targetNode.size.width
    ) + padding;
  const yMin = Math.min(sourceNode.position.y, targetNode.position.y) - padding;
  const yMax =
    Math.max(
      sourceNode.position.y + sourceNode.size.height,
      targetNode.position.y + targetNode.size.height
    ) + padding;

  // Return an object with the grid bounds
  return { xMin, xMax, yMin, yMax };
};

// Helper function to determine slice type
function getSliceType(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: GridBounds
): GridSlice['type'] {
  const right = x + width;
  const bottom = y + height;

  // Check if it's a corner slice
  const isCorner =
    (x === bounds.xMin || right === bounds.xMax) &&
    (y === bounds.yMin || bottom === bounds.yMax);

  if (isCorner) return 'corner';

  // Check if it's an edge slice
  const isEdge =
    x === bounds.xMin ||
    right === bounds.xMax ||
    y === bounds.yMin ||
    bottom === bounds.yMax;

  if (isEdge) return 'external';

  return 'internal';
}

export const getGridSlices = ({
  rulers,
  gridBounds,
}: {
  rulers: RulerLine[];
  gridBounds: GridBounds;
}): GridSlice[] => {
  // Seperate vertical and horizontal lines,
  // sort them from left -> right and top -> bottom

  const verticalLines: number[] = [
    gridBounds.xMin,
    ...rulers
      .filter(r => r.orientation === 'vertical')
      .map(r => r.position)
      .sort((a, b) => a - b),
    gridBounds.xMax,
  ];

  const horizontalLines: number[] = [
    gridBounds.yMin,
    ...rulers
      .filter(r => r.orientation === 'horizontal')
      .map(r => r.position)
      .sort((a, b) => a - b),
    gridBounds.yMax,
  ];

  // Get all the slices by generating non-overlapping rectangles
  const slices: GridSlice[] = [];

  // Clean this up in the future or at least understand how it works
  for (let i = 0; i < verticalLines.length - 1; i++) {
    const x = verticalLines[i];
    const nextX = verticalLines[i + 1];
    const width = nextX - x;

    for (let j = 0; j < horizontalLines.length - 1; j++) {
      const y = horizontalLines[j];
      const nextY = horizontalLines[j + 1];
      const height = nextY - y;

      const type = getSliceType(x, y, width, height, gridBounds);

      slices.push({
        x,
        y,
        width,
        height,
        type,
      });
    }
  }

  return slices;
};

// Helper function to check if a point is a node corner
const isNodeCorner = (nodes: Node[], { x, y }: { x: number; y: number }) => {
  return nodes.some(
    node =>
      (x === node.position.x && y === node.position.y) ||
      (x === node.position.x + node.size.width && y === node.position.y) ||
      (x === node.position.x && y === node.position.y + node.size.height) ||
      (x === node.position.x + node.size.width &&
        y === node.position.y + node.size.height)
  );
};

const findSlicePoints = (
  slice: GridSlice,
  gridBounds: GridBounds,
  nodes: Node[]
): Point[] => {
  const points: Point[] = [];
  const { x, y, width, height, type } = slice;

  // Helper to add corner points if they don't coincide with node edges
  const addCornerIfValid = (
    nodes: Node[],
    cornerX: number,
    cornerY: number
  ) => {
    if (!isNodeCorner(nodes, { x: cornerX, y: cornerY })) {
      points.push({ x: cornerX, y: cornerY });
    }
  };

  addCornerIfValid(nodes, x, y); // Top-left
  addCornerIfValid(nodes, x + width, y); // Top-right
  addCornerIfValid(nodes, x, y + height); // Bottom-left
  addCornerIfValid(nodes, x + width, y + height); // Bottom-right

  // For edge slices, add middle point of outer edge
  if (type === 'external') {
    if (x === gridBounds.xMin) {
      // Left edge
      points.push({ x, y: y + height / 2 });
    }
    if (x + width === gridBounds.xMax) {
      // Right edge
      points.push({ x: x + width, y: y + height / 2 });
    }
    if (y === gridBounds.yMin) {
      // Top edge
      points.push({ x: x + width / 2, y });
    }
    if (y + height === gridBounds.yMax) {
      // Bottom edge
      points.push({ x: x + width / 2, y: y + height });
    }
  }

  // For internal slices, add middle points of all sides (except node edges)
  // and center point, as well as corner points if they're not node corners
  if (type === 'internal') {
    points.push(
      { x: x + width / 2, y }, // Top
      { x: x + width, y: y + height / 2 }, // Right
      { x: x + width / 2, y: y + height }, // Bottom
      { x, y: y + height / 2 }, // Left
      { x: x + width / 2, y: y + height / 2 } // Center
    );
  }

  // Remove the points that are either inside a node or on their sides
  const filteredPoints = points.filter(point => {
    return !nodes.some(node => {
      const { position, size } = node;
      return (
        (point.x > position.x &&
          point.x < position.x + size.width &&
          point.y > position.y &&
          point.y < position.y + size.height) ||
        ((point.x === position.x || point.x === position.x + size.width) &&
          point.y >= position.y &&
          point.y <= position.y + size.height) ||
        ((point.y === position.y || point.y === position.y + size.height) &&
          point.x >= position.x &&
          point.x <= position.x + size.width)
      );
    });
  });

  return filteredPoints;
};

export const getValidConnectionPoints = ({
  sourceNode,
  targetNode,
  slices,
  gridBounds,
}: {
  sourceNode: Node;
  targetNode: Node;
  slices: GridSlice[];
  gridBounds: GridBounds;
}): Point[] => {
  const gridPoints: Point[] = [];

  slices.forEach(slice => {
    gridPoints.push(
      ...findSlicePoints(slice, gridBounds, [sourceNode, targetNode])
    );
  });

  // Remove duplicate points
  const uniqueGridPoints = gridPoints.filter(
    (point, index, self) =>
      index === self.findIndex(t => t.x === point.x && t.y === point.y)
  );

  // Also add the soure and target port points
  return [...uniqueGridPoints];
};

export function getOrthogonalGraph(
  points: Point[],
  sourceNode: Node,
  targetNode: Node
): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();

  // Helper function to get a unique key for a point
  const getPointKey = (p: Point) => `${p.x},${p.y}`;

  // Create graph nodes
  points.forEach(point => {
    graph.set(getPointKey(point), { point, edges: [] });
  });

  // Helper function to check if a line segment intersects with a node
  const intersectsNode = (p1: Point, p2: Point, node: Node) => {
    const { position, size } = node;
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    return !(
      maxX < position.x ||
      minX > position.x + size.width ||
      maxY < position.y ||
      minY > position.y + size.height
    );
  };

  // Helper function to check if a point is on the edge of a node
  const isPointOnNodeEdge = (point: Point, node: Node) => {
    const { position, size } = node;
    return (
      ((point.x === position.x || point.x === position.x + size.width) &&
        point.y >= position.y &&
        point.y <= position.y + size.height) ||
      ((point.y === position.y || point.y === position.y + size.height) &&
        point.x >= position.x &&
        point.x <= position.x + size.width)
    );
  };

  const isValidEdgeForNodePoint = (p1: Point, p2: Point, node: Node) => {
    const { position, size } = node;
    if (p1.x === position.x) {
      // Left edge
      return p2.x < p1.x;
    } else if (p1.x === position.x + size.width) {
      // Right edge
      return p2.x > p1.x;
    } else if (p1.y === position.y) {
      // Top edge
      return p2.y < p1.y;
    } else if (p1.y === position.y + size.height) {
      // Bottom edge
      return p2.y > p1.y;
    }
    return true;
  };

  // New helper function to find the nearest valid point
  const findNearestValidPoint = (p: Point, node: Node) => {
    return points.reduce((nearest, current) => {
      if (current === p) return nearest;
      if (isPointOnNodeEdge(current, node)) return nearest;

      const currentDist = Math.abs(p.x - current.x) + Math.abs(p.y - current.y);
      const nearestDist = nearest
        ? Math.abs(p.x - nearest.x) + Math.abs(p.y - nearest.y)
        : Infinity;

      return currentDist < nearestDist &&
        isValidEdgeForNodePoint(p, current, node)
        ? current
        : nearest;
    }, null as Point | null);
  };

  // Connect nodes with orthogonal edges
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i];
      const p2 = points[j];

      if (p1.x === p2.x || p1.y === p2.y) {
        const isP1OnSource = isPointOnNodeEdge(p1, sourceNode);
        const isP1OnTarget = isPointOnNodeEdge(p1, targetNode);
        const isP2OnSource = isPointOnNodeEdge(p2, sourceNode);
        const isP2OnTarget = isPointOnNodeEdge(p2, targetNode);

        // Check if the edge is valid
        const isValidEdge =
          !intersectsNode(p1, p2, sourceNode) &&
          !intersectsNode(p1, p2, targetNode) &&
          ((!isP1OnSource && !isP1OnTarget && !isP2OnSource && !isP2OnTarget) ||
            (isP1OnSource && isValidEdgeForNodePoint(p1, p2, sourceNode)) ||
            (isP1OnTarget && isValidEdgeForNodePoint(p1, p2, targetNode)) ||
            (isP2OnSource && isValidEdgeForNodePoint(p2, p1, sourceNode)) ||
            (isP2OnTarget && isValidEdgeForNodePoint(p2, p1, targetNode)));

        if (isValidEdge) {
          const weight = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
          const node1 = graph.get(getPointKey(p1))!;
          const node2 = graph.get(getPointKey(p2))!;

          node1.edges.push({ node: node2, weight });
          node2.edges.push({ node: node1, weight });
        }
      }
    }
  }

  // Connect points on node edges to their nearest valid neighbors
  points.forEach(point => {
    if (isPointOnNodeEdge(point, sourceNode)) {
      const nearest = findNearestValidPoint(point, sourceNode);
      if (nearest) {
        const weight =
          Math.abs(point.x - nearest.x) + Math.abs(point.y - nearest.y);
        const node1 = graph.get(getPointKey(point))!;
        const node2 = graph.get(getPointKey(nearest))!;
        node1.edges.push({ node: node2, weight });
        // node2.edges.push({ node: node1, weight });
      }
    } else if (isPointOnNodeEdge(point, targetNode)) {
      const nearest = findNearestValidPoint(point, targetNode);
      if (nearest) {
        const weight =
          Math.abs(point.x - nearest.x) + Math.abs(point.y - nearest.y);
        const node1 = graph.get(getPointKey(point))!;
        const node2 = graph.get(getPointKey(nearest))!;
        node1.edges.push({ node: node2, weight });
        node2.edges.push({ node: node1, weight });
      }
    }
  });

  return graph;
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
  const rulers = getRulerLines({
    sourceNode,
    sourcePortPlacement,
    targetNode,
    targetPortPlacement,
  });

  // Know get the lines that define the bounds of the grid
  const gridBounds = getGridBounds({
    sourceNode,
    targetNode,
  });

  const gridSlices = getGridSlices({
    rulers,
    gridBounds,
  });

  let validConnectionPoints = getValidConnectionPoints({
    sourceNode,
    targetNode,
    slices: gridSlices,
    gridBounds,
  });

  const sourcePort = getPortPosition(sourceNode, sourcePortPlacement);
  const targetPort = getPortPosition(targetNode, targetPortPlacement);

  validConnectionPoints = [sourcePort, ...validConnectionPoints, targetPort];

  const graph = getOrthogonalGraph(
    validConnectionPoints,
    sourceNode,
    targetNode
  );

  console.log(graph);

  // Now we need to find the path between the valid connection points

  // Render all possible paths between the valid connection points (this is just for visualization)

  // We need to store the points and the valid orthogonal lines as a graph so we can perform A*
  // or a heuristic dijkstra variation to find the shortest path

  // We return the path that we found

  return '';
}
