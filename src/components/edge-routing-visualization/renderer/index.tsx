import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import styles from './styles.module.scss';
import { Point } from '../../../types';

import Node from '../../node';

import useBoardStore from '../../../store';
import useEdgeVisualizationStore from '../../../store/edgeVisualizationStore';
import getPortPosition from '../../../utils/port/get-port-position';

import {
  getRulerLines,
  getGridBounds,
  type GridBounds,
  type RulerLine,
  type GridSlice,
  type GraphNode,
  getGridSlices,
  getConnectionPoints,
  getOrthogonalGraph,
  findShortestPath,
} from '../../../utils/edge/orthogonal-routing';

import { pathToSvg } from '../../../utils/edge/get-step-edge-path';
import {
  CURVATURE_FACTOR,
  pathToSmoothSvg,
} from '../../../utils/edge/get-smoothstep-edge-path';

function Rulers({ rulers }: { rulers: RulerLine[] }) {
  return (
    <svg className={styles.rulers}>
      {rulers.map((ruler, index) => {
        const isHorizontal = ruler.orientation === 'horizontal';
        const lineProps = isHorizontal
          ? {
              x1: '0%',
              y1: ruler.position,
              x2: '100%',
              y2: ruler.position,
            }
          : {
              x1: ruler.position,
              y1: '0%',
              x2: ruler.position,
              y2: '100%',
            };

        return <line key={index} className={styles.line} {...lineProps} />;
      })}
    </svg>
  );
}

function GridBounds({ bounds }: { bounds: GridBounds }) {
  return (
    <svg className={styles.gridBounds}>
      <rect
        className={styles.gridBoundsRect}
        x={bounds.xMin}
        y={bounds.yMin}
        width={bounds.xMax - bounds.xMin}
        height={bounds.yMax - bounds.yMin}
      />
    </svg>
  );
}

function GridSlices({ slices }: { slices: GridSlice[] }) {
  const padding = 3;

  const colorMap: Record<GridSlice['type'], string> = {
    corner: '#FFB6C6',
    external: '#FFA500',
    internal: '#87CEEB',
  };

  return (
    <svg className={styles.gridSlices}>
      {slices.map(slice => (
        <rect
          key={`slice-${slice.x}-${slice.y}`}
          x={slice.x + padding}
          y={slice.y + padding}
          width={slice.width - padding * 2}
          height={slice.height - padding * 2}
          fill={colorMap[slice.type]}
          opacity={0.1}
        />
      ))}
    </svg>
  );
}

function ConnectionPoints({ points }: { points: Point[] }) {
  return (
    <svg className={styles.validConnectionPoints}>
      {points.map(point => (
        <circle
          key={`${point.x}-${point.y}`}
          cx={point.x}
          cy={point.y}
          r={4}
          fill="blue"
        />
      ))}
    </svg>
  );
}

function PossiblePaths({ graph }: { graph: Map<string, GraphNode> }) {
  const getPointKey = (p: Point) => `${p.x},${p.y}`;

  return (
    <svg className={styles.possiblePaths}>
      {Array.from(graph.entries()).flatMap(([key, node]) =>
        node.edges.map(edge => {
          if (getPointKey(node.point) < getPointKey(edge.node.point)) {
            return (
              <line
                key={`${key}-${getPointKey(edge.node.point)}`}
                x1={node.point.x}
                y1={node.point.y}
                x2={edge.node.point.x}
                y2={edge.node.point.y}
              />
            );
          }

          return null;
        })
      )}
    </svg>
  );
}

function StepEdge({ path }: { path: string }) {
  return (
    <svg className={styles.stepEdge}>
      <path d={path} strokeWidth="2" />
    </svg>
  );
}

function PortSVG({ port }: { port: Point }) {
  return (
    <svg className={styles.port}>
      <circle cx={port.x} cy={port.y} r={5} />
    </svg>
  );
}

export default function EdgeRoutingRenderer() {
  const nodes = useBoardStore(s => s.nodes);
  const edges = useBoardStore(s => s.edges);

  const addNode = useBoardStore(s => s.addNode);
  const deleteNode = useBoardStore(s => s.deleteNode);

  const selectedEdgeId = useEdgeVisualizationStore(s => s.selectedEdgeId);

  const {
    showRulers,
    showGridBounds,
    showGridSlices,
    showConnectionPoints,
    showPossiblePaths,
    showStepEdge,
    showSmoothEdge,
  } = useEdgeVisualizationStore();

  const edge = edges.find(e => e.id === selectedEdgeId)!;

  const sourceNode = nodes.find(n => n.id === edge.source)!;
  const targetNode = nodes.find(n => n.id === edge.target)!;

  // 1. Create copies of the nodes
  const sourceNodeCopy = { ...sourceNode, id: uuidv4() };
  const targetNodeCopy = { ...targetNode, id: uuidv4() };

  // 4. Push the nodes and edge in global state
  addNode(sourceNodeCopy);
  addNode(targetNodeCopy);

  // On renderer unmount, remove the copies from global state

  const rulers = getRulerLines({
    sourceNode: sourceNodeCopy,
    sourcePortPlacement: edge.sourcePortPlacement,
    targetNode: targetNodeCopy,
    targetPortPlacement: edge.targetPortPlacement,
  });

  const gridBounds = getGridBounds({
    sourceNode: sourceNodeCopy,
    targetNode: targetNodeCopy,
  });

  const gridSlices = getGridSlices({
    rulers,
    gridBounds,
  });

  let connectionPoints = getConnectionPoints({
    sourceNode: sourceNodeCopy,
    targetNode: targetNodeCopy,
    slices: gridSlices,
    gridBounds,
  });

  const sourcePort = getPortPosition(sourceNodeCopy, edge.sourcePortPlacement);
  const targetPort = getPortPosition(targetNodeCopy, edge.targetPortPlacement);

  connectionPoints = [sourcePort, ...connectionPoints, targetPort];

  const graph = getOrthogonalGraph(
    connectionPoints,
    sourceNodeCopy,
    edge.sourcePortPlacement,
    targetNodeCopy,
    edge.targetPortPlacement
  );

  const path = findShortestPath(graph, sourcePort, targetPort);

  const smoothStepRadius =
    Math.min(
      sourceNode.size.width,
      sourceNode.size.height,
      targetNode.size.width,
      targetNode.size.height
    ) / CURVATURE_FACTOR;

  const svgPath = showSmoothEdge
    ? pathToSmoothSvg(path, smoothStepRadius)
    : pathToSvg(path);

  useEffect(() => {
    return () => {
      console.log('component unmounting');
      deleteNode(sourceNodeCopy.id);
      deleteNode(targetNodeCopy.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceNodeCopy.id, targetNodeCopy.id]);

  return (
    <div className={styles.orthogonalRoutingRender}>
      {showRulers && <Rulers rulers={rulers} />}
      {showGridBounds && <GridBounds bounds={gridBounds} />}
      {showGridSlices && <GridSlices slices={gridSlices} />}
      {showConnectionPoints && <ConnectionPoints points={connectionPoints} />}
      {showPossiblePaths && <PossiblePaths graph={graph} />}
      {showStepEdge && <StepEdge path={svgPath} />}

      <div className={styles.nodes}>
        <Node node={sourceNode} />
        <Node node={targetNode} />
      </div>

      <PortSVG port={sourcePort} />
      <PortSVG port={targetPort} />
    </div>
  );
}
