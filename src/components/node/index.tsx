import { useState } from 'react';
import type { Node } from '../../types';
import cn from '../../utils/cn';
import styles from './styles.module.scss';
import { useMouseInfo } from '@faceless-ui/mouse-info';
import useBoardStore from '../../store';

export default function Node({
  node,
  nodeIdx,
}: {
  node: Node;
  nodeIdx: number;
}) {
  const { x: mouseX, y: mouseY } = useMouseInfo();
  const isCanvasInteractive = useBoardStore(s => s.isInteractive);
  const updateNodePosition = useBoardStore(s => s.updateNodePosition);

  // const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // const handleFocus = () => {
  //   if (!isFocused) setIsFocused(true);
  // };

  // const handleBlur = () => {
  //   setIsFocused(false);
  // };

  const handleDragStart = () => {
    if (!isCanvasInteractive) return;
    setIsDragging(true);

    setMouseOffset({
      x: mouseX - node.position.x,
      y: mouseY - node.position.y,
    });
  };

  const handleDrag = () => {
    if (!isCanvasInteractive) return;
  };

  const handleDragEnd = () => {
    if (!isCanvasInteractive) return;

    updateNodePosition(node.id, {
      x: mouseX - mouseOffset.x,
      y: mouseY - mouseOffset.y,
    });

    setIsDragging(false);
    setMouseOffset({ x: 0, y: 0 });
  };

  const handleContextMenuClick = (e: React.SyntheticEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const nodeTranslate = isDragging
    ? `translate(${mouseX - mouseOffset.x}px, ${mouseY - mouseOffset.y}px)`
    : `translate(${node.position.x}px, ${node.position.y}px)`;

  return (
    <div
      className={styles.node}
      style={{ transform: nodeTranslate }}
      // onFocus={handleFocus}
      // onBlur={handleBlur}
      onMouseDown={handleDragStart}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      tabIndex={
        nodeIdx + 100
      } /* add 100 to avoid conflict with other  (non-node) lements */
      onContextMenu={handleContextMenuClick}
    >
      <div className={styles.handle}></div>
      <div className={styles.content}>Test Node</div>
      <div className={cn(styles.handle, styles.right)}></div>
    </div>
  );
}
