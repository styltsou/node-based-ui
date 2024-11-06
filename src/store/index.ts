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

// Define actions for the properties that support history
type AddNodeAction = {
  type: 'ADD_NODE';
  payload: Node;
};

type DeleteNodeAction = {
  type: 'DELETE_NODE';
  payload: { node: Node; edges: Edge[] };
};

type AddEdgeAction = {
  type: 'ADD_EDGE';
  payload: Edge;
};

type DeleteEdgeAction = {
  type: 'DELETE_EDGE';
  payload: Edge;
};

type ChangeEdgeTypeAction = {
  type: 'CHANGE_EDGE_TYPE';
  payload: {
    id: string;
    oldType: EdgeType;
    newType: EdgeType;
  };
};

type HistoryAction =
  | AddNodeAction
  | DeleteNodeAction
  | AddEdgeAction
  | DeleteEdgeAction
  | ChangeEdgeTypeAction;

interface CanvasState {
  position: {
    x: number;
    y: number;
  };
  zoom: number;
  isInteractive: boolean;

  nodes: Node[];
  renderedNodes: Node[];
  edges: Edge[];
  renderedEdges: Edge[];
  globalEdgeType: EdgeType | null;
  lastAssignedEdgeType: EdgeType | null;
  connectionLine: ConnectionLine | null;
  copiedNode: Node | null;
  nodeGroups: NodeGroup[];

  alignmentGuides: AlignmentGuide[];
  areHorizontalGuidesActive: boolean;
  areVerticalGuidesActive: boolean;

  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
}

interface CanvasActions {
  createUndoableAction: () => void;
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
  setRenderedNodes: (nodes: Node[]) => void;
  updateNodePosition: (id: string, position: Node['position']) => void;
  updateNodeSize: (id: string, size: Node['size']) => void;
  toggleNodeLock: (id: string) => void;
  copyNode: (node: Node) => void;
  pasteNode: (position: Node['position']) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  setRenderedEdges: (edges: Edge[]) => void;
  deleteEdge: (id: string) => void;
  changeEdgeType: (id: string, type: EdgeType) => void;
  setGlobalEdgeType: (edgeType: EdgeType | null) => void;
  updateConnectionLine: (partialConnectionLine: ConnectionLine | null) => void;
  setLastAssignedEdgeType: (edgeType: EdgeType | null) => void;
  setAlignmentGuides: (guides: AlignmentGuide[]) => void;
  createNodeGroup: (nodeGroup: NodeGroup) => void;
  updateNodeGroup: (id: string, nodeGroup: NodeGroup) => void;
  deleteNodeGroup: (id: string) => void;
  importData: (data: z.infer<typeof ImportSchema>) => void;
  saveLocalState: () => void;
  pushToUndoStack: (action: HistoryAction) => void;
  undo: () => void;
  redo: () => void;
}

const STORAGE_KEY = 'global-store';

const initialState: Omit<
  CanvasState,
  'alignmentGuides' | 'connectionLine' | 'undoStack' | 'redoStack'
> = {
  position: { x: 0, y: 0 },
  zoom: 1,
  isInteractive: true,
  areVerticalGuidesActive: false,
  areHorizontalGuidesActive: false,
  nodes: [],
  renderedNodes: [],
  copiedNode: null,
  edges: [],
  renderedEdges: [],
  globalEdgeType: null,
  lastAssignedEdgeType: null,
  nodeGroups: [],
};

// TODO: Incorporate the pushToUndoStack action in the other actions
// TODO: Central place for managing which state is persisted where (local, session, non-persisted)
// TODO: fix the other stuff here regarding state
// 1. I want to have more flexibility in which state is saved on local storage
// 2. I also want to add support for storing certain state on session storage

