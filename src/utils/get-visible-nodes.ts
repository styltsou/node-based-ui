import { Point, Node } from '../types';

const PADDING = 180;

export default function getVisibleNodes(
  nodes: Node[],
  canvasPosition: Point
): Node[] {
  // Get window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Calculate viewport boundaries with padding
  const viewportBounds = {
    left: -canvasPosition.x - PADDING,
    right: -canvasPosition.x + windowWidth + PADDING,
    top: -canvasPosition.y - PADDING,
    bottom: -canvasPosition.y + windowHeight + PADDING,
  };

  // Return nodes that are within the viewport
  return nodes.filter(node => {
    return (
      node.position.x >= viewportBounds.left &&
      node.position.x <= viewportBounds.right &&
      node.position.y >= viewportBounds.top &&
      node.position.y <= viewportBounds.bottom
    );
  });
}
