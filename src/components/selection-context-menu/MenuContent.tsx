import { useContext, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { NodeGroup } from '../../types';
import { ContextMenuContext, MenuItem } from '../primitives/context-menu';
import useBoardStore from '../../store';
import { COLORS } from '../../constants';

// ! Just to test different colors
const getRandomGroupColor = () => {
  const colors = [
    '#00AAFF', // Electric Blue
    '#00FF88', // Spring Green
    '#FF3399', // Hot Pink
    '#FF9933', // Bright Orange
    '#FFDD00', // Electric Yellow
    COLORS.VIOLET,
  ];

  return colors[Math.floor(Math.random() * colors.length)];
};

export default function MenuContent() {
  const { close } = useContext(ContextMenuContext);

  const selectedNodeIds = useBoardStore(s => s.selectedNodeIds);
  const nodes = useBoardStore(s => s.nodes);
  const setNodes = useBoardStore(s => s.setNodes);

  // const nodeGroups = useBoardStore(s => s.nodeGroups);
  const createNodeGroup = useBoardStore(s => s.createNodeGroup);

  const saveLocalState = useBoardStore(s => s.saveLocalState);

  const areAllNodesLocked = useMemo(
    () =>
      selectedNodeIds.every(id => nodes.find(node => node.id === id)?.isLocked),
    [selectedNodeIds, nodes]
  );

  const areAllNodesUnlocked = useMemo(
    () =>
      selectedNodeIds.every(
        id => !nodes.find(node => node.id === id)?.isLocked
      ),
    [selectedNodeIds, nodes]
  );

  // TODO: In the future maybe would be better to implement store action for these
  // and not use at all the setNodes action

  const handleGroupNodes = () => {
    // TODO: Add some logic to generate new group name like 'Group 3'

    const nodeGroup: NodeGroup = {
      id: uuidv4(),
      label: 'New group',
      color: getRandomGroupColor(),
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 },
      nodeIds: selectedNodeIds,
      isLocked: false,
    };

    createNodeGroup(nodeGroup);

    saveLocalState();
    close();
  };

  const handleLockNodes = () => {
    setNodes(
      nodes.map(node =>
        selectedNodeIds.includes(node.id) ? { ...node, isLocked: true } : node
      )
    );

    saveLocalState();
    close();
  };

  const handleUnlockNodes = () => {
    setNodes(
      nodes.map(node =>
        selectedNodeIds.includes(node.id) ? { ...node, isLocked: false } : node
      )
    );

    saveLocalState();
    close();
  };

  const handleDeleteNodes = () => {
    setNodes(nodes.filter(node => !selectedNodeIds.includes(node.id)));

    saveLocalState();
    close();
  };

  return (
    <>
      <MenuItem
        onClick={handleGroupNodes}
        disabled={selectedNodeIds.length < 2}
      >
        Group nodes
      </MenuItem>
      <MenuItem onClick={handleLockNodes} disabled={areAllNodesLocked}>
        Lock nodes
      </MenuItem>
      <MenuItem onClick={handleUnlockNodes} disabled={areAllNodesUnlocked}>
        Unlock nodes
      </MenuItem>
      <MenuItem
        onClick={handleDeleteNodes}
        disabled={selectedNodeIds.length === 0}
      >
        Delete nodes
      </MenuItem>
    </>
  );
}