const hydrateStateFromLocalStorage = (
  initialState: Omit<
    CanvasState,
    | 'alignmentGuides'
    | 'connectionLine'
    | 'copiedNode'
    | 'undoStack'
    | 'redoStack'
  >
) => {
  const localState = localStorage.getItem(STORAGE_KEY);

  if (localState) {
    const parsedState = JSON.parse(localState);
    return parsedState;
  } else {
    // TODO: Save only the necessary state on local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
};

// const hydrateStateFromSessionStorage = () => {
//   const sessionState = sessionStorage.getItem(STORAGE_KEY);
// };

function performUndo(
  state: CanvasState,
  action: HistoryAction
): Partial<CanvasState> {
  switch (action.type) {
    case 'ADD_NODE':
      return {
        nodes: state.nodes.filter(node => node.id !== action.payload.id),
      };
    case 'DELETE_NODE':
      return {
        nodes: [...state.nodes, action.payload.node],
        edges: [...state.edges, ...action.payload.edges],
      };
    case 'ADD_EDGE':
      return {
        edges: state.edges.filter(edge => edge.id !== action.payload.id),
      };
    case 'DELETE_EDGE':
      return { edges: [...state.edges, action.payload] };
    case 'CHANGE_EDGE_TYPE':
      return {
        edges: state.edges.map(edge =>
          edge.id === action.payload.id
            ? { ...edge, type: action.payload.oldType }
            : edge
        ),
      };
  }
}

function performRedo(
  state: CanvasState,
  action: HistoryAction
): Partial<CanvasState> {
  switch (action.type) {
    case 'ADD_NODE':
      return { nodes: [...state.nodes, action.payload] };
    case 'DELETE_NODE':
      return {
        nodes: state.nodes.filter(node => node.id !== action.payload.node.id),
        edges: state.edges.filter(
          edge =>
            edge.source !== action.payload.node.id &&
            edge.target !== action.payload.node.id
        ),
      };
    case 'ADD_EDGE':
      return { edges: [...state.edges, action.payload] };
    case 'DELETE_EDGE':
      return {
        edges: state.edges.filter(edge => edge.id !== action.payload.id),
      };
    case 'CHANGE_EDGE_TYPE':
      return {
        edges: state.edges.map(edge =>
          edge.id === action.payload.id
            ? { ...edge, type: action.payload.newType }
            : edge
        ),
      };
  }
}

const useBoardStore = create<CanvasState & CanvasActions>((set, get) => ({
  ...hydrateStateFromLocalStorage(initialState),
  alignmentGuides: [],
  connectionLine: null,
  copiedNode: null,
  undoStack: [],
  redoStack: [],

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
      node.ports = [
        PortPlacement.TOP,
        PortPlacement.RIGHT,
        PortPlacement.BOTTOM,
        PortPlacement.LEFT,
      ];

    get().pushToUndoStack({ type: 'ADD_NODE', payload: node });

    set(state => ({ nodes: [...state.nodes, node] }));

    localStorage.setItem('global-store', JSON.stringify(get()));
  },

  setRenderedNodes: nodes => set({ renderedNodes: nodes }),
  setRenderedEdges: edges => set({ renderedEdges: edges }),

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

  deleteNode: id => {
    const nodeToDelete = get().nodes.find(node => node.id === id);

    if (nodeToDelete) {
      const edgesToDelete = get().edges.filter(
        edge => edge.source === id || edge.target === id
      );

      // We also need to delete the edges connected to the node that gets deleted
      get().pushToUndoStack({
        type: 'DELETE_NODE',
        payload: { node: nodeToDelete, edges: edgesToDelete },
      });

      set(state => ({
        nodes: state.nodes.filter(node => node.id !== id),
        edges: state.edges.filter(edge => !edgesToDelete.includes(edge)),
      }));
    }
  },

  addEdge: edge => {
    get().pushToUndoStack({ type: 'ADD_EDGE', payload: edge });
    set(state => ({ edges: [...state.edges, edge] }));
  },

  deleteEdge: id => {
    const edgeToDelete = get().edges.find(edge => edge.id === id);

    if (edgeToDelete) {
      get().pushToUndoStack({ type: 'DELETE_EDGE', payload: edgeToDelete });
      set(state => ({
        edges: state.edges.filter(edge => edge.id !== id),
      }));
    }
  },

  changeEdgeType: (id, type) => {
    const edgeToChange = get().edges.find(edge => edge.id === id);

    if (edgeToChange) {
      get().pushToUndoStack({
        type: 'CHANGE_EDGE_TYPE',
        payload: { id, oldType: edgeToChange.type, newType: type },
      });

      set(state => ({
        edges: state.edges.map(edge =>
          edge.id === id ? { ...edge, type } : edge
        ),
      }));
    }
  },

  setGlobalEdgeType: edgeType => set({ globalEdgeType: edgeType }),

  updateConnectionLine: connectionLine =>
    set(state => ({
      connectionLine: connectionLine
        ? { ...state.connectionLine, ...connectionLine }
        : null,
    })),

  setLastAssignedEdgeType: edgeType => set({ lastAssignedEdgeType: edgeType }),

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

  // TODO: Save only the necessary state on local storage
  saveLocalState: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(get()));
  },

  pushToUndoStack: action =>
    set(state => ({ undoStack: [...state.undoStack, action] })),

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return;

    const actionToUndo = undoStack.pop()!;
    const newRedoStack = [...redoStack, actionToUndo];

    set(state => {
      const newState = performUndo(state, actionToUndo);
      return {
        ...newState,
        undoStack: undoStack,
        redoStack: newRedoStack,
      };
    });
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return;

    const actionToRedo = redoStack.pop()!;
    const newUndoStack = [...undoStack, actionToRedo];

    set(state => {
      const newState = performRedo(state, actionToRedo);
      return {
        ...newState,
        undoStack: newUndoStack,
        redoStack: redoStack,
      };
    });
  },
}));

export default useBoardStore;
