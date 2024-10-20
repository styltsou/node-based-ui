import { ContextMenu } from '../primitives/context-menu';

import MenuContent from './MenuContent';

export default function CanvasContextMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ContextMenu content={<MenuContent />}>{children}</ContextMenu>;
}
