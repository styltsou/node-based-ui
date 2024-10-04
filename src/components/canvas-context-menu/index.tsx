import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ContextMenu, ContextMenuContext } from '../primitives/context-menu';
import useBoardStore from '../../store';
import type { Node } from '../../types';
import styles from './styles.module.scss';
import cn from '../../utils/cn';
import { IconCheck } from '@tabler/icons-react';

export default function CanvasContextMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const { close } = useContext(ContextMenuContext);
  const canvasPosition = useBoardStore(s => s.position);
  const areVerticalGuidesActive = useBoardStore(s => s.areVerticalGuidesActive);
  const areHorizontalGuidesActive = useBoardStore(
    s => s.areHorizontalGuidesActive
  );
  const toggleHorizontalGuides = useBoardStore(s => s.toggleHorizontalGuides);
  const toggleVerticalGuides = useBoardStore(s => s.toggleVerticalGuides);

  const addNode = useBoardStore(s => s.addNode);

  const handleAddNode = () => {
    //TODO: Add appropriate node position
    const node: Node = {
      id: uuidv4(),
      size: {
        width: 0,
        height: 0,
      },
      type: 'Test',
      position: {
        x: canvasPosition.x + 0,
        y: canvasPosition.y + 0,
      },
    };

    close();
    addNode(node);
  };

  const handleToggleVerticalGuides = () => {
    console.log('trigger close function?');
    toggleVerticalGuides();
    close();
  };

  const handleToggleHorizontalGuides = () => {
    console.log('trigger close function?');
    toggleHorizontalGuides();
    close();
  };

  return (
    <ContextMenu
      content={
        <>
          <button className={styles.button} onClick={handleAddNode}>
            Add node
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
      }
    >
      {children}
    </ContextMenu>
  );
}
