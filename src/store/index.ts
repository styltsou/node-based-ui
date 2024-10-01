import { create } from 'zustand';
import type { Node, Edge } from '../types';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

interface BoardState {
  canvasPosition: {
    x: number;
    y: number;
  };
  canvasZoom: number;
  nodes: Node[];
  edges: Edge[];
}

interface BoardActions {
  updateCanvasPosition: (position: BoardState['canvasPosition']) => void;
  updateCanvasZoom: (zoom: number) => void;
  resetPanning: () => void;
  resetZoom: () => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNodePosition: (id: string, position: Node['position']) => void;
}

const useBoardStore = create<BoardState & BoardActions>()(
  persist(
    set => ({
      canvasPosition: { x: 0, y: 0 },
      canvasZoom: 1,
      nodes: [],
      edges: [],
      updateCanvasPosition: position => set({ canvasPosition: position }),
      updateCanvasZoom: zoom => {
        console.log('call update canvas zoom');
        set({ canvasZoom: zoom });
      },
      resetPanning: () => set({ canvasPosition: { x: 0, y: 0 } }),
      resetZoom: () => set({ canvasZoom: 1 }),
      addNode: node => set(state => ({ nodes: [...state.nodes, node] })),
      addEdge: edge => set(state => ({ edges: [...state.edges, edge] })),
      updateNodePosition: (id, position) =>
        set(state => ({
          nodes: state.nodes.map(node =>
            node.id === id ? { ...node, position } : node
          ),
        })),
    }),
    {
      name: 'global-store',
      storage: createJSONStorage<StateStorage>(() => localStorage),
    }
  )
);

export default useBoardStore;
