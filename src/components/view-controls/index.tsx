import {
  IconLock,
  IconLockOpen,
  IconMaximize,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import styles from './styles.module.scss';
import useBoardStore from '../../store';
import { MIN_ZOOM, MAX_ZOOM } from '../../constants';

export default function ViewControls() {
  const zoom = useBoardStore(s => s.zoom);
  const zoomIn = useBoardStore(s => s.zoomIn);
  const zoomOut = useBoardStore(s => s.zoomOut);
  const isInteractive = useBoardStore(s => s.isInteractive);
  const toggleInteractivity = useBoardStore(s => s.toggleInteractivity);

  const handleFitInView = () => {
    // 1. find the size of the view port.
    // 2. Find the size of the nodes bounding box.
    // 3. if bounding box fits in view port, calculate canvas position to have the box in the center
    // 4. if bounding box does not fit in viewport, calculate the zoom (scale ratio) to make it fit, then do step 3.
  };

  return (
    <div className={styles.wrapper}>
      <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
        <IconPlus size={18} stroke={1.5} />
      </button>
      <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
        <IconMinus size={18} stroke={1.5} />
      </button>
      <button className={styles.iconButton} onClick={handleFitInView}>
        <IconMaximize size={18} stroke={1.5} />
      </button>
      <button onClick={toggleInteractivity}>
        {isInteractive ? (
          <IconLockOpen size={18} stroke={1.5} />
        ) : (
          <IconLock size={18} stroke={1.5} />
        )}
      </button>
    </div>
  );
}
