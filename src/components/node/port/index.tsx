import styles from './styles.module.scss';
import { PortPlacement } from '../../../types';
import cn from '../../../utils/cn';
import { PORT_SIZE } from '../../../constants';

interface PortProps {
  nodeId: string;
  placement: PortPlacement;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrag: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function Port({
  nodeId,
  placement,
  onDragOver,
  onDrop,
  onDragStart,
  onDrag,
  onDragEnd,
}: PortProps) {
  const portStyles = {
    width: `${PORT_SIZE}rem`,
    height: `${PORT_SIZE}rem`,
  };

  return (
    <div
      id={`port-${nodeId}-${placement}`}
      className={cn(styles.portWrapper, styles[placement])}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        className={styles.port}
        style={portStyles}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragOver={e => e.preventDefault()}
        onDragEnd={onDragEnd}
        draggable
      />
    </div>
  );
}
