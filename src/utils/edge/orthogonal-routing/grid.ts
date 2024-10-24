import { Point, Node, PortPlacement } from '../../../types';
import type { RulerLine, GridBounds, GridSlice } from './types';

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

export const getConnectionPoints = ({
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
