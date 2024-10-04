import { useRef, useState, useEffect } from 'react';
import type { Node } from '../../types';
import cn from '../../utils/cn';
import styles from './styles.module.scss';
import { useMouseInfo } from '@faceless-ui/mouse-info';
import useBoardStore from '../../store';
import AlignmentGuide from '../alignment-guide';

export default function Node({ node }: { node: Node }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { x: mouseX, y: mouseY } = useMouseInfo();

  const nodes = useBoardStore(s => s.nodes);
  const isCanvasInteractive = useBoardStore(s => s.isInteractive);
  const updateNodeSize = useBoardStore(s => s.updateNodeSize);
  const updateNodePosition = useBoardStore(s => s.updateNodePosition);

  // const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const [alignmentGuide, setAlignmentGuide] = useState<{
    position: number;
    orientation: 'vertical' | 'horizontal';
  } | null>(null);

  // const handleFocus = () => {
  //   if (!isFocused) setIsFocused(true);
  // };

  // const handleBlur = () => {
  //   setIsFocused(false);
  // };

  const handleDragStart = () => {
    if (!isCanvasInteractive) return;
    setIsDragging(true);

    console.log('drag start');

    setMouseOffset({
      x: mouseX - node.position.x,
      y: mouseY - node.position.y,
    });
  };

  const handleDrag = () => {
    if (!isCanvasInteractive || !isDragging) return;

    // TODO: Implement the alignment guides logic (fairly complex to pull of nicely)
    // Detect vertical alignment guides
    const verticalAlignedNode = nodes.find(node => node.position.x === mouseX);

    console.log('vertical aligned node', verticalAlignedNode);

    if (verticalAlignedNode) {
      setAlignmentGuide({
        position: verticalAlignedNode.position.x,
        orientation: 'vertical',
      });
    } else if (alignmentGuide) setAlignmentGuide(null);
  };

  const handleDragEnd = () => {
    if (!isCanvasInteractive) return;

    console.log('drag end');

    if (alignmentGuide) setAlignmentGuide(null);

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
  };

  // Calculate and update node size
  useEffect(() => {
    console.log('node size effect run');
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
      {alignmentGuide && (
        <AlignmentGuide
          position={alignmentGuide.position}
          orientation={alignmentGuide.orientation}
        />
      )}
    </>
  );
}
