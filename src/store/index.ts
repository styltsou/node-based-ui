import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

import type { Node, Edge } from '../types';
import { MIN_ZOOM, MAX_ZOOM } from '../constants';

interface CanvasState {
  position: {
    x: number;
    y: number;
  };
  zoom: number;
  isInteractive: boolean;
  nodes: Node[];
  edges: Edge[];
}

interface CanvasActions {
  updatePosition: (position: CanvasState['position']) => void;
  updateZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  toggleInteractivity: () => void;
  resetPanning: () => void;
  resetZoom: () => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNodePosition: (id: string, position: Node['position']) => void;
  deleteNode: (id: string) => void;
}

const useBoardStore = create<CanvasState & CanvasActions>()(
  persist(
    (set, get) => ({
      position: { x: 0, y: 0 },
      zoom: 1,
      isInteractive: false,
      nodes: [],
      edges: [],

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

      resetPanning: () => set({ position: { x: 0, y: 0 } }),
      resetZoom: () => set({ zoom: 1 }),

      addNode: node => set(state => ({ nodes: [...state.nodes, node] })),
      addEdge: edge => set(state => ({ edges: [...state.edges, edge] })),

      updateNodePosition: (id, position) =>
        set(state => ({
          nodes: state.nodes.map(node =>
            node.id === id ? { ...node, position } : node
          ),
        })),

      deleteNode: id =>
        set(state => ({ nodes: state.nodes.filter(node => node.id !== id) })),
    }),
    {
      name: 'global-store',
      storage: createJSONStorage<StateStorage>(() => localStorage),
    }
  )
);

export default useBoardStore;
