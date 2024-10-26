import {
  IconTrash,
  // IconEdit,
  IconLockOpen,
  IconLock,
  IconCopy,
  IconCopyCheck,
} from '@tabler/icons-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import { Node } from '../../../types';
import useBoardStore from '../../../store';

import styles from './styles.module.scss';

const variants: Variants = {
  initial: {
    y: '-90%',
    opacity: 0,
  },
  enter: {
    y: '-100%',
    opacity: 1,
    transition: { duration: 0.07 },
  },
  exit: {
    y: '-90%',
    opacity: 0,
    transition: { duration: 0.07 },
  },
};

export default function ToolBar({
  node,
  isOpen,
}: {
  node: Node;
  isOpen: boolean;
}) {
  const saveLocalState = useBoardStore(s => s.saveLocalState);
  const copiedNode = useBoardStore(s => s.copiedNode);
  const deleteNode = useBoardStore(s => s.deleteNode);
  const toggleNodeLock = useBoardStore(s => s.toggleNodeLock);
  const copyNode = useBoardStore(s => s.copyNode);

  const handleToggleNodeLock = () => {
    toggleNodeLock(node.id);
    saveLocalState();
  };

  // const handleEditNode = () => {
  //   //
  // };

  const handleCopyNode = () => {
    copyNode(node);
    saveLocalState();
  };

  const handleDeleteNode = () => {
    deleteNode(node.id);
    saveLocalState();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.wrapper}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <div className={styles.toolbar}>
            <button onClick={handleToggleNodeLock}>
              {node.isLocked ? (
                <IconLock size={18} stroke={1} />
              ) : (
                <IconLockOpen size={18} stroke={1} />
              )}
            </button>
            <button onClick={handleCopyNode}>
              {copiedNode?.id === node.id ? (
                <IconCopyCheck size={18} stroke={1} />
              ) : (
                <IconCopy size={18} stroke={1} />
              )}
            </button>
            {/* <button onClick={handleEditNode}>
              <IconEdit size={18} stroke={1} />
            </button> */}
            <button onClick={handleDeleteNode}>
              <IconTrash size={18} stroke={1} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
