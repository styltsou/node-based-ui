import { Point, Node, PortPlacement } from '../../../types';
import getPortPosition from '../../port/get-port-position';

import { RulerLine, GridBounds, GridSlice, GraphNode } from './types';

import {
  getRulerLines,
  getGridBounds,
  getGridSlices,
  getConnectionPoints,
} from './grid';
import { getOrthogonalGraph, findShortestPath } from './graph';

function getOrthogonalRoute({
  sourceNode,
  sourcePortPlacement,
  targetNode,
  targetPortPlacement,
}: {
  sourceNode: Node;
  sourcePortPlacement: PortPlacement;
  targetNode: Node;
  targetPortPlacement: PortPlacement;
}): Point[] {
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

  let validConnectionPoints = getConnectionPoints({
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
    sourcePortPlacement,
    targetNode,
    targetPortPlacement
  );

  return findShortestPath(graph, sourcePort, targetPort, 10);
}

export {
  type RulerLine,
  type GridBounds,
  type GridSlice,
  type GraphNode,
  getRulerLines,
  getGridBounds,
  getGridSlices,
  getConnectionPoints,
  getOrthogonalGraph,
  findShortestPath,
  getOrthogonalRoute,
};
