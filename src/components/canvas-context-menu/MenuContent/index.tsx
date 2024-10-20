import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './styles.module.scss';
import cn from '../../../utils/cn';

import { ContextMenuContext } from '../../primitives/context-menu';
import useBoardStore from '../../../store';
import type { Node } from '../../../types';
import { IconCheck } from '@tabler/icons-react';

export default function MenuContent() {
  const { close, position: contextMenuPosition } =
    useContext(ContextMenuContext);

  const canvasPosition = useBoardStore(s => s.position);
  const areVerticalGuidesActive = useBoardStore(s => s.areVerticalGuidesActive);
  const areHorizontalGuidesActive = useBoardStore(
    s => s.areHorizontalGuidesActive
  );
  const toggleHorizontalGuides = useBoardStore(s => s.toggleHorizontalGuides);
  const toggleVerticalGuides = useBoardStore(s => s.toggleVerticalGuides);

  const addNode = useBoardStore(s => s.addNode);
  const copiedNode = useBoardStore(s => s.copiedNode);
  const pasteNode = useBoardStore(s => s.pasteNode);

  const saveLocalState = useBoardStore(s => s.saveLocalState);

  const handleAddNode = () => {
    const node: Node = {
      id: uuidv4(),
      size: {
        width: 0,
        height: 0,
      },
      type: '',
      isLocked: false,
      position: {
        x: contextMenuPosition.x - canvasPosition.x,
        y: contextMenuPosition.y - canvasPosition.y,
      },
      data: { label: 'Label' },
    };

    close();
    addNode(node);
    saveLocalState();
  };

  const handlePasteNode = () => {
    pasteNode(contextMenuPosition);
    saveLocalState();
  };

  const handleToggleVerticalGuides = () => {
    toggleVerticalGuides();
    saveLocalState();
    close();
  };

  const handleToggleHorizontalGuides = () => {
    toggleHorizontalGuides();
    saveLocalState();
    close();
  };

  return (
    <>
      <button className={styles.button} onClick={handleAddNode}>
        Add node
      </button>
      <button
        className={styles.button}
        onClick={handlePasteNode}
        disabled={!copiedNode}
      >
        Paste node
      </button>
      <button
        className={cn(styles.button)}
        onClick={handleToggleVerticalGuides}
      >
        Vertical guides
        {areVerticalGuidesActive && <IconCheck stroke={2} size={16} />}
      </button>
      <button
        className={cn(styles.button)}
        onClick={handleToggleHorizontalGuides}
      >
        Horizontal guides
        {areHorizontalGuidesActive && <IconCheck stroke={2} size={16} />}
      </button>
    </>
  );
}
