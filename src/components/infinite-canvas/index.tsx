import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './styles.module.scss';

import { Point } from '../../types';
import Node from '../node';
import Edge from '../edge';
import ConnectionLine from '../connection-line';
import Background from '../background';
import AlignmentGuides from '../alignment-guides';
import SelectionBox from '../selection-box';
import CanvasContextMenu from '../canvas-context-menu';

import useBoardStore from '../../store';
import useEdgeVisualizationStore from '../../store/edgeVisualizationStore';

import { useKeybindings } from '../../hooks/use-keybindings';
import { useCustomZoom } from '../../hooks/use-custom-zoom';
import { keyboardKeys } from '../../constants';
import cn from '../../utils/cn';
import getVisibleNodes from '../../utils/get-visible-nodes';
import getVisibleEdges from '../../utils/get-visible-edges';

import EdgeRoutingRenderer from '../edge-routing-visualization/renderer';

export default function InfiniteCanvas() {
  const canvasPosition = useBoardStore(s => s.position);
  const updateCanvasPosition = useBoardStore(s => s.updatePosition);
  const canvasZoom = useBoardStore(s => s.zoom);
  const updateZoom = useBoardStore(s => s.updateZoom);
  const nodes = useBoardStore(s => s.nodes);
  const renderedNodes = useBoardStore(s => s.renderedNodes);
  const setRenderedNodes = useBoardStore(s => s.setRenderedNodes);
  const edges = useBoardStore(s => s.edges);
  const renderedEdges = useBoardStore(s => s.renderedEdges);
  const setRenderedEdges = useBoardStore(s => s.setRenderedEdges);
  // const isCanvasInteractive = useBoardStore(s => s.isInteractive);
  const saveLocalState = useBoardStore(s => s.saveLocalState);

  const visualizedEdgeId = useEdgeVisualizationStore(s => s.selectedEdgeId);

  const [isGrabCursor, setIsGrabCursor] = useState<boolean>(false);
  const [isPointerDown, setIsPointerDown] = useState<boolean>(false);

  const panStartPointerPosition = useRef<Point>({
    x: 0,
    y: 0,
  });

  const isPanning = useMemo<boolean>(
    () => (isGrabCursor && isPointerDown ? true : false),
    [isGrabCursor, isPointerDown]
  );

  const handlePanCanvasStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Ensure its a left click
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).id === 'canvas'
    ) {
      // TODO: Need to test this condition
      // if (
      //   (!isCanvasInteractive &&
      //     (e.target as HTMLElement).id.startsWith('node')) ||
      //   !(e.target as HTMLElement).id.startsWith('node')
      // )
      setIsPointerDown(true);
      panStartPointerPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    // if (!hasPanned.current) hasPanned.current = true;

    const dx = e.clientX - panStartPointerPosition.current.x;
    const dy = e.clientY - panStartPointerPosition.current.y;

    updateCanvasPosition({
      x: canvasPosition.x + dx,
      y: canvasPosition.y + dy,
    });

    panStartPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanCanvasEnd = () => {
    setIsPointerDown(false);
    //! With the current implementaion the save is triggered even when a user just clicks without dragging
    saveLocalState();
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

  // TODO: Fix that, doesn't work shit
  useCustomZoom(e => {
    const newZoom = canvasZoom + 0.03 * (e.deltaY > 0 ? -1 : 1);
    updateZoom(Math.max(0.1, Math.min(newZoom, 5)));
  });

  const canvasTransform = useMemo(
    () =>
      `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasZoom})`,
    [canvasPosition.x, canvasPosition.y, canvasZoom]
  );

  useEffect(() => {
    const nodesInViewport = getVisibleNodes(nodes, canvasPosition);
    const edgesInViewport = getVisibleEdges(edges, nodes, canvasPosition);

    setRenderedNodes(nodesInViewport);
    setRenderedEdges(edgesInViewport);
    //TODO: calculate new nodes that should be rendered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, canvasPosition, canvasZoom]);

  return (
    <CanvasContextMenu>
      <main
        className={cn(
          styles.canvasWrapper,
          isGrabCursor && styles.grab,
          isPanning && styles.panning
        )}
        onMouseDown={handlePanCanvasStart}
        onMouseMove={handlePanCanvas}
        onMouseUp={handlePanCanvasEnd}
      >
        <Background
          type="dots"
          canvasPosition={canvasPosition}
          canvasZoom={canvasZoom}
        />
        <div
          id="canvas"
          className={styles.canvas}
          style={{ transform: canvasTransform }}
        >
          {visualizedEdgeId ? (
            <EdgeRoutingRenderer />
          ) : (
            <>
              {renderedNodes?.map(node => (
                <Node key={node.id} node={node} />
              ))}

              {renderedEdges?.map(edge => (
                <Edge key={edge.id} edge={edge} />
              ))}
              <ConnectionLine />
              <AlignmentGuides />
              <SelectionBox />
            </>
          )}
        </div>
      </main>
    </CanvasContextMenu>
  );
}
