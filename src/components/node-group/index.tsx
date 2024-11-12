import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconLock,
  IconLockOpen,
  IconDotsVertical,
  IconPencil,
  IconMarqueeOff,
  IconPalette,
  IconTrash,
} from '@tabler/icons-react';

import type { NodeGroup } from '../../types';
import styles from './styles.module.scss';

import { Popover } from '../primitives/popover';
import { useConfirmation } from '../confirmation-dialog/use-confirmation';

import useBoardStore from '../../store';
import getNodesBoundingBox from '../../utils/node-group/get-nodes-bounding-box';
import cn from '../../utils/cn';
import isDarkColor from '../../utils/is-dark-color';

const LockIndicatorVariants = {
  initial: { opacity: 0, scale: 0.8, y: '-100%' },
  animate: {
    opacity: 1,
    scale: 1,
    y: '-100%',
    transition: { duration: 0.05 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: '-100%',
    transition: { duration: 0.05 },
  },
};

const LockIndicator = ({
  isLocked,
  color,
}: {
  isLocked: boolean;
  color: string;
}) => {
  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          className={styles.lockIndicator}
          style={{ color }}
          variants={LockIndicatorVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <IconLock size={16} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function NodeGroup({ nodeGroup }: { nodeGroup: NodeGroup }) {
  const nodes = useBoardStore(s => s.nodes);
  const toggleNodeGroupLock = useBoardStore(s => s.toggleNodeGroupLock);
  const breakNodeGroup = useBoardStore(s => s.breakNodeGroup);
  const deleteNodes = useBoardStore(s => s.deleteNodes);
  const saveLocalState = useBoardStore(s => s.saveLocalState);

  const showConfirmation = useConfirmation();

  const isGroupColorDark = useMemo(
    () => isDarkColor(nodeGroup.color),
    [nodeGroup.color]
  );

  const handleToggleLock = () => {
    toggleNodeGroupLock(nodeGroup.id);
    saveLocalState();
  };

  const ungroupNodes = () => {
    breakNodeGroup(nodeGroup.id);
    saveLocalState();
  };

  const deleteNodesInGroup = () => {
    showConfirmation({
      message:
        'Are you sure you want to delete this group and its containing nodes?',
      confirmText: 'Delete',
      onConfirm: () => {
        deleteNodes(nodeGroup.nodeIds);
        saveLocalState();
      },
    });
  };

  const nodesInGroup = nodeGroup.nodeIds
    .map(id => nodes.find(n => n.id === id))
    .filter(node => node !== undefined);

  if (!nodesInGroup) return;

  const boundingBox = getNodesBoundingBox(nodesInGroup);

  return (
    <div
      className={styles.groupWrapper}
      style={{
        transform: `translate(${boundingBox.x}px, ${boundingBox.y}px)`,
        width: boundingBox.width,
        height: boundingBox.height,
      }}
    >
      <LockIndicator isLocked={nodeGroup.isLocked} color={nodeGroup.color} />
      <div
        className={cn(styles.groupLabel, isGroupColorDark && styles.darkColor)}
        style={{ background: nodeGroup.color }}
      >
        <span>{nodeGroup.label}</span>
        <Popover position="right">
          <Popover.Trigger>
            <button
              aria-label="Group options"
              className={cn(
                styles.groupOptionsButton,
                isGroupColorDark && styles.darkColor
              )}
            >
              <IconDotsVertical
                size={14}
                color={isGroupColorDark ? 'white' : 'black'}
              />
            </button>
          </Popover.Trigger>
          <Popover.Content
            style={
              {
                borderColor: nodeGroup.color,
                '--hover-bg-color': nodeGroup.color,
                '--hover-text-color': isGroupColorDark ? 'white' : 'black',
              } as React.CSSProperties
            }
            className={styles.popoverMenu}
          >
            <button>
              <IconPencil size={14} />
              Rename
            </button>
            <button onClick={ungroupNodes}>
              <IconMarqueeOff size={14} />
              Ungroup
            </button>
            <button onClick={handleToggleLock}>
              {nodeGroup.isLocked ? (
                <>
                  <IconLockOpen size={14} />
                  Unlock group
                </>
              ) : (
                <>
                  <IconLock size={14} />
                  Lock group
                </>
              )}
            </button>
            <button>
              <IconPalette size={14} />
              Change color
            </button>
            <button onClick={deleteNodesInGroup}>
              <IconTrash size={14} />
              Delete nodes
            </button>
          </Popover.Content>
        </Popover>
      </div>
      <div
        className={styles.groupBox}
        style={{ borderColor: nodeGroup.color }}
      />
    </div>
  );
}
