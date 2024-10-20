import { Node, AlignmentGuide } from '../../types';
import { NODE_ALIGNMENT_THRESHOLD } from '../../constants';

interface AlignmentGuidesOptions {
  areVerticalGuidesActive: boolean;
  areHorizontalGuidesActive: boolean;
}

export default function getAlignmentGuides(
  draggedNode: Node,
  nodes: Node[],
  options: AlignmentGuidesOptions
): AlignmentGuide[] {
  const { areVerticalGuidesActive, areHorizontalGuidesActive } = options;
  const draggedNodeTop = draggedNode.position.y;
  const draggedNodeLeft = draggedNode.position.x;
  const draggedNodeRight = draggedNodeLeft + draggedNode.size.width;
  const draggedNodeBottom = draggedNodeTop + draggedNode.size.height;

  const newAlignmentGuides: AlignmentGuide[] = [];

  nodes.forEach(otherNode => {
    // Ignore the currently dragged node
    if (otherNode.id === draggedNode.id) return;

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
      if (Math.abs(draggedNodeTop - otherNodeTop) < NODE_ALIGNMENT_THRESHOLD) {
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
        Math.abs(draggedNodeBottom - otherNodeBottom) < NODE_ALIGNMENT_THRESHOLD
      ) {
        newAlignmentGuides.push({
          position: otherNodeBottom,
          orientation: 'horizontal',
        });
      }
    }
  });

  return newAlignmentGuides;
}
