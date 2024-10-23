import { create } from 'zustand';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import type {
  Node,
  Edge,
  NodeGroup,
  AlignmentGuide,
  ConnectionLine,
} from '../types';
import { EdgeType, PortPlacement } from '../types';
import { ImportSchema } from '../schemas';
import {
  MIN_ZOOM,
  MAX_ZOOM,
  MIN_NODE_HEIGHT,
  MIN_NODE_WIDTH,
} from '../constants';

interface CanvasState {
  position: {
    x: number;
    y: number;
  };
  zoom: number;
  isInteractive: boolean;
  areVerticalGuidesActive: boolean;
  areHorizontalGuidesActive: boolean;
  nodes: Node[];
  copiedNode: Node | null;
  edges: Edge[];
  connectionLine: ConnectionLine | null;
  alignmentGuides: AlignmentGuide[];
  nodeGroups: NodeGroup[];
}

interface CanvasActions {
  updatePosition: (position: CanvasState['position']) => void;
  resetPanning: () => void;
  updateZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleInteractivity: () => void;
  toggleVerticalGuides: () => void;
  toggleHorizontalGuides: () => void;
  addNode: (node: Node) => void;
  updateNodePosition: (id: string, position: Node['position']) => void;
  updateNodeSize: (id: string, size: Node['size']) => void;
  toggleNodeLock: (id: string) => void;
  copyNode: (node: Node) => void;
  pasteNode: (position: Node['position']) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;
  updateConnectionLine: (
    connectionLine: Partial<ConnectionLine> | null
  ) => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  createNodeGroup: (nodeGroup: NodeGroup) => void;
  updateNodeGroup: (id: string, nodeGroup: NodeGroup) => void;
  deleteNodeGroup: (id: string) => void;
  saveLocalState: () => void;
  importData: (data: z.infer<typeof ImportSchema>) => void;
}

const STORAGE_KEY = 'global-store';

const initialState: Omit<CanvasState, 'alignmentGuides' | 'connectionLine'> = {
  position: { x: 0, y: 0 },
  zoom: 1,
  isInteractive: true,
  areVerticalGuidesActive: false,
  areHorizontalGuidesActive: false,
  nodes: [],
  copiedNode: null,
  edges: [],
  nodeGroups: [],
};

// TODO
// 1. I want to have more flexibility in which state is saved on local storage
// 2. I also want to add support for storing certain state on session storage
// 3. I want to have a single action for updating node data

const hydrateState = (
  initialState: Omit<CanvasState, 'alignmentGuides' | 'connectionLine'>
) => {
  const localState = localStorage.getItem(STORAGE_KEY);

  if (localState) {
    const parsedState = JSON.parse(localState);
    return parsedState;
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
};

const useBoardStore = create<CanvasState & CanvasActions>((set, get) => ({
  ...hydrateState(initialState),
  alignmentGuides: [],
  connectionLine: null,

  updatePosition: position => set({ position: position }),

  updateZoom: zoom => {
    console.log('call update canvas zoom');
    console.log('new zoom value', zoom);
    set({ zoom: zoom });
  },

  zoomIn: () => {
    if (get().zoom <= MAX_ZOOM) set(state => ({ zoom: state.zoom + 0.1 }));
  },

  zoomOut: () => {
    if (get().zoom >= MIN_ZOOM) set(state => ({ zoom: state.zoom - 0.1 }));
  },

  toggleInteractivity: () =>
    set(state => ({ isInteractive: !state.isInteractive })),

  toggleVerticalGuides: () =>
    set(state => ({
      areVerticalGuidesActive: !state.areVerticalGuidesActive,
    })),

  toggleHorizontalGuides: () =>
    set(state => ({
      areHorizontalGuidesActive: !state.areHorizontalGuidesActive,
    })),

  resetPanning: () => set({ position: { x: 0, y: 0 } }),

  resetZoom: () => set({ zoom: 1 }),

  addNode: node => {
    if (node.ports.length === 0)
      node.ports = [PortPlacement.LEFT, PortPlacement.RIGHT];

    set(state => ({ nodes: [...state.nodes, node] }));

    localStorage.setItem('global-store', JSON.stringify(get()));
  },

  updateNodePosition: (id, position) =>
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === id ? { ...node, position } : node
      ),
    })),

  updateNodeSize: (id, size) =>
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === id
          ? {
              ...node,
              size: {
                width: Math.max(size.width, MIN_NODE_WIDTH),
                height: Math.max(size.height, MIN_NODE_HEIGHT),
              },
            }
          : node
      ),
    })),

  toggleNodeLock: id =>
    set(state => ({
      nodes: state.nodes.map(node =>
        node.id === id ? { ...node, isLocked: !node.isLocked } : node
      ),
    })),

  copyNode: node =>
    set(() => ({
      copiedNode: node,
    })),

  pasteNode: position => {
    const copiedNode = get().copiedNode;
    if (copiedNode) {
      set(state => ({
        nodes: [...state.nodes, { ...copiedNode, id: uuidv4(), position }],
      }));
    }
  },

  deleteNode: id =>
    // We also need to delete the edges connected to the node that gets deleted
    set(state => ({
      nodes: state.nodes.filter(node => node.id !== id),
      edges: state.edges.filter(
        edge => edge.source !== id && edge.target !== id
      ),
    })),

  addEdge: edge => set(state => ({ edges: [...state.edges, edge] })),

  deleteEdge: id =>
    set(state => ({
      edges: state.edges.filter(edge => edge.id !== id),
    })),

  // TODO: Make this action more robust efficient
  updateConnectionLine: partialConnectionLine =>
    set(state => ({
      connectionLine: partialConnectionLine
        ? {
            type: state.connectionLine?.type || EdgeType.Straight,
            sourcePort: {
              position: state.connectionLine?.sourcePort?.position || {
                x: 0,
                y: 0,
              },
              placement:
                state.connectionLine?.sourcePort?.placement ||
                PortPlacement.RIGHT,
            },
            targetPort: {
              position: state.connectionLine?.targetPort?.position || {
                x: 0,
                y: 0,
              },
              placement:
                state.connectionLine?.targetPort?.placement ||
                PortPlacement.LEFT,
            },
            ...partialConnectionLine,
          }
        : null,
    })),

  setAlignmentGuides: guides => set({ alignmentGuides: guides }),

  createNodeGroup: nodeGroup =>
    set(state => ({ nodeGroups: [...state.nodeGroups, nodeGroup] })),

  updateNodeGroup: (id, nodeGroup) =>
    set(state => ({
      nodeGroups: state.nodeGroups.map(group =>
        group.id === id ? { ...group, ...nodeGroup } : group
      ),
    })),

  deleteNodeGroup: id =>
    set(state => ({
      nodeGroups: state.nodeGroups.filter(group => group.id !== id),
    })),

  saveLocalState: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(get()));
  },

  importData: data => {
    set(state => ({
      ...state,
      position: data.position,
      zoom: data.zoom,
      nodes: data.nodes as Node[],
      edges: data.edges as Edge[],
    }));

    get().saveLocalState();
  },
}));

export default useBoardStore;
