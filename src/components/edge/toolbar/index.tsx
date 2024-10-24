import { useState, useEffect } from 'react';
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

const variants: Variants = {
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

import { forwardRef } from 'react';

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

  const handleSetEdgeType = (type: EdgeType) => () => {
    setEdgeType(edge.id, type);
    saveLocalState();
  };

  // Close EdgeOptions submenu when toolbar closes
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
          variants={variants}
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
              {areEdgeOptionsOpen && (
                <div className={styles.edgeOptions}>
                  <button
                    className={styles.edgeOptionButton}
                    onClick={handleSetEdgeType(EdgeType.Straight)}
                  >
                    Straight
                    {edge.type === EdgeType.Straight && (
                      <IconCheck stroke={2} size={16} />
                    )}
                  </button>
                  <button
                    className={styles.edgeOptionButton}
                    onClick={handleSetEdgeType(EdgeType.Step)}
                  >
                    Step
                    {edge.type === EdgeType.Step && (
                      <IconCheck stroke={2} size={16} />
                    )}
                  </button>
                  <button
                    className={styles.edgeOptionButton}
                    onClick={handleSetEdgeType(EdgeType.SmoothStep)}
                  >
                    Smoothstep
                    {edge.type === EdgeType.SmoothStep && (
                      <IconCheck stroke={2} size={16} />
                    )}
                  </button>
                  <button
                    className={styles.edgeOptionButton}
                    onClick={handleSetEdgeType(EdgeType.Bezier)}
                  >
                    Bezier
                    {edge.type === EdgeType.Bezier && (
                      <IconCheck stroke={2} size={16} />
                    )}
                  </button>
                </div>
              )}
              <IconVectorSpline size={18} stroke={1} />
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
