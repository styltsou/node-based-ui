import RBush from 'rbush';
import type { Node, Line } from '../types';
import { NodeSchema } from '../schemas';

// TODO: Make this more efficient/readable by avoiding safeparse

export class RTree extends RBush<unknown> {
  toBBox(item: Node | Line) {
    if (NodeSchema.safeParse(item).success) {
      const node = item as Node;
      return {
        minX: node.position.x,
        maxX: node.position.x + node.size.width,
        minY: node.position.y,
        maxY: node.position.y + node.size.height,
      };
    } else {
      const edge = item as Line;
      return {
        minX: Math.min(edge.start.x, edge.end.x),
        maxX: Math.max(edge.start.x, edge.end.x),
        minY: Math.min(edge.start.y, edge.end.y),
        maxY: Math.max(edge.start.y, edge.end.y),
      };
    }
  }

  compareMinX(a: Node | Line, b: Node | Line) {
    let AMinX;
    let BMinX;

    if (NodeSchema.safeParse(a).success) {
      const nodeA = a as Node;
      AMinX = nodeA.position.x;
    } else {
      const lineA = a as Line;
      AMinX = Math.min(lineA.start.x, lineA.end.x);
    }

    if (NodeSchema.safeParse(b).success) {
      const nodeB = b as Node;
      BMinX = nodeB.position.x;
    } else {
      const lineB = b as Line;
      BMinX = Math.min(lineB.start.x, lineB.end.x);
    }

    return AMinX - BMinX;
  }

  compareMaxX(a: Node | Line, b: Node | Line) {
    let AMaxX;
    let BMaxX;

    if (NodeSchema.safeParse(a).success) {
      const nodeA = a as Node;
      AMaxX = nodeA.position.x + nodeA.size.width;
    } else {
      const lineA = a as Line;
      AMaxX = Math.max(lineA.start.x, lineA.end.x);
    }

    if (NodeSchema.safeParse(b).success) {
      const nodeB = b as Node;
      BMaxX = nodeB.position.x + nodeB.size.width;
    } else {
      const lineB = b as Line;
      BMaxX = Math.max(lineB.start.x, lineB.end.x);
    }

    return AMaxX - BMaxX;
  }
}
