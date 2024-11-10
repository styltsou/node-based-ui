import { ContextMenu } from '../primitives/context-menu';
import MenuContent from './MenuContent';

export default function SelectionContextMenu({
  children,
  triggerRef,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
  triggerRef: React.RefObject<Element>;
}) {
  return (
    <ContextMenu
      content={<MenuContent />}
      triggerRef={triggerRef}
      onClose={onClose}
    >
      {children}
    </ContextMenu>
  );
}
