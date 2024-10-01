import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import useBoardStore from '../../store';
import Node from '../node';
import { useKeybindings } from '../../hooks/use-keybindings';
import { keyboardKeys } from '../../constants';
import cn from '../../utils/cn';
import { useMouseInfo } from '@faceless-ui/mouse-info';
import { useCustomZoom } from '../../hooks/use-custom-zoom';

export default function InfiniteCanvas() {
  const canvasPosition = useBoardStore(s => s.canvasPosition);
  const updateCanvasPosition = useBoardStore(s => s.updateCanvasPosition);
  const canvasZoom = useBoardStore(s => s.canvasZoom);
  const updateCanvasZoom = useBoardStore(s => s.updateCanvasZoom);
  const nodes = useBoardStore(s => s.nodes);

  const { x: mouseX, y: mouseY } = useMouseInfo();

  const hasDragged = useRef(false);

  const [isGrabCursor, setIsGrabCursor] = useState<boolean>(false);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);

  const [zoom, setZoom] = useState(1);

  const isDragging = useMemo<boolean>(
    () => (isGrabCursor && isPointerDown ? true : false),
    [isGrabCursor, isPointerDown]
  );

  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setIsPointerDown(true);
  };

  const handlePointerUp = () => {
    setIsPointerDown(false);
  };

  useKeybindings([
    {
      cmd: [keyboardKeys.Space],
      callback: () => {
        setIsGrabCursor(true);
      },
      cleanup: () => {
        setIsGrabCursor(false);
      },
    },
  ]);

  useCustomZoom(e => {
    const newZoom = canvasZoom + 0.03 * (e.deltaY / 120);
    setZoom(newZoom);
    console.log('new zoom', newZoom);
    updateCanvasZoom(newZoom);
  });

  // Detect canvas drangEnd to update canvas position
  useEffect(() => {
    if (isDragging) {
      setDragStartPosition({ x: mouseX, y: mouseY });
      hasDragged.current = true;
    }

    if (!isDragging && hasDragged.current) {
      updateCanvasPosition({
        x: canvasPosition.x - dragStartPosition.x + mouseX,
        y: canvasPosition.y - dragStartPosition.y + mouseY,
      });

      setDragStartPosition({ x: 0, y: 0 });
      hasDragged.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  return (
    <div
      id="canvas"
      className={cn(
        styles.canvas,
        isGrabCursor && styles.grab,
        isDragging && styles.dragging
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        transform: isDragging
          ? `translate(${canvasPosition.x - dragStartPosition.x + mouseX}px, ${
              canvasPosition.y - dragStartPosition.y + mouseY
            }px) scale(${zoom})`
          : `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${zoom})`,
      }}
    >
      {nodes.map((node, idx) => (
        <Node key={node.id} node={node} nodeIdx={idx} />
      ))}
    </div>
  );
}
