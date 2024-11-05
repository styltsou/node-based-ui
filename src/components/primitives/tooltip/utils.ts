import { TooltipPosition } from './types';

export const getOppositePosition = (pos: TooltipPosition): TooltipPosition => {
  const [basePos, alignment] = pos.split('-');

  const opposites = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };

  const oppositeBase = opposites[basePos as keyof typeof opposites];
  return (
    alignment ? `${oppositeBase}-${alignment}` : oppositeBase
  ) as TooltipPosition;
};

export const checkViewportOverflow = (
  tooltipRect: DOMRect,
  proposedPosition: { top: number; left: number }
): boolean => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  return (
    proposedPosition.left < scrollX ||
    proposedPosition.top < scrollY ||
    proposedPosition.left + tooltipRect.width > scrollX + viewportWidth ||
    proposedPosition.top + tooltipRect.height > scrollY + viewportHeight
  );
};

export const getPositionCoordinates = (
  position: TooltipPosition,
  triggerRect: DOMRect,
  tooltipRect: DOMRect
) => {
  const spacing = 12;
  let top = 0;
  let left = 0;

  const [basePosition, alignment] = position.split('-');

  switch (basePosition) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - spacing;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      if (alignment === 'start') left = triggerRect.left;
      if (alignment === 'end') left = triggerRect.right - tooltipRect.width;
      break;

    case 'bottom':
      top = triggerRect.bottom + spacing;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      if (alignment === 'start') left = triggerRect.left;
      if (alignment === 'end') left = triggerRect.right - tooltipRect.width;
      break;

    case 'left':
      left = triggerRect.left - tooltipRect.width - spacing;
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      if (alignment === 'start') top = triggerRect.top;
      if (alignment === 'end') top = triggerRect.bottom - tooltipRect.height;
      break;

    case 'right':
      left = triggerRect.right + spacing;
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      if (alignment === 'start') top = triggerRect.top;
      if (alignment === 'end') top = triggerRect.bottom - tooltipRect.height;
      break;
  }

  top += window.scrollY;
  left += window.scrollX;

  return { top, left };
};
