import { useMemo } from 'react';
import {
  IconArrowsMove,
  IconZoomReset,
  IconArrowBackUp,
  IconArrowForwardUp,
} from '@tabler/icons-react';
import styles from './styles.module.scss';
import useBoardStore from '../../../store';

export default function ViewControls() {
  const canvasPosition = useBoardStore(s => s.position);
  const canvasZoom = useBoardStore(s => s.zoom);
  const resetPanning = useBoardStore(s => s.resetPanning);
  const resetZoom = useBoardStore(s => s.resetZoom);
  const saveLocalState = useBoardStore(s => s.saveLocalState);

  const isPanned = useMemo(() => {
    return canvasPosition.x !== 0 || canvasPosition.y !== 0;
  }, [canvasPosition]);

  const isZoomed = useMemo(() => {
    return canvasZoom !== 1;
  }, [canvasZoom]);

  const canUndo = false;
  const canRedo = false;

  const handleResetPanning = () => {
    resetPanning();
    saveLocalState();
  };

  const handleResetZoom = () => {
    resetZoom();
    saveLocalState();
  };

  const handleUndo = () => {};

  const handleRedo = () => {};

  return (
    <div className={styles.wrapper}>
      <button disabled={!isPanned} onClick={handleResetPanning}>
        <IconArrowsMove size={18} stroke={1.5} />
      </button>
      <button disabled={!isZoomed} onClick={handleResetZoom}>
        <IconZoomReset size={18} stroke={1.5} />
      </button>
      <button disabled={!canUndo} onClick={handleUndo}>
        <IconArrowBackUp size={18} stroke={1.5} />
      </button>
      <button disabled={!canRedo} onClick={handleRedo}>
        <IconArrowForwardUp size={18} stroke={1.5} />
      </button>
    </div>
  );
}
