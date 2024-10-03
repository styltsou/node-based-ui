import { useState, useMemo, useEffect, useRef } from 'react';
import { useMouseInfo } from '@faceless-ui/mouse-info';
import styles from './styles.module.scss';

import Node from '../node';
import Edge from '../edge';

import useBoardStore from '../../store';
import { useKeybindings } from '../../hooks/use-keybindings';
import { keyboardKeys } from '../../constants';

import { useCustomZoom } from '../../hooks/use-custom-zoom';
import cn from '../../utils/cn';

export default function InfiniteCanvas() {
  const canvasPosition = useBoardStore(s => s.position);
  const updateCanvasPosition = useBoardStore(s => s.updatePosition);
  const canvasZoom = useBoardStore(s => s.zoom);
  const updateZoom = useBoardStore(s => s.updateZoom);
  const nodes = useBoardStore(s => s.nodes);
  const edges = useBoardStore(s => s.edges);

  const { x: mouseX, y: mouseY } = useMouseInfo();

  const hasPanned = useRef(false);

  const [isGrabCursor, setIsGrabCursor] = useState<boolean>(false);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
  const [panStartPointerPosition, setPanStartPointerPosition] = useState({
    x: 0,
    y: 0,
  });

  // const [zoom, setZoom] = useState(1);

  const isPanning = useMemo<boolean>(
    () => (isGrabCursor && isPointerDown ? true : false),
    [isGrabCursor, isPointerDown]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).id === 'canvas'
    )
      setIsPointerDown(true);
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
    const newZoom = canvasZoom + 0.03 * (e.deltaY > 0 ? -1 : 1);
    updateZoom(Math.max(0.1, Math.min(newZoom, 5)));
  });

  const canvasPanningTranslate = useMemo(
    () =>
      isPanning
        ? `translate(${
            canvasPosition.x - panStartPointerPosition.x + mouseX
          }px, ${
            canvasPosition.y - panStartPointerPosition.y + mouseY
          }px) scale(${canvasZoom})`
        : `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasZoom})`,
    [
      isPanning,
      canvasPosition,
      canvasZoom,
      panStartPointerPosition,
      mouseX,
      mouseY,
    ]
  );

  //* Logic to detect drangEnd and update canvas position
  useEffect(() => {
    if (isPanning) {
      setPanStartPointerPosition({ x: mouseX, y: mouseY });
      hasPanned.current = true;
    }

    if (!isPanning && hasPanned.current) {
      updateCanvasPosition({
        x: canvasPosition.x - panStartPointerPosition.x + mouseX,
        y: canvasPosition.y - panStartPointerPosition.y + mouseY,
      });

      setPanStartPointerPosition({ x: 0, y: 0 });
      hasPanned.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanning]);

  return (
    <div
      className={cn(
        styles.canvasWrapper,
        isGrabCursor && styles.grab,
        isPanning && styles.dragging
      )}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div
        id="canvas"
        className={cn(
          styles.canvas,
          isGrabCursor && styles.grab,
          isPanning && styles.panning
        )}
        style={{ transform: canvasPanningTranslate }}
      >
        {nodes.map((node, idx) => (
          <Node key={node.id} node={node} nodeIdx={idx} />
        ))}
        {edges.map(edge => (
          <Edge edge={edge} />
        ))}
      </div>
    </div>
  );
}
