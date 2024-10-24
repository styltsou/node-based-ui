import styles from './styles.module.scss';
import { motion, AnimatePresence } from 'framer-motion';

import useEdgeVisualizationStore from '../../../store/edgeVisualizationStore';

// Animation variants
const controlsBoxVariants = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
};

const exitButtonVariants = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};

const transitionOptions = {
  duration: 0.2,
};

export default function VisualizationControls() {
  const {
    selectedEdgeId,
    showRulers,
    showGridBounds,
    showGridSlices,
    showConnectionPoints,
    showPossiblePaths,
    showStepEdge,
    showSmoothEdge,
    toggleRulers,
    toggleGridBounds,
    toggleGridSlices,
    toggleConnectionPoints,
    togglePossiblePaths,
    toggleStepEdge,
    toggleSmoothEdge,
    clearSelectedEdge,
  } = useEdgeVisualizationStore();

  const controls = [
    { key: 'rulers', label: 'Rulers', state: showRulers, toggle: toggleRulers },
    {
      key: 'gridBounds',
      label: 'Grid Bounds',
      state: showGridBounds,
      toggle: toggleGridBounds,
    },
    {
      key: 'gridSlices',
      label: 'Grid Slices',
      state: showGridSlices,
      toggle: toggleGridSlices,
    },
    {
      key: 'connectionPoints',
      label: 'Connection Points',
      state: showConnectionPoints,
      toggle: toggleConnectionPoints,
    },
    {
      key: 'possiblePaths',
      label: 'Possible Paths',
      state: showPossiblePaths,
      toggle: togglePossiblePaths,
    },
    {
      key: 'stepEdge',
      label: 'Step Edge',
      state: showStepEdge,
      toggle: toggleStepEdge,
    },
    {
      key: 'smoothenEdge',
      label: 'Smoothen Edge',
      state: showStepEdge && showSmoothEdge,
      toggle: toggleSmoothEdge,
    },
  ];

  const handleExitVisualization = () => {
    clearSelectedEdge();
  };

  return (
    <AnimatePresence>
      {selectedEdgeId && (
        <>
          <motion.div
            className={styles.exitButtonWrapper}
            variants={exitButtonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionOptions}
          >
            <button onClick={handleExitVisualization}>
              Exit Visualization Mode
            </button>
          </motion.div>
          <motion.div
            className={styles.controlsBox}
            variants={controlsBoxVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionOptions}
          >
            <h3>Visualization Controls</h3>
            {controls.map(({ key, label, state, toggle }) => (
              <div key={key}>
                <label>
                  <input
                    type="checkbox"
                    checked={state}
                    onChange={toggle}
                    disabled={key === 'smoothenEdge' && !showStepEdge}
                  />
                  {label}
                </label>
              </div>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
