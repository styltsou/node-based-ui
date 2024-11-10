import type { PopoverPosition } from './types';

export function getPopoverPosition(
  triggerRef: React.RefObject<HTMLElement>,
  position: PopoverPosition = 'bottom',
  offset: number = 10
) {
  if (!triggerRef.current) return { x: 0, y: 0 };

  const triggerRect = triggerRef.current.getBoundingClientRect();

  const positions = {
    top: {
      x: -triggerRect.width,
      y: -triggerRect.height - offset,
    },
    bottom: {
      x: -triggerRect.width,
      y: offset,
    },
    left: {
      x: -triggerRect.width - offset,
      y: -triggerRect.height,
    },
    right: {
      x: triggerRect.width + offset,
      y: -triggerRect.height,
    },
  };

  return positions[position];
}
