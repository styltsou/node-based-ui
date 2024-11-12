import type { PopoverPosition } from './types';

export function getPopoverPosition(
  triggerRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLDivElement>,
  position: PopoverPosition = 'bottom',
  offset: number = 10
) {
  if (!triggerRef.current || !contentRef.current) return { x: 0, y: 0 };

  const contentRect = contentRef.current.getBoundingClientRect();

  const triggerRect = triggerRef.current.getBoundingClientRect();
  console.log('trigger rect', triggerRect);

  const positions = {
    top: {
      x: triggerRect.x - contentRect.width / 2 + triggerRect.width / 2,
      y: triggerRect.y - contentRect.height - offset,
    },
    bottom: {
      x: triggerRect.x - contentRect.width / 2 + triggerRect.width / 2,
      y: triggerRect.y + triggerRect.height + offset,
    },
    left: {
      x: triggerRect.x - contentRect.width - offset,
      y: triggerRect.y - contentRect.height / 2 + triggerRect.height / 2,
    },
    right: {
      x: triggerRect.x + triggerRect.width + offset,
      y: triggerRect.y - contentRect.height / 2 + triggerRect.height / 2,
    },
  };

  return positions[position];
}
