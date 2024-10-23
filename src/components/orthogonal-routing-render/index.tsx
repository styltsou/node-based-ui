import styles from './styles.module.scss';
import useBoardStore from '../../store';
import { Point } from '../../types';
import {
  getRulerLines,
  getGridBounds,
  type GridBounds,
  type RulerLine,
  type GridSlice,
  type GraphNode,
  getGridSlices,
  getValidConnectionPoints,
  getOrthogonalGraph,
} from '../../utils/edge/get-step-edge-path';
import getPortPosition from '../../utils/port/get-port-position';
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
  const padding = 4;

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

function ValidConnectionPoints({ points }: { points: Point[] }) {
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
                stroke="white"
                strokeWidth="1"
              />
            );
          }
          return null;
        })
      )}
    </svg>
  );
}

export default function OrthogonalRoutingRender() {
  const nodes = useBoardStore(s => s.nodes);
  const edges = useBoardStore(s => s.edges);

  if (edges.length === 0) return null;

  const edge = edges[0];
  const sourceNode = nodes.find(n => n.id === edge.source)!;
  const targetNode = nodes.find(n => n.id === edge.target)!;

  const rulers = getRulerLines({
    sourceNode,
    sourcePortPlacement: edge.sourcePortPlacement,
    targetNode,
    targetPortPlacement: edge.targetPortPlacement,
  });

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

  const sourcePort = getPortPosition(sourceNode, edge.sourcePortPlacement);
  const targetPort = getPortPosition(targetNode, edge.targetPortPlacement);

  validConnectionPoints = [sourcePort, ...validConnectionPoints, targetPort];

  const graph = getOrthogonalGraph(
    validConnectionPoints,
    sourceNode,
    targetNode
  );

  return (
    <div className={styles.orthogonalRoutingRender}>
      {/* <Rulers rulers={rulers} /> */}
      {/* <GridBounds bounds={gridBounds} /> */}
      {/* <GridSlices slices={gridSlices} /> */}
      {/* <ValidConnectionPoints points={validConnectionPoints} /> */}
      <PossiblePaths graph={graph} />
    </div>
  );
}
