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

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const updateNodePosition = useBoardStore(s => s.updateNodePosition);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleFocus = () => {
    if (!isFocused) setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleMouseDown = () => {
    setIsDragging(true);

    setMouseOffset({
      x: mouseX - node.position.x,
      y: mouseY - node.position.y,
    });
  };

  const handleMouseUp = () => {
    updateNodePosition(node.id, {
      x: mouseX - mouseOffset.x,
      y: mouseY - mouseOffset.y,
    });

    setIsDragging(false);
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className={cn(
        styles.node,
        isHovered && styles.hovered,
        isFocused && styles.focused
      )}
      style={{
        transform: isDragging
          ? `translate(${mouseX - mouseOffset.x}px, ${
              mouseY - mouseOffset.y
            }px)`
          : `translate(${node.position.x}px, ${node.position.y}px)`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      tabIndex={
        nodeIdx + 100
      } /* add 100 to avoid conflict with other  (non-node)e lements */
    >
      <div className={styles.anchor}></div>
      <div className={styles.content}>Test Node</div>
      <div className={cn(styles.anchor, styles.right)}></div>
    </div>
  );
}
