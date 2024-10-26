import {
  IconLock,
  IconLockOpen,
  IconMaximize,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import styles from './styles.module.scss';
import useBoardStore from '../../store';
import cn from '../../utils/cn';
import { MIN_ZOOM, MAX_ZOOM } from '../../constants';

export default function ViewControls() {
  const nodes = useBoardStore(s => s.nodes);
  const zoom = useBoardStore(s => s.zoom);
  const updateZoom = useBoardStore(s => s.updateZoom);
  const updatePanning = useBoardStore(s => s.updatePosition);
  const zoomIn = useBoardStore(s => s.zoomIn);
  const zoomOut = useBoardStore(s => s.zoomOut);
  const isInteractive = useBoardStore(s => s.isInteractive);
  const toggleInteractivity = useBoardStore(s => s.toggleInteractivity);
  const saveLocalState = useBoardStore(s => s.saveLocalState);

  const handleToggleInteractivity = () => {
    toggleInteractivity();
    saveLocalState();
  };

  const handleZoomIn = () => {
    zoomIn();
    saveLocalState();
  };

  const handleZoomOut = () => {
    zoomOut();
    saveLocalState();
  };

  const handleFitInView = () => {
    if (nodes.length === 0) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 2. Find the size of the nodes' bounding box.
    const boundingBox: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    } = nodes.reduce(
      (box, node) => {
        box.top = Math.min(box.top, node.position.y);
        box.right = Math.max(box.right, node.position.x);
        box.left = Math.min(box.left, node.position.x);
        box.bottom = Math.max(box.bottom, node.position.y);

        return box;
      },
      {
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
        left: Infinity,
      }
    );

    // Get the size of the rightmost and the lowest node
    const rightmostNode = nodes.find(
      node => node.position.x === boundingBox.right
    );
    const lowestNode = nodes.find(
      node => node.position.y === boundingBox.bottom
    );

    const boundingBoxWidth =
      boundingBox.right - boundingBox.left + (rightmostNode?.size.width || 0);
    const boundingBoxHeight =
      boundingBox.bottom - boundingBox.top + (lowestNode?.size.height || 0);

    // Calculate the new zoom level
    const zoomX = viewportWidth / boundingBoxWidth;
    const zoomY = viewportHeight / boundingBoxHeight;
    const newZoom = Math.min(Math.min(zoomX, zoomY), 1);

    // Calculate the new canvas position
    const newX = viewportWidth / 2 - (boundingBox.left + boundingBoxWidth / 2);
    const newY = viewportHeight / 2 - (boundingBox.top + boundingBoxHeight / 2);

    updateZoom(newZoom);
    updatePanning({ x: newX, y: newY });
    saveLocalState();
  };

  // ! Keep  the zoom disabled for now, until I compenstate for that when dragging and connecting nodes

  return (
    <div className={styles.wrapper}>
      <button onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM || true}>
        <IconPlus size={18} stroke={1.5} />
      </button>
      <button onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM || true}>
        <IconMinus size={18} stroke={1.5} />
      </button>
      <button className={styles.iconButton} onClick={handleFitInView}>
        <IconMaximize size={18} stroke={1.5} />
      </button>
      <button
        onClick={handleToggleInteractivity}
        className={cn(!isInteractive && styles.highlight)}
      >
        {isInteractive ? (
          <IconLockOpen size={18} stroke={1.5} />
        ) : (
          <IconLock size={18} stroke={1.5} />
        )}
      </button>
    </div>
  );
}
