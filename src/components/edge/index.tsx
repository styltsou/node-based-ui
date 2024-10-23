import styles from './styles.module.scss';

import type { Edge } from '../../types';
// import { EdgeType } from '../../types';

import useBoardStore from '../../store';
import getPortPosition from '../../utils/port/get-port-position';
import getStraightEdgePath from '../../utils/edge/get-straight-edge-path';

export default function Edge({ edge }: { edge: Edge }) {
  const nodes = useBoardStore(s => s.nodes);
  const deleteEdge = useBoardStore(s => s.deleteEdge);

  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);

  if (!sourceNode || !targetNode) return null;

  const sourcePortPosition = getPortPosition(
    sourceNode,
    edge.sourcePortPlacement
  );

  const targetPortPosition = getPortPosition(
    targetNode,
    edge.targetPortPlacement
  );

  const path = getStraightEdgePath(sourcePortPosition, targetPortPosition);

  const handleEdgeClick = () => {
    deleteEdge(edge.id);
  };

  return (
    <svg className={styles.svg}>
      <path className={styles.hoverPath} d={path} onClick={handleEdgeClick} />
      <path className={styles.path} d={path} />
    </svg>
  );
}
