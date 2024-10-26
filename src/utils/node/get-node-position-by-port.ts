import { Point, Node, PortPlacement } from '../../types';

export default function getNodePositionByPort(
  nodeSize: Node['size'],
  portPosition: Point,
  portPlacement: PortPlacement
): Point {
  const nodePosition: Point = { x: 0, y: 0 };

  switch (portPlacement) {
    case PortPlacement.LEFT:
      nodePosition.x = portPosition.x;
      nodePosition.y = portPosition.y - nodeSize.height / 2;
      break;
    case PortPlacement.RIGHT:
      nodePosition.x = portPosition.x - nodeSize.width;
      nodePosition.y = portPosition.y - nodeSize.height / 2;
      break;
    case PortPlacement.TOP:
      nodePosition.x = portPosition.x - nodeSize.width / 2;
      nodePosition.y = portPosition.y;
      break;
    case PortPlacement.BOTTOM:
      nodePosition.x = portPosition.x - nodeSize.width / 2;
      nodePosition.y = portPosition.y - nodeSize.height;
      break;
  }

  return nodePosition;
}
