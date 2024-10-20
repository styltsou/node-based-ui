import type { NodeGroup } from '../../types';
import styles from './styles.module.scss';

export default function NodeGroup({ nodeGroup }: { nodeGroup: NodeGroup }) {
  const handleClickGroupOptions = () => {
    console.log('click');
  };

  return (
    <div className={styles.groupWrapper} style={{ color: nodeGroup.color }}>
      <div className={styles.groupLabel}>
        <p>{nodeGroup.label}</p>
        <button aria-label="Group options" onClick={handleClickGroupOptions} />
      </div>
      <rect
        key={nodeGroup.id}
        className={styles.groupBox}
        x={nodeGroup.position.x}
        y={nodeGroup.position.y}
        width={nodeGroup.size.width}
        height={nodeGroup.size.height}
        stroke={nodeGroup.color}
      />
    </div>
  );
}

export function NodeGroupPlaceHolder() {
  return <div></div>;
}
