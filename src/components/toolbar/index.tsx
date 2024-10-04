import { v4 as uuidv4 } from 'uuid';
import styles from './styles.module.scss';
import useBoardStore from '../../store';
import type { Node } from '../../types';

export default function Toolbar() {
  const addNodeState = useBoardStore(s => s.addNode);
  const resetPanning = useBoardStore(s => s.resetPanning);
  const resetZoom = useBoardStore(s => s.resetZoom);

  const resetCanvasPosition = () => {
    resetPanning();
  };

  // Just a sample
  const addNode = () => {
    console.log('add node clicked');
    const newNode: Node = {
      id: uuidv4(),
      type: 'simple',
      position: { x: 500, y: 600 },
      size: { width: 0, height: 0 },
    };

    addNodeState(newNode);
  };

  return (
    <div className={styles.toolbarWrapper}>
      <div className={styles.toolbar}>
        <button onClick={addNode}>+</button>
        <button onClick={resetCanvasPosition}>reset pan</button>
        <button onClick={resetZoom}>reset zoom</button>
      </div>
    </div>
  );
}
