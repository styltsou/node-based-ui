import { Edge, Point, Node } from '../types';
import getPortPosition from './port/get-port-position';

const PADDING = 50;

export default function getVisibleEdges(
  edges: Edge[],
  nodes: Node[],
  canvasPosition: Point
): Edge[] {
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

  // Return edges that have at least one endpoint within the viewport
  return edges.filter(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);

    if (!sourceNode || !targetNode) return false;

    const sourcePoint = getPortPosition(sourceNode, edge.sourcePortPlacement);
    const targetPoint = getPortPosition(targetNode, edge.targetPortPlacement);

    return (
      (sourcePoint.x >= viewportBounds.left &&
        sourcePoint.x <= viewportBounds.right &&
        sourcePoint.y >= viewportBounds.top &&
        sourcePoint.y <= viewportBounds.bottom) ||
      (targetPoint.x >= viewportBounds.left &&
        targetPoint.x <= viewportBounds.right &&
        targetPoint.y >= viewportBounds.top &&
        targetPoint.y <= viewportBounds.bottom)
    );
  });
}
