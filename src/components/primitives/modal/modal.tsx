import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

import styles from './styles.module.scss';
import Portal from '../Portal';
import { useKeybindings } from '../../../hooks/use-keybindings';
import cn from '../../../utils/cn';
import { keyboardKeys } from '../../../constants';

import { useModal } from './use-modal';

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

const transition = {
  duration: 0.1,
  ease: 'easeInOut',
};

type ModalProps = {
  id: string;
  position?: 'top' | 'center' | 'bottom';
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
};

export default function Modal({
  id,
  position = 'center',
  className,
  children,
  onOpen,
  onClose,
}: ModalProps) {
  const { isOpen, close } = useModal();

  const handleCloseModal = () => {
    close(id);
  };

  useKeybindings([{ cmd: [keyboardKeys.Escape], callback: handleCloseModal }]);

  const isOpenRef = useRef(isOpen(id));

  useEffect(() => {
    if (isOpen(id) && !isOpenRef.current) {
      console.log('onOpen modal called');
      onOpen?.();
      isOpenRef.current = true;
    } else if (!isOpen(id) && isOpenRef.current) {
      console.log('onClose modal called');
      onClose?.();
      isOpenRef.current = false;
    }
  }, [id, isOpen, onOpen, onClose]);

  return (
    <Portal containerId={id}>
      <AnimatePresence>
        {isOpen(id) && (
          <motion.div className={styles.wrapper}>
            <motion.div
              onClick={handleCloseModal}
              className={styles.overlay}
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            />
            <motion.div
              className={cn(className, styles.modal, styles[position])}
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <IconX stroke={1.5} size={18} />
              </button>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
