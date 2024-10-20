import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Node, Edge, NodeGroup } from '../types';
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
  createNodeGroup: (nodeGroup: NodeGroup) => void;
  updateNodeGroup: (id: string, nodeGroup: NodeGroup) => void;
  deleteNodeGroup: (id: string) => void;
  saveLocalState: () => void;
  loadLocalState: () => void;
}

const STORAGE_KEY = 'global-store';

const initialState: CanvasState = {
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

const hydrateState = (initialState: CanvasState) => {
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
    set(state => ({ nodes: [...state.nodes, node] }));

    console.log('New state to be saved');
    console.log(get());

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
}));

export default useBoardStore;
