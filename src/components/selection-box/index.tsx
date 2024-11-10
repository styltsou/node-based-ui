import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import styles from './styles.module.scss';

import SelectionContextMenu from '../selection-context-menu';

import useBoardStore from '../../store';
import cn from '../../utils/cn';
import { useKeybindings } from '../../hooks/use-keybindings';
import { keyboardKeys } from '../../constants';

export default function SelectionBox() {
  const canvasPosition = useBoardStore(s => s.position);
  const nodes = useBoardStore(s => s.nodes);
  const selectedNodeIds = useBoardStore(s => s.selectedNodeIds);
  const setSelectedNodeIds = useBoardStore(s => s.setSelectedNodeIds);

  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuTriggerRef = useRef<HTMLDivElement>(null);
  const startPoint = useRef({ x: 0, y: 0 });

  const [isSelectionKeyPressed, setIsSelectionKeyPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectionCompleted, setSelectionCompleted] = useState(false);

  const [selectionBox, setSelectionBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const isSelecting = useMemo(
    () => isSelectionKeyPressed && isDragging,
    [isSelectionKeyPressed, isDragging]
  );

  const activeHandle = useRef<string | null>(null);
  const resizeStartPoint = useRef({ x: 0, y: 0 });
  const originalBox = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const [isResizing, setIsResizing] = useState(false);

  const getRelativeCoordinates = useCallback(
    (event: MouseEvent) => {
      if (!containerRef.current) return { x: 0, y: 0 };

      const bounds = containerRef.current.getBoundingClientRect();
      return {
        x: event.clientX - bounds.left - canvasPosition.x,
        y: event.clientY - bounds.top - canvasPosition.y,
      };
    },
    [canvasPosition]
  );

  const clearSelection = () => {
    setIsDragging(false);
    setSelectionCompleted(false);
    setSelectionBox({ x: 0, y: 0, width: 0, height: 0 });
    setSelectedNodeIds([]);
  };

  const handleSelectionStart = useCallback(
    (event: MouseEvent) => {
      if (event.button !== 0 || !isSelectionKeyPressed) return;

      const coords = getRelativeCoordinates(event);
      startPoint.current = coords;

      setSelectionBox({
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
      });

      setIsDragging(true);
    },
    [getRelativeCoordinates, isSelectionKeyPressed]
  );

  const handleSelection = useCallback(
    (event: MouseEvent) => {
      if (!isSelecting) return;

      const coords = getRelativeCoordinates(event);

      const width = coords.x - startPoint.current.x;
      const height = coords.y - startPoint.current.y;

      // Handle negative dimensions (drawing from right to left or bottom to top)
      setSelectionBox({
        x: width < 0 ? coords.x : startPoint.current.x,
        y: height < 0 ? coords.y : startPoint.current.y,
        width: Math.abs(width),
        height: Math.abs(height),
      });
    },
    [isSelecting, getRelativeCoordinates]
  );

  const handleSelectionEnd = useCallback(() => {
    if (!isSelecting) return;

    if (selectedNodeIds.length === 0) clearSelection();
    else {
      setIsDragging(false);
      setSelectionCompleted(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelecting, selectedNodeIds]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setIsResizing(true);
      activeHandle.current = e.currentTarget.id;
      resizeStartPoint.current = {
        x: e.clientX,
        y: e.clientY,
      };
      originalBox.current = { ...selectionBox };
    },
    [selectionBox]
  );

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !activeHandle.current) return;

      const dx = e.clientX - resizeStartPoint.current.x;
      const dy = e.clientY - resizeStartPoint.current.y;
      const original = originalBox.current;

      let newBox = { ...original };

      switch (activeHandle.current) {
        case 'selection-handle-top-left':
          newBox = {
            x: original.x + dx,
            y: original.y + dy,
            width: original.width - dx,
            height: original.height - dy,
          };
          break;
        case 'selection-handle-top-right':
          newBox = {
            x: original.x,
            y: original.y + dy,
            width: original.width + dx,
            height: original.height - dy,
          };
          break;
        case 'selection-handle-bottom-left':
          newBox = {
            x: original.x + dx,
            y: original.y,
            width: original.width - dx,
            height: original.height + dy,
          };
          break;
        case 'selection-handle-bottom-right':
          newBox = {
            x: original.x,
            y: original.y,
            width: original.width + dx,
            height: original.height + dy,
          };
          break;
      }

      // Ensure minimum size and flip if necessary
      if (newBox.width < 0) {
        newBox.x = newBox.x + newBox.width;
        newBox.width = Math.abs(newBox.width);
      }
      if (newBox.height < 0) {
        newBox.y = newBox.y + newBox.height;
        newBox.height = Math.abs(newBox.height);
      }

      // Set minimum size
      newBox.width = Math.max(newBox.width, 10);
      newBox.height = Math.max(newBox.height, 10);

      setSelectionBox(newBox);
    },
    [isResizing]
  );

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;
    setIsResizing(false);
    activeHandle.current = null;

    if (selectedNodeIds.length === 0) clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing, selectedNodeIds]);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        selectionBox.width > 0 &&
        selectionBox.height > 0 &&
        selectionCompleted
      ) {
        if (
          e.button === 0 &&
          (e.target as HTMLElement).id === 'selection-box-wrapper'
        )
          clearSelection();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectionBox, selectionCompleted]
  );

  const handleCanvasContextMenuOverride = (e: React.MouseEvent) => {
    if (selectionBox.width > 0 && selectionBox.height > 0) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  useKeybindings([
    {
      cmd: [keyboardKeys.Control],
      callback: () => {
        setIsSelectionKeyPressed(true);
      },
      cleanup: () => {
        setIsSelectionKeyPressed(false);
      },
    },
    {
      cmd: [keyboardKeys.Escape],
      callback: () => {
        clearSelection();
      },
    },
  ]);

  // * Selection resize event listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);

      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

  // Add and remove window event listeners
  useEffect(() => {
    window.addEventListener('mousedown', handleSelectionStart);
    window.addEventListener('mousemove', handleSelection);
    window.addEventListener('mouseup', handleSelectionEnd);
    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleSelectionStart);
      window.removeEventListener('mousemove', handleSelection);
      window.removeEventListener('mouseup', handleSelectionEnd);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [
    handleSelectionStart,
    handleSelection,
    handleSelectionEnd,
    handleClickOutside,
  ]);

  // * Find selected nodes
  // TODO: Can be improved by using an RTree for spatial search
  useEffect(() => {
    if (selectionBox.width === 0 && selectionBox.height === 0) return;

    const selectedNodeIds = nodes
      .filter(
        node =>
          selectionBox.x <= node.position.x &&
          node.position.x + node.size.width <=
            selectionBox.x + selectionBox.width &&
          selectionBox.y <= node.position.y &&
          node.position.y + node.size.height <=
            selectionBox.y + selectionBox.height
      )
      .map(node => node.id);

    setSelectedNodeIds(selectedNodeIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionBox]);

  return (
    <div
      ref={containerRef}
      className={cn(
        styles.wrapper,
        isSelectionKeyPressed && styles.cursorCrosshair,
        selectionCompleted && styles.cursorDefault
      )}
      onContextMenu={handleCanvasContextMenuOverride}
    >
      {selectionBox.width > 0 && selectionBox.height > 0 && (
        <>
          <svg className={styles.svg} id="selection-box-wrapper">
            <rect
              id="selection-box-rect"
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              style={{
                transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)`,
              }}
            />
          </svg>
          {selectionCompleted && (
            <SelectionContextMenu
              triggerRef={contextMenuTriggerRef}
              onClose={clearSelection}
            >
              <div
                ref={contextMenuTriggerRef}
                className={styles.handlesContainer}
                style={{
                  transform: `translate(${
                    selectionBox.x + canvasPosition.x
                  }px, ${selectionBox.y + canvasPosition.y}px)`,
                  width: selectionBox.width,
                  height: selectionBox.height,
                }}
              >
                <div
                  id="selection-handle-top-left"
                  className={cn(styles.handle, styles.topLeft)}
                  onMouseDown={handleResizeStart}
                />
                <div
                  id="selection-handle-top-right"
                  className={cn(styles.handle, styles.topRight)}
                  onMouseDown={handleResizeStart}
                />
                <div
                  id="selection-handle-bottom-left"
                  className={cn(styles.handle, styles.bottomLeft)}
                  onMouseDown={handleResizeStart}
                />
                <div
                  id="selection-handle-bottom-right"
                  className={cn(styles.handle, styles.bottomRight)}
                  onMouseDown={handleResizeStart}
                />
              </div>
            </SelectionContextMenu>
          )}
        </>
      )}
    </div>
  );
}
