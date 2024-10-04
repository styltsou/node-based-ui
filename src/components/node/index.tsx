import { useRef, useState, useEffect } from 'react';
import { useMouseInfo } from '@faceless-ui/mouse-info';
import { v4 as uuidv4 } from 'uuid';
import type { Node } from '../../types';
import cn from '../../utils/cn';
import styles from './styles.module.scss';
import useBoardStore from '../../store';
import AlignmentGuide from '../alignment-guide';
import { NODE_ALIGNMENT_THRESHOLD } from '../../constants';

export default function Node({ node }: { node: Node }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { x: mouseX, y: mouseY } = useMouseInfo();

  const nodes = useBoardStore(s => s.nodes);
  const isCanvasInteractive = useBoardStore(s => s.isInteractive);
  const updateNodeSize = useBoardStore(s => s.updateNodeSize);
  const updateNodePosition = useBoardStore(s => s.updateNodePosition);
  const areVerticalGuidesActive = useBoardStore(s => s.areVerticalGuidesActive);
  const areHorizontalGuidesActive = useBoardStore(
    s => s.areHorizontalGuidesActive
  );

  const [isDragging, setIsDragging] = useState(false);

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const [alignmentGuides, setAlignmentGuides] = useState<
    {
      position: number;
      orientation: 'vertical' | 'horizontal';
    }[]
  >([]);

  const handleDragStart = () => {
    if (!isCanvasInteractive) return;
    setIsDragging(true);

    setMouseOffset({
      x: mouseX - node.position.x,
      y: mouseY - node.position.y,
    });
  };

  const handleDrag = () => {
    if (!isCanvasInteractive || !isDragging) return;

    // Find the coordinates of the draged node's corners
    const draggedNodeLeft = mouseX - mouseOffset.x;
    const draggedNodeRight = draggedNodeLeft + node.size.width;
    const draggedNodeTop = mouseY - mouseOffset.y;
    const draggedNodeBottom = draggedNodeTop + node.size.height;

    const newAlignmentGuides: {
      position: number;
      orientation: 'vertical' | 'horizontal';
    }[] = [];

    nodes.forEach(otherNode => {
      // Ignore the currently dragged node
      if (otherNode.id === node.id) return;

      const otherNodeLeft = otherNode.position.x;
      const otherNodeRight = otherNodeLeft + otherNode.size.width;
      const otherNodeTop = otherNode.position.y;
      const otherNodeBottom = otherNodeTop + otherNode.size.height;

      // Vertical alignments
      if (areVerticalGuidesActive) {
        if (
          Math.abs(draggedNodeLeft - otherNodeLeft) < NODE_ALIGNMENT_THRESHOLD
        ) {
          newAlignmentGuides.push({
            position: otherNodeLeft,
            orientation: 'vertical',
          });
        }

        if (
          Math.abs(draggedNodeLeft - otherNodeRight) < NODE_ALIGNMENT_THRESHOLD
        ) {
          newAlignmentGuides.push({
            position: otherNodeRight,
            orientation: 'vertical',
          });
        }

        if (
          Math.abs(draggedNodeRight - otherNodeRight) < NODE_ALIGNMENT_THRESHOLD
        ) {
          newAlignmentGuides.push({
            position: otherNodeRight,
            orientation: 'vertical',
          });
        }

        if (
          Math.abs(draggedNodeRight - otherNodeLeft) < NODE_ALIGNMENT_THRESHOLD
        ) {
          newAlignmentGuides.push({
            position: otherNodeLeft,
            orientation: 'vertical',
          });
        }
      }

      // Horizontal alignments
      if (areHorizontalGuidesActive) {
        if (
          Math.abs(draggedNodeTop - otherNodeTop) < NODE_ALIGNMENT_THRESHOLD
        ) {
          newAlignmentGuides.push({
            position: otherNodeTop,
            orientation: 'horizontal',
          });
        }

        if (
          Math.abs(draggedNodeTop - otherNodeBottom) < NODE_ALIGNMENT_THRESHOLD
        ) {
          newAlignmentGuides.push({
            position: otherNodeBottom,
            orientation: 'horizontal',
          });
        }

        if (
          Math.abs(draggedNodeBottom - otherNodeTop) < NODE_ALIGNMENT_THRESHOLD
        ) {
          newAlignmentGuides.push({
            position: otherNodeTop,
            orientation: 'horizontal',
          });
        }

        if (
          Math.abs(draggedNodeBottom - otherNodeBottom) <
          NODE_ALIGNMENT_THRESHOLD
        ) {
          newAlignmentGuides.push({
            position: otherNodeBottom,
            orientation: 'horizontal',
          });
        }
      }
    });

    setAlignmentGuides(newAlignmentGuides);
  };

  const handleDragEnd = () => {
    if (!isCanvasInteractive) return;

    if (alignmentGuides.length !== 0) setAlignmentGuides([]);

    updateNodePosition(node.id, {
      x: mouseX - mouseOffset.x,
      y: mouseY - mouseOffset.y,
    });

    setIsDragging(false);
    setMouseOffset({ x: 0, y: 0 });
  };

  // TODO: Implement context menu (for starters to delete a node)
  const handleContextMenuClick = (e: React.SyntheticEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Calculate and update node size
  useEffect(() => {
    if (nodeRef.current) {
      const { width, height } = nodeRef.current.getBoundingClientRect();
      updateNodeSize(node.id, {
        width: Math.round(width),
        height: Math.round(height),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodeTranslate = isDragging
    ? `translate(${mouseX - mouseOffset.x}px, ${mouseY - mouseOffset.y}px)`
    : `translate(${node.position.x}px, ${node.position.y}px)`;

  return (
    <>
      <div
        id={`node-${node.id}`}
        ref={nodeRef}
        className={styles.node}
        style={{ transform: nodeTranslate }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onContextMenu={handleContextMenuClick}
      >
        <div className={styles.handle}></div>
        <div className={styles.content}>Test Node</div>
        <div className={cn(styles.handle, styles.right)}></div>
      </div>
      {alignmentGuides?.length !== 0 &&
        alignmentGuides.map(guide => (
          <AlignmentGuide
            key={uuidv4()}
            position={guide.position}
            orientation={guide.orientation}
          />
        ))}
    </>
  );
}
