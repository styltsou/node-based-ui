import styles from './styles.module.scss';
import { EdgeType } from '../../types';

import useBoardStore from '../../store';

import getPortPosition from '../../utils/port/get-port-position';
import getStraightEdgePath from '../../utils/edge/get-straight-edge-path';
import getStepEdgePath from '../../utils/edge/get-step-edge-path';
import getSmoothstepEdgePath from '../../utils/edge/get-smoothstep-edge-path';
import getBezierPath from '../../utils/edge/get-bezier-edge-path';

export default function ConnectionLine() {
  const connectionLine = useBoardStore(state => state.connectionLine);
  const globalEdgeType = useBoardStore(state => state.globalEdgeType);
  const lastAssignedEdgeType = useBoardStore(
    state => state.lastAssignedEdgeType
  );

  if (!connectionLine) return null;

  let path = '';

  // TODO: Instead of last of straight, use last assigned edge type
  const edgeType = globalEdgeType || lastAssignedEdgeType || EdgeType.Straight;

  switch (edgeType) {
    case EdgeType.Straight:
      [path] = getStraightEdgePath(
        getPortPosition(
          connectionLine.sourceNode!,
          connectionLine.sourcePortPlacement!
        ),
        getPortPosition(
          connectionLine.targetNode!,
          connectionLine.targetPortPlacement!
        )
      );
      break;
    case EdgeType.Step:
      [path] = getStepEdgePath({
        sourceNode: connectionLine.sourceNode!,
        sourcePortPlacement: connectionLine.sourcePortPlacement!,
        targetNode: connectionLine.targetNode!,
        targetPortPlacement: connectionLine.targetPortPlacement!,
      });
      break;
    case EdgeType.SmoothStep:
      [path] = getSmoothstepEdgePath({
        sourceNode: connectionLine.sourceNode!,
        sourcePortPlacement: connectionLine.sourcePortPlacement!,
        targetNode: connectionLine.targetNode!,
        targetPortPlacement: connectionLine.targetPortPlacement!,
      });
      break;
    case EdgeType.Bezier:
      [path] = getBezierPath({
        source: getPortPosition(
          connectionLine.sourceNode!,
          connectionLine.sourcePortPlacement!
        ),
        sourcePlacement: connectionLine.sourcePortPlacement!,
        target: getPortPosition(
          connectionLine.targetNode!,
          connectionLine.targetPortPlacement!
        ),
        targetPlacement: connectionLine.targetPortPlacement!,
      });
      break;
  }

  return (
    <svg className={styles.svg}>
      <path className={styles.path} d={path} />
    </svg>
  );
}
