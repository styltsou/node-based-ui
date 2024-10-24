import { create } from 'zustand';

interface EdgeVisualizationState {
  selectedEdgeId: string | null;
  showRulers: boolean;
  showGridBounds: boolean;
  showGridSlices: boolean;
  showConnectionPoints: boolean;
  showPossiblePaths: boolean;
  showStepEdge: boolean;
  showSmoothEdge: boolean;
}

interface EdgeVisualizationActions {
  setSelectedEdgeId: (id: string) => void;
  clearSelectedEdge: () => void;
  toggleRulers: () => void;
  toggleGridBounds: () => void;
  toggleGridSlices: () => void;
  toggleConnectionPoints: () => void;
  togglePossiblePaths: () => void;
  toggleStepEdge: () => void;
  toggleSmoothEdge: () => void;
}

const useEdgeVisualizationStore = create<
  EdgeVisualizationState & EdgeVisualizationActions
>(set => ({
  selectedEdgeId: null,
  showRulers: false,
  showGridBounds: false,
  showGridSlices: false,
  showConnectionPoints: false,
  showPossiblePaths: false,
  showStepEdge: false,
  showSmoothEdge: false,

  setSelectedEdgeId: (id: string) => set({ selectedEdgeId: id }),

  clearSelectedEdge: () => set({ selectedEdgeId: null }),

  toggleRulers: () => set(state => ({ showRulers: !state.showRulers })),

  toggleGridBounds: () =>
    set(state => ({ showGridBounds: !state.showGridBounds })),

  toggleGridSlices: () =>
    set(state => ({ showGridSlices: !state.showGridSlices })),

  toggleConnectionPoints: () =>
    set(state => ({ showConnectionPoints: !state.showConnectionPoints })),

  togglePossiblePaths: () =>
    set(state => ({ showPossiblePaths: !state.showPossiblePaths })),

  toggleStepEdge: () => set(state => ({ showStepEdge: !state.showStepEdge })),

  toggleSmoothEdge: () =>
    set(state => ({ showSmoothEdge: !state.showSmoothEdge })),
}));

export default useEdgeVisualizationStore;
