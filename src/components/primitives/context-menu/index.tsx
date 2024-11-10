import React, {
  createContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from 'usehooks-ts';
import cn from '../../../utils/cn';

import styles from './styles.module.scss';

type ViewportQuadrant =
  | 'top-left'
  | 'bottom-left'
  | 'top-right'
  | 'bottom-right';

type Position = {
  x: number;
  y: number;
};

const animationVariants = {
  initial: { opacity: 0.5, scale: 0.9 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0.2, scale: 0.9, transition: { duration: 0.08 } },
};

type ContextMenuContextType = {
  isOpen: boolean;
  position: Position;
  open: (e: React.MouseEvent) => void;
  close: () => void;
};

export const ContextMenuContext = createContext<ContextMenuContextType>({
  isOpen: false,
  position: { x: 0, y: 0 },
  open: () => {},
  close: () => {},
});

type ContextMenuProps = {
  onOpen?: () => void;
  onClose?: () => void;
  content: React.ReactElement;
  triggerRef?: React.RefObject<Element>;
  children: React.ReactNode;
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  onOpen,
  onClose,
  content,
  triggerRef,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Keep a copy of them menu always mounted so I can caclulate its size
  // const menuCopyRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [menuSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [viewportQuadrant, setViewportQuadrant] =
    useState<ViewportQuadrant>('top-left');

  const openContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (triggerRef) {
        if (e.target !== triggerRef.current) return;
      }

      e.preventDefault();
      if (isOpen) return;

      const horizontalOrientation =
        e.clientX <= window.innerWidth / 2 ? 'left' : 'right';
      const verticalOrientation =
        e.clientY <= window.innerHeight / 2 ? 'top' : 'bottom';

      setViewportQuadrant(
        `${verticalOrientation}-${horizontalOrientation}` as ViewportQuadrant
      );

      const menuOffset = {
        x: horizontalOrientation === 'left' ? 0 : -menuSize.width,
        y: verticalOrientation === 'top' ? 0 : -menuSize.height,
      };

      setPosition({
        x: e.clientX + menuOffset.x,
        y: e.clientY + menuOffset.y,
      });

      onOpen?.();
      setIsOpen(true);
    },
    [isOpen, menuSize, onOpen, triggerRef]
  );

  const closeContextMenu = useCallback(() => {
    if (!isOpen) return;

    onClose?.();
    setIsOpen(false);
  }, [isOpen, onClose]);

  // useEffect(() => {
  //   const triggerElement = triggerRef?.current || containerRef.current;
  //   if (!triggerElement) return;

  //   window.addEventListener('contextmenu', openContextMenu);
  //   return () => {
  //     window.removeEventListener('contextmenu', openContextMenu);
  //   };
  // }, [triggerRef, openContextMenu]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeContextMenu();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [closeContextMenu]);

  useOnClickOutside(menuRef, closeContextMenu);

  return (
    <ContextMenuContext.Provider
      value={{
        isOpen,
        position,
        open: openContextMenu,
        close: closeContextMenu,
      }}
    >
      <div ref={containerRef} onContextMenu={openContextMenu}>
        {children}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              ref={menuRef}
              className={cn(styles.menu, styles[viewportQuadrant])}
              initial={animationVariants.initial}
              animate={animationVariants.enter}
              exit={animationVariants.exit}
              style={position}
              onContextMenu={e => e.preventDefault()}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContextMenuContext.Provider>
  );
};

type MenuItemProps = {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export const MenuItem = ({ onClick, disabled, children }: MenuItemProps) => (
  <button className={styles.menuButton} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);
