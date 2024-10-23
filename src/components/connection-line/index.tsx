import styles from './styles.module.scss';
import useBoardStore from '../../store';
import getStraightEdgePath from '../../utils/edge/get-straight-edge-path';

export default function ConnectionLine() {
  const connectionLine = useBoardStore(state => state.connectionLine);

  if (!connectionLine) return null;

  const path = getStraightEdgePath(
    connectionLine.sourcePort.position,
    connectionLine.targetPort.position
  );

  return (
    <svg className={styles.svg}>
      <path className={styles.path} d={path} />
    </svg>
  );
}
