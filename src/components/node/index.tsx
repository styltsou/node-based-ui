import { useRef, useState, useEffect } from 'react';

import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnClickOutside } from 'usehooks-ts';
import { IconLock } from '@tabler/icons-react';

import type { Node, Point } from '../../types';
import { EdgeType, PortPlacement } from '../../types';

import ToolBar from './toolbar';
import Port from './port';

import useBoardStore from '../../store';
import cn from '../../utils/cn';
import getAlignmentGuides from '../../utils/get-alignment-guides';
import getPortPosition from '../../utils/port/get-port-position';
import parsePortId from '../../utils/port/parse-port-id';
// import { PORT_SIZE } from '../../constants';

import styles from './styles.module.scss';

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

function LockIndicator({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
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
  );
}

export default function Node({ node }: { node: Node }) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const saveLocalState = useBoardStore(s => s.saveLocalState);
  const nodes = useBoardStore(s => s.nodes);
  const updateNodeSize = useBoardStore(s => s.updateNodeSize);
  const updateNodePosition = useBoardStore(s => s.updateNodePosition);
  const addEdge = useBoardStore(s => s.addEdge);

  const updateConnectionLine = useBoardStore(s => s.updateConnectionLine);

  const canvasPosition = useBoardStore(s => s.position);
  const isCanvasInteractive = useBoardStore(s => s.isInteractive);

  const alignmentGuides = useBoardStore(s => s.alignmentGuides);
  const setAlignmentGuides = useBoardStore(s => s.setAlignmentGuides);
  const areVerticalGuidesActive = useBoardStore(s => s.areVerticalGuidesActive);
  const areHorizontalGuidesActive = useBoardStore(
    s => s.areHorizontalGuidesActive
  );

  const [isToolBarOpen, setIsToolbarOpen] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mouseOffset, setMouseOffset] = useState<Point>({ x: 0, y: 0 });

  // * Connection line state
  // const [isAddingEdge, setIsAddingEdge] = useState(false);
  // const [edgeSource, setEdgeSource] = useState({ x: 0, y: 0 });
  // TODO: Try to init sink as null, then in placeHolder edge, avoid renderign an edge if sink is null
  // This will help sovle the bug where the sink on dragStart is set as the canvasPosition
  // const [edgeTarget, setEdgeTarget] = useState({ x: 0, y: 0 });

  // * Node dragging
  const handleDragNodeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !isCanvasInteractive || node.isLocked) return;
    setIsDragging(true);

    setMouseOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    });
  };

  const handleDragNode = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCanvasInteractive || node.isLocked || !isDragging) return;

    // TODO: Optimize by update state only if node is connected at least once (might be redundant)
    // Update node position show the edges render correctly while dragging
    updateNodePosition(node.id, {
      x: e.clientX - mouseOffset.x,
      y: e.clientY - mouseOffset.y,
    });

    const alignmentGuides = getAlignmentGuides(node, nodes, {
      showVertical: areVerticalGuidesActive,
      showHorizontal: areHorizontalGuidesActive,
    });

    setAlignmentGuides(alignmentGuides);
  };

  const handleDragNodeEnd = () => {
    if (!isDragging || !isCanvasInteractive || node.isLocked) return;

    if (alignmentGuides.length !== 0) setAlignmentGuides([]);

    saveLocalState();
    setIsDragging(false);
  };

  // TODO: I could possibly put all the port logic inside its component to make code cleaner.
  // * Port dragging
  const handleDragPortStart = (e: React.DragEvent<HTMLDivElement>) => {
    const port = e.target as HTMLElement;
    const portId = (port.closest('div[id^="port-"]') as HTMLElement).id;

    const { portPlacement } = parsePortId(portId);

    // ! This know works only for dragging from source to tagret node
    // TODO: Need to know if sink or source is being dragged
    // TODO: See if I can compute the position from the event
    const portPosition = getPortPosition(node, portPlacement);

    e.dataTransfer.setData('text/plain', portId);

    updateConnectionLine({
      sourcePort: {
        placement: portPlacement,
        position: portPosition,
      },
      targetPort: {
        placement: PortPlacement.LEFT,
        position: {
          x: e.clientX - canvasPosition.x,
          y: e.clientY - canvasPosition.y,
        },
      },
    });
  };

  // TODO: Here is the difficult part about the snapping logic
  const handleDragPort = (e: React.DragEvent<HTMLDivElement>) => {
    updateConnectionLine({
      targetPort: {
        placement: PortPlacement.LEFT,
        position: {
          x: e.clientX - canvasPosition.x,
          y: e.clientY - canvasPosition.y,
        },
      },
    });
  };

  // node here DOES NOT refer to the source node, but the target
  const handlePortDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const portId = (e.target as HTMLElement).id;
    if (!portId) return;

    const { portPlacement } = parsePortId(portId);
    const portPosition = getPortPosition(node, portPlacement);

    // When the first drag over occurs, I need to find a way to seemingly connect the edge
    // end permit the connection line from keep getting udpate. then on drop the edge gets created

    updateConnectionLine({
      targetPort: {
        placement: portPlacement,
        position: portPosition,
      },
    });
  };

  const handleDragPortEnd = () => {
    updateConnectionLine(null);
  };

  const handlePortDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const sourcePortId = e.dataTransfer.getData('text/plain');

    const { portPlacement: sourcePortPlacement, nodeId: sourceNodeId } =
      parsePortId(sourcePortId);

    const port = e.target as HTMLElement;
    const targetPortId = (port.closest('div[id^="port-"]') as HTMLElement).id;
    const { portPlacement: targetPortPlacement } = parsePortId(targetPortId);

    const doesEdgeExist = false;

    // setIsAddingEdge(false);
    updateConnectionLine(null);
    if (!sourceNodeId || !node.id || doesEdgeExist) return;

    addEdge({
      id: uuidv4(),
      source: sourceNodeId,
      target: node.id,
      sourcePortPlacement,
      targetPortPlacement,
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

  // Calculate node size
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

  return (
    <>
      <div
        id={`node-${node.id}`}
        ref={nodeRef}
        className={cn(styles.node, isDragging && styles.dragging)}
        onContextMenu={handleContextMenuClick}
        style={{
          transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        }}
      >
        <ToolBar node={node} isOpen={isToolBarOpen} />
        <LockIndicator isVisible={node.isLocked} />
        <div
          className={styles.contentWrapper}
          onMouseDown={handleDragNodeStart}
          onMouseMove={handleDragNode}
          onMouseUp={handleDragNodeEnd}
        >
          Label
        </div>
        {node.ports.map(portPlacement => (
          <Port
            key={`port-${node.id}-${portPlacement}`}
            nodeId={node.id}
            placement={portPlacement}
            onDrag={handleDragPort}
            onDragStart={handleDragPortStart}
            onDragOver={handlePortDragOver}
            onDrop={handlePortDrop}
            onDragEnd={handleDragPortEnd}
          />
        ))}
      </div>
    </>
  );
}
