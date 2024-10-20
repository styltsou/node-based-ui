import { useRef, useState, useEffect } from 'react';

import { useMouseInfo } from '@faceless-ui/mouse-info';
import { v4 as uuidv4 } from 'uuid';
import { useOnClickOutside } from 'usehooks-ts';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './styles.module.scss';
import type { Node } from '../../types';
import { EdgeType } from '../../types';
import useBoardStore from '../../store';
import ToolBar from './toolbar';
import AlignmentGuide from '../alignment-guide';
import getAlignmentGuides from './getAlignmentGuides';
import cn from '../../utils/cn';
import { ConnectionLine } from '../edge';
import { PORT_SIZE } from '../../constants';
import { IconLock } from '@tabler/icons-react';

const lockIndicatorVariants = {
  initial: { opacity: 0, scale: 0.8, x: '85%', y: '-85%' },
  animate: {
    opacity: 1,
    scale: 1,
    x: '85%',
    y: '-85%',
    transition: { duration: 0.05 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    x: '85%',
    y: '-85%',
    transition: { duration: 0.02 },
  },
};

export default function Node({ node }: { node: Node }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { x: mouseX, y: mouseY } = useMouseInfo();

  const saveLocalState = useBoardStore(s => s.saveLocalState);
  const nodes = useBoardStore(s => s.nodes);
  const updateNodeSize = useBoardStore(s => s.updateNodeSize);
  const updateNodePosition = useBoardStore(s => s.updateNodePosition);
  const addEdge = useBoardStore(s => s.addEdge);

  const canvasPosition = useBoardStore(s => s.position);
  const isCanvasInteractive = useBoardStore(s => s.isInteractive);
  const areVerticalGuidesActive = useBoardStore(s => s.areVerticalGuidesActive);
  const areHorizontalGuidesActive = useBoardStore(
    s => s.areHorizontalGuidesActive
  );

  const [isToolBarOpen, setIsToolbarOpen] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const [alignmentGuides, setAlignmentGuides] = useState<
    {
      position: number;
      orientation: 'vertical' | 'horizontal';
    }[]
  >([]);

  // * Connection line state
  const [isAddingEdge, setIsAddingEdge] = useState(false);
  const [edgeSource, setEdgeSource] = useState({ x: 0, y: 0 });
  // TODO: Try to init sink as null, then in placeHolder edge, avoid renderign an edge if sink is null
  // This will help sovle the bug where the sink on dragStart is set as the canvasPosition
  const [edgeSink, setEdgeSink] = useState({ x: 0, y: 0 });

  // * Node dragging
  const handleDragNodeStart = () => {
    console.log('drag node start');
    if (!isCanvasInteractive || node.isLocked) return;
    console.log('drag node start: accepted');
    setIsDragging(true);

    setMouseOffset({
      x: mouseX - node.position.x,
      y: mouseY - node.position.y,
    });
  };

  const handleDragNode = () => {
    if (!isCanvasInteractive || node.isLocked || !isDragging) return;

    const draggedNode = {
      ...node,
      position: { x: mouseX - mouseOffset.x, y: mouseY - mouseOffset.y },
    };

    // TODO: Optimize by update state only if node is connected at least once (might be redundant)
    // Update node position show the edges render correctly while dragging
    updateNodePosition(node.id, draggedNode.position);

    const alignmentGuides = getAlignmentGuides(draggedNode, nodes, {
      areVerticalGuidesActive,
      areHorizontalGuidesActive,
    });

    setAlignmentGuides(alignmentGuides);
  };

  const handleDragNodeEnd = () => {
    if (!isDragging || !isCanvasInteractive || node.isLocked) return;

    if (alignmentGuides.length !== 0) setAlignmentGuides([]);

    saveLocalState();

    setIsDragging(false);
  };

  // * Port dragging
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragPortStart = (e: React.DragEvent<HTMLDivElement>) => {
    // ! This know works only for dragging from source to tagret node

    // TODO: Need to know if sink or source is being dragged
    // TODO: See if I can compute the position from the event
    const portY = node.position.y + node.size.height / 2;
    const portX = node.position.x + node.size.width;

    e.dataTransfer.setData('text/plain', node.id);

    setEdgeSource({ x: portX, y: portY });
    setIsAddingEdge(true);
  };

  // TODO: Here is the difficult part about the snapping logic
  const handleDragPort = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isAddingEdge) return;

    setEdgeSink({
      x: e.clientX - canvasPosition.x + PORT_SIZE / 2,
      y: e.clientY - canvasPosition.y + PORT_SIZE / 2,
    });
  };

  // This event is triggered on the target node compared to the other drag events triggered on soure
  // ! node prop here DOES NOT refer to the source node
  const handlePortDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const targetNode = node;

    const targetNodePort = {
      x: targetNode.position.x,
      y: targetNode.position.y + targetNode.size.height / 2,
    };

    setEdgeSink(targetNodePort);
    // TODO: Here use a ref to avoid setting state on every drag move
  };

  const handleDragPortEnd = () => {
    setIsAddingEdge(false);
  };

  const handlePortDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const sourceNodeId = e.dataTransfer.getData('text/plain');

    const targetNodeId = node.id;

    const doesEdgeExist = false;

    setIsAddingEdge(false);
    if (!sourceNodeId || !targetNodeId || doesEdgeExist) return;

    addEdge({
      id: uuidv4(),
      source: sourceNodeId,
      target: targetNodeId,
      type: EdgeType.Straight,
    });

    saveLocalState();
  };

  // * Node Toolbar
  const handleContextMenuClick = (e: React.SyntheticEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToolbarOpen(true);
  };

  useOnClickOutside([nodeRef], () => {
    setIsToolbarOpen(false);
  });

  // * Calculate and update node size
  useEffect(() => {
    if (nodeRef.current) {
      const { width, height } = nodeRef.current.getBoundingClientRect();
      updateNodeSize(node.id, {
        width: Math.round(width),
        height: Math.round(height),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const portStyle = {
    width: `${PORT_SIZE}rem`,
    height: `${PORT_SIZE}rem`,
  };

  const nodeTranslate = isDragging
    ? `translate(${mouseX - mouseOffset.x}px, ${mouseY - mouseOffset.y}px)`
    : `translate(${node.position.x}px, ${node.position.y}px)`;

  return (
    <>
      <div
        id={`node-${node.id}`}
        ref={nodeRef}
        className={cn(styles.node, isDragging && styles.dragging)}
        style={{ transform: nodeTranslate }}
        onContextMenu={handleContextMenuClick}
      >
        <ToolBar node={node} isOpen={isToolBarOpen} />

        <div
          className={styles.portWrapper}
          onDragOver={handlePortDragOver}
          onDrop={handlePortDrop}
        >
          <div
            className={styles.port}
            style={portStyle}
            onDragStart={handleDragPortStart}
            onDrag={handleDragPort}
            onDragOver={e => e.preventDefault()}
            onDragEnd={handleDragPortEnd}
            draggable
          />
        </div>
        <div
          className={styles.contentWrapper}
          onMouseDown={handleDragNodeStart}
          onMouseMove={handleDragNode}
          onMouseUp={handleDragNodeEnd}
        >
          Label
        </div>
        <div
          className={cn(styles.portWrapper, styles.right)}
          onDragOver={handlePortDragOver}
          onDrop={handlePortDrop}
        >
          <div
            className={styles.port}
            style={portStyle}
            onDragStart={handleDragPortStart}
            onDrag={handleDragPort}
            onDragOver={e => e.preventDefault()}
            onDragEnd={handleDragPortEnd}
            draggable
          />
        </div>
        <AnimatePresence>
          {node.isLocked && (
            <motion.div
              className={styles.lockIndicator}
              variants={lockIndicatorVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <IconLock size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {isAddingEdge && (
        <ConnectionLine
          key="connection-line"
          start={edgeSource}
          end={edgeSink}
          type={EdgeType.Straight}
        />
      )}
      {alignmentGuides?.length !== 0 &&
        alignmentGuides.map(guide => (
          <AlignmentGuide
            key={uuidv4()}
            position={guide.position}
            orientation={guide.orientation}
          />
        ))}
    </>
  );
}
