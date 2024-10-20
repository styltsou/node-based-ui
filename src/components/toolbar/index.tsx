import styles from './styles.module.scss';
import useBoardStore from '../../store';

export default function Toolbar() {
  const resetPanning = useBoardStore(s => s.resetPanning);
  const resetZoom = useBoardStore(s => s.resetZoom);
  const saveLocalState = useBoardStore(s => s.saveLocalState);

  const handleResetCanvasPosition = () => {
    resetPanning();
    saveLocalState();
  };

  const handleResetZoom = () => {
    resetZoom();
    saveLocalState();
  };

  return (
    <div className={styles.toolbarWrapper}>
      <div className={styles.toolbar}>
        <button onClick={handleResetCanvasPosition}>reset pan</button>
        <button onClick={handleResetZoom}>reset zoom</button>
      </div>
    </div>
  );
}
