import type { Edge } from '../../types';
import { EdgeType } from '../../types';
import useBoardStore from '../../store';
import cn from '../../utils/cn';
import styles from './styles.module.scss';
import getEdgePath, { getStraightEdgePath } from '../node/getEdgePath';

export default function Edge({ edge }: { edge: Edge }) {
  const nodes = useBoardStore(s => s.nodes);
  const deleteEdge = useBoardStore(s => s.deleteEdge);

  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);

  if (!sourceNode || !targetNode) return null;

  // const path = getEdgePath(sourceNodePort, targetNodePort, edge.type);
  const path = getEdgePath(EdgeType.Straight, sourceNode, targetNode);

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

type ConnectionLineProps = {
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  type: EdgeType;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ConnectionLine({ start, end, type }: ConnectionLineProps) {
  const path = getStraightEdgePath(start, end);

  // Not yet implemented
  if (type !== EdgeType.Straight) {
    return null;
  }

  return (
    <svg className={styles.svg}>
      <path className={cn(styles.path, styles.placeholder)} d={path} />
    </svg>
  );
}
