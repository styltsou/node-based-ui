import styles from './styles.module.scss';
import useBoardStore from '../../store';
import type { Node } from '../../types';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
      id: `${getRandomInt(0, 2000)}`,
      type: 'simple',
      position: { x: 500, y: 600 },
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
