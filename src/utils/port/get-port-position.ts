import type { Node, Point } from '../../types';
import { PortPlacement } from '../../types';

export default function getPortPosition(
  node: Node,
  placement: PortPlacement
): Point {
  let portX = 0;
  let portY = 0;

  if (placement === PortPlacement.LEFT) {
    portX = node.position.x;
    portY = node.position.y + node.size.height / 2;
  } else if (placement === PortPlacement.RIGHT) {
    portX = node.position.x + node.size.width;
    portY = node.position.y + node.size.height / 2;
  } else if (placement === PortPlacement.TOP) {
    portX = node.position.x + node.size.width / 2;
    portY = node.position.y;
  } else if (placement === PortPlacement.BOTTOM) {
    portX = node.position.x + node.size.width / 2;
    portY = node.position.y + node.size.height;
  }

  return { x: portX, y: portY };
}
