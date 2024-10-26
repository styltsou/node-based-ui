import { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  IconVectorSpline,
  IconEye,
  IconTrash,
  IconCheck,
} from '@tabler/icons-react';

import { Point, Edge, EdgeType } from '../../../types';
import useBoardStore from '../../../store';
import useEdgeVisualizationStore from '../../../store/edgeVisualizationStore';
import cn from '../../../utils/cn';
import styles from './styles.module.scss';

const toolbarVariants: Variants = {
  initial: {
    y: '-110%',
    opacity: 0,
  },
  enter: {
    y: '-150%',
    opacity: 1,
    transition: { duration: 0.07 },
  },
  exit: {
    y: '-110%',
    opacity: 0,
    transition: { duration: 0.07 },
  },
};

const edgeTypeSelectorVariants: Variants = {
  initial: {
    x: '-50%',
    y: '0.5rem',
    opacity: 0,
  },
  enter: {
    x: '-50%',
    y: '-0.7rem',
    opacity: 1,
    transition: { duration: 0.04 },
  },
  exit: {
    x: '-50%',
    y: '0.5rem',
    opacity: 0,
    transition: { duration: 0.04 },
  },
};

const EdgeTypeOptions = ({
  edge,
  onSetEdgeType,
  isOpen,
}: {
  edge: Edge;
  onSetEdgeType: (type: EdgeType) => void;
  isOpen: boolean;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.edgeOptions}
          variants={edgeTypeSelectorVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {Object.values(EdgeType).map(type => (
            <button
              key={type}
              className={styles.edgeOptionButton}
              onClick={() => onSetEdgeType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {edge.type === type && <IconCheck stroke={2} size={16} />}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ToolBar = forwardRef<
  HTMLDivElement,
  {
    edge: Edge;
    position: Point | null;
  }
>(({ edge, position }, ref) => {
  const deleteEdge = useBoardStore(s => s.deleteEdge);
  const saveLocalState = useBoardStore(s => s.saveLocalState);
  const setEdgeType = useBoardStore(s => s.setEdgeType);
  const setEdgeVisualizationId = useEdgeVisualizationStore(
    s => s.setSelectedEdgeId
  );
  const setLastAssignedEdgeType = useBoardStore(s => s.setLastAssignedEdgeType);

  const [areEdgeOptionsOpen, setAreEdgeOptionsOpen] = useState(false);

  const handleEdgeOptionsClick = () => {
    setAreEdgeOptionsOpen(prev => !prev);
  };

  const handleDeleteEdge = () => {
    deleteEdge(edge.id);
    saveLocalState();
  };

  const handleOpenVisualizationMode = () => {
    setEdgeVisualizationId(edge.id);
  };

  const handleSetEdgeType = (type: EdgeType) => {
    setEdgeType(edge.id, type);
    setLastAssignedEdgeType(type);
    saveLocalState();
    setAreEdgeOptionsOpen(false);
  };

  useEffect(() => {
    return () => {
      setAreEdgeOptionsOpen(false);
    };
  }, [position]);

  return (
    <AnimatePresence>
      {position !== null && (
        <motion.div
          ref={ref}
          className={styles.wrapper}
          variants={toolbarVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          style={{
            top: position.y,
            left: position.x,
          }}
        >
          <div className={styles.toolbar}>
            <button
              className={cn(
                styles.toolbarButton,
                areEdgeOptionsOpen && styles.active
              )}
              onClick={handleEdgeOptionsClick}
            >
              <IconVectorSpline size={18} stroke={1} />
              <EdgeTypeOptions
                edge={edge}
                onSetEdgeType={handleSetEdgeType}
                isOpen={areEdgeOptionsOpen}
              />
            </button>
            <button
              className={styles.toolbarButton}
              onClick={handleOpenVisualizationMode}
            >
              <IconEye size={18} stroke={1} />
            </button>
            <button className={styles.toolbarButton} onClick={handleDeleteEdge}>
              <IconTrash size={18} stroke={1} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ToolBar.displayName = 'ToolBar';

export default ToolBar;
