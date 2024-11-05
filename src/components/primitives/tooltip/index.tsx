import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import cn from '../../../utils/cn';
import styles from './styles.module.scss';

import { TooltipProps, TooltipPosition, BasePosition } from './types';
import {
  getOppositePosition,
  getPositionCoordinates,
  checkViewportOverflow,
} from './utils';

export const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
  size = 'md',
  showArrow = true,
}: TooltipProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  const [isVisible, setIsVisible] = useState(false);

  const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
  const [arrowPosition, setArrowPosition] = useState<BasePosition>('top');

  const [computedPosition, setComputedPosition] =
    useState<TooltipPosition>(position);

  const findBestPosition = (
    triggerRect: DOMRect,
    tooltipRect: DOMRect,
    preferredPosition: TooltipPosition
  ): TooltipPosition => {
    // Order of positions to try (starting with preferred position)
    const positionsToTry: TooltipPosition[] = [
      preferredPosition,
      getOppositePosition(preferredPosition),
      'right',
      'left',
      'bottom',
      'top',
    ];

    for (const pos of positionsToTry) {
      const coordinates = getPositionCoordinates(pos, triggerRect, tooltipRect);
      if (!checkViewportOverflow(tooltipRect, coordinates)) {
        return pos;
      }
    }

    // If no position works perfectly, return the preferred position
    return preferredPosition;
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Find the best position that doesn't overflow
    const bestPosition = findBestPosition(triggerRect, tooltipRect, position);
    setComputedPosition(bestPosition);

    // Get coordinates for the best position
    const { top, left } = getPositionCoordinates(
      bestPosition,
      triggerRect,
      tooltipRect
    );

    setTooltipStyles({
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
    });

    setArrowPosition(bestPosition.split('-')[0] as BasePosition);
  };

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      requestAnimationFrame(calculatePosition);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => calculatePosition();
      const handleResize = () => calculatePosition();

      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            style={tooltipStyles}
            className={cn(styles.tooltip, styles[size], className)}
            role="tooltip"
            data-position={computedPosition}
          >
            {content}
            {showArrow && (
              <div
                className={cn(styles.arrow, styles[arrowPosition])}
                aria-hidden="true"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
