import { z } from 'zod';

// Point schema
const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// EdgeType enum schema
const EdgeTypeSchema = z.enum(['straight', 'bezier', 'step', 'smoothstep']);

// PortPlacement enum schema
const PortPlacementSchema = z.enum(['left', 'right', 'top', 'bottom']);

// Position schema (same as Point)
const PositionSchema = PointSchema;

// Zoom schema
const ZoomSchema = z.number().min(0.1).max(2);

// Node schema
const NodeSchema = z.object({
  id: z.string(),
  position: PositionSchema,
  size: z.object({
    width: z.number().min(0),
    height: z.number().min(0),
  }),
  type: z.string(),
  isLocked: z.boolean(),
  ports: z
    .array(PortPlacementSchema)
    .refine(ports => new Set(ports).size === ports.length, {
      message: 'Ports must be unique',
    }),
});

// Edge schema
const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourcePortPlacement: PortPlacementSchema,
  targetPortPlacement: PortPlacementSchema,
  type: EdgeTypeSchema,
});

const ImportSchema = z.object({
  position: PositionSchema,
  zoom: ZoomSchema,
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export {
  PointSchema,
  EdgeTypeSchema,
  PortPlacementSchema,
  PositionSchema,
  ZoomSchema,
  NodeSchema,
  EdgeSchema,
  ImportSchema,
};
