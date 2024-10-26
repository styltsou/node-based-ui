import { useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import styles from './styles.module.scss';
import type { Point, Edge } from '../../types';
import { EdgeType } from '../../types';
import Toolbar from './toolbar';

import useBoardStore from '../../store';
// import useEdgeVisualizationStore from '../../store/edgeVisualizationStore';

import getPortPosition from '../../utils/port/get-port-position';

import getStraightEdgePath from '../../utils/edge/get-straight-edge-path';
import getStepEdgePath from '../../utils/edge/get-step-edge-path';
import getSmoothStepEdgePath from '../../utils/edge/get-smoothstep-edge-path';
import getBezierEdgePath from '../../utils/edge/get-bezier-edge-path';
import cn from '../../utils/cn';

export default function Edge({ edge }: { edge: Edge }) {
  const toolbarRef = useRef<HTMLDivElement>(null);

  const canvasPosition = useBoardStore(s => s.position);
  const nodes = useBoardStore(s => s.nodes);
  const globalEdgeType = useBoardStore(s => s.globalEdgeType);

  const [isHighlighted, setIsHighlighted] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<Point | null>(null);

  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);

  useOnClickOutside(toolbarRef, () => setToolbarPosition(null));

  if (!sourceNode || !targetNode) return null;

  const sourcePortPosition = getPortPosition(
    sourceNode,
    edge.sourcePortPlacement
  );

  const targetPortPosition = getPortPosition(
    targetNode,
    edge.targetPortPlacement
  );

  const edgeType = globalEdgeType || edge.type;

  let path: string = '';

  switch (edgeType) {
    case EdgeType.Straight:
      path = getStraightEdgePath(sourcePortPosition, targetPortPosition);
      break;
    case EdgeType.Step:
      path = getStepEdgePath({
        sourceNode,
        sourcePortPlacement: edge.sourcePortPlacement,
        targetNode,
        targetPortPlacement: edge.targetPortPlacement,
      });
      break;
    case EdgeType.SmoothStep:
      path = getSmoothStepEdgePath({
        sourceNode,
        sourcePortPlacement: edge.sourcePortPlacement,
        targetNode,
        targetPortPlacement: edge.targetPortPlacement,
      });
      break;
    case EdgeType.Bezier:
      [path, , , ,] = getBezierEdgePath({
        source: sourcePortPosition,
        target: targetPortPosition,
        sourcePlacement: edge.sourcePortPlacement,
        targetPlacement: edge.targetPortPlacement,
      });
      break;
    default:
      path = getStraightEdgePath(sourcePortPosition, targetPortPosition);
  }

  const handleEdgeClick = (e: React.MouseEvent<SVGPathElement>) => {
    setToolbarPosition({
      x: e.clientX - canvasPosition.x,
      y: e.clientY - canvasPosition.y,
    });
  };

  return (
    <>
      <Toolbar edge={edge} position={toolbarPosition} ref={toolbarRef} />
      <svg
        className={cn(
          styles.svg,
          (toolbarPosition || isHighlighted) && styles.highlighted
        )}
      >
        <path
          className={styles.hoverPath}
          d={path}
          onClick={handleEdgeClick}
          onMouseEnter={() => setIsHighlighted(true)}
          onMouseLeave={() => setIsHighlighted(false)}
        />
        <path
          className={cn(styles.path, toolbarPosition && styles.highlighted)}
          d={path}
        />
      </svg>
    </>
  );
}
