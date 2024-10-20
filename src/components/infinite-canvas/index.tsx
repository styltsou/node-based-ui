import { useState, useMemo, useEffect, useRef } from 'react';
import { useMouseInfo } from '@faceless-ui/mouse-info';
import styles from './styles.module.scss';

import Node from '../node';
import Edge from '../edge';
import CanvasContextMenu from '../canvas-context-menu';

import useBoardStore from '../../store';
import { useKeybindings } from '../../hooks/use-keybindings';
import { keyboardKeys } from '../../constants';

import { useCustomZoom } from '../../hooks/use-custom-zoom';
import cn from '../../utils/cn';
import SelectionBox from '../selection-box';

export default function InfiniteCanvas() {
  const canvasPosition = useBoardStore(s => s.position);
  const updateCanvasPosition = useBoardStore(s => s.updatePosition);
  const canvasZoom = useBoardStore(s => s.zoom);
  const updateZoom = useBoardStore(s => s.updateZoom);
  const nodes = useBoardStore(s => s.nodes);
  const edges = useBoardStore(s => s.edges);
  const isCanvasInteractive = useBoardStore(s => s.isInteractive);
  const saveLocalState = useBoardStore(s => s.saveLocalState);

  const { x: mouseX, y: mouseY } = useMouseInfo();

  const hasPanned = useRef(false);

  const [isGrabCursor, setIsGrabCursor] = useState<boolean>(false);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);
  const [panStartPointerPosition, setPanStartPointerPosition] = useState({
    x: 0,
    y: 0,
  });

  const isPanning = useMemo<boolean>(
    () => (isGrabCursor && isPointerDown ? true : false),
    [isGrabCursor, isPointerDown]
  );

  // const [isGroupouing, setIsGrouping] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // if (
    //   e.target === e.currentTarget ||
    //   (e.target as HTMLElement).id === 'canvas'
    // )
    // TODO: Need to test this condition (the goal is to allow panning by dragging anywhere on the canvas, even nodes, when the nodes are locked)
    // This is solves the problem of panning not triggering due to mouse down events getting captured by the edge containers
    if (
      (!isCanvasInteractive &&
        (e.target as HTMLElement).id.startsWith('node')) ||
      !(e.target as HTMLElement).id.startsWith('node')
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
      saveLocalState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanning]);

  return (
    <CanvasContextMenu>
      <main
        className={cn(
          styles.canvasWrapper,
          isGrabCursor && styles.grab,
          isPanning && styles.panning
        )}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div
          id="canvas"
          // TODO: See if I can get away with removing the pointer styles here
          className={styles.canvas}
          style={{ transform: canvasPanningTranslate }}
        >
          {nodes.map(node => (
            <Node key={node.id} node={node} />
          ))}

          {edges.map(edge => (
            <Edge key={edge.id} edge={edge} />
          ))}

          <SelectionBox />
        </div>
      </main>
    </CanvasContextMenu>
  );
}
