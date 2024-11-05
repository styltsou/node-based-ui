import React from 'react';

export type TooltipPosition =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type BasePosition = 'top' | 'right' | 'bottom' | 'left';

export type TooltipSize = 'sm' | 'md' | 'lg';

export type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  size?: TooltipSize;
  showArrow?: boolean;
};
